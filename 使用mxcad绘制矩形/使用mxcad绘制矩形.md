# 使用mxcad绘制矩形

在mxcad中绘制矩形，本质上还是绘制多段线

下面我们就主要讲解一下如何用mxcad中的多段线去绘制一个支持倒角和圆角的矩形

在autocad中绘制一个矩形会通过一些命令或者输入关键字来确定是否需要倒角圆角或者通过面积, 宽高去绘制。

那么下面我们讲模仿autocad的绘制矩形的交互绘制, 完整的实现一个动态交互式的绘制一个矩形出来。

## 命令交互初始化工作

对于命令交互, 我们用尽量简洁的方式实现, 代码如下:

```ts
import { MxFun } from "mxdraw"
const input = document.createElement("input")
const tip = document.createElement("div")
const dis = document.createElement("div")
document.body.appendChild(tip)
document.body.appendChild(input)
document.body.appendChild(dis)

// 命令交互
input.addEventListener("keydown", (e: KeyboardEvent) => {
    // 讲输入框的值和按键信息传递给mxdraw中进行处理
    MxFun.setCommandLineInputData((e.target as HTMLInputElement).value, e.keyCode);
    // 回车清空输入
    if(e.keyCode === 13) (e.target as HTMLInputElement).value = ""
})

// 接收提示信息和命令信息
MxFun.listenForCommandLineInput(({ msCmdTip, msCmdDisplay, msCmdText }) => {
    tip.innerText = msCmdTip + msCmdText
    dis.innerText = msCmdDisplay
 }
);
```

## 绘制矩形

首先矩形一般由两个对角点来绘制出完整的矩形, 所以，我们第一步自然是获取对角点。

通过mxcad提供的获取用户输入的一些类:[MxCADUiPrPoint](https://mxcadx.gitee.io/mxcad_docs/api/classes/2d.MxCADUiPrPoint.html#class-mxcaduiprpoint)获取点、[MxCADUiPrDist](https://mxcadx.gitee.io/mxcad_docs/api/classes/2d.MxCADUiPrDist.html)获取距离、[MxCADUiPrInt](https://mxcadx.gitee.io/mxcad_docs/api/classes/2d.MxCADUiPrInt.html#class-mxcaduiprint)获取数字、[MxCADUiPrKeyWord](https://mxcadx.gitee.io/mxcad_docs/api/classes/2d.MxCADUiPrKeyWord.html#class-mxcaduiprkeyword)获取关键词 来交互式的绘制矩形

我们可以用`MxCADUiPrPoint`获取到用户点击的对角点, 以及其他的几个类获取到用户的不同输入, 比如距离、数字、关键词等等。

根据这些用户输入, 我们来一个动态可交互的确认一个矩形如何绘制

绘制矩形主要分为以下几个步骤:

1.先获取第一个对角点

2.然后看看用户是否输入了关键词， 根据关键词获取对应的参数， 比如获取倒角距离，圆角半径等等 然后重新回到第一步重新获取角点

3.在有了第一个角度后，进行动态绘制矩形

4.获取第二个对角点, 生成矩形并绘制

其中一些关键词可能导致不同的绘制方式, 每个关键词对应不同处理。

首先获取对角点的代码比较简单，代码如下:

```ts
import { MxCADUiPrPoint } from "mxcad"
const getPoint = new MxCADUiPrPoint();
const pt1 = await getPoint.go()
console.log("对角点", pt1)
```

然后关键词就算有一些简单必要的格式:
首先如果不需要给用户任何提示 可以直接写关键词例如:`A B`用空格分隔每个关键词
如果需要对应的说明提示则需要加`[]`然后里面的内容格式则是`提示(关键词)`,最后用`/`分割每个关键词
例如:`[倒角(C)/圆角(F)/宽度(W)]`

```ts
getPoint.setKeyWords("[倒角(C)/圆角(F)/宽度(W)]")
// 这里是点击， 但是它也可能没有点击，而是输入了关键词，这时返回的是null
await getPoint.go()
// 这里可以直接判断是否输入了某个关键词
if(getPoint.isKeyWordPicked("C"))

```

然后我们对角点,倒角距离，圆半径这些参数来确定矩形的坐标点了。
首先最普通的矩形坐标点，我们通过两个对角点生成:

```ts
import { McGePoint3d } from "mxcad"
const getRectPoints = (pt1: McGePoint3d, pt3: McGePoint3d): McGePoint3d[] => {
    const pt2 = new McGePoint3d(pt1.x, pt3.y, pt1.z);
    const pt4 = new McGePoint3d(pt3.x, pt1.y, pt3.z);
    return [pt1, pt2, pt3, pt4];
};
```

有了四个点，这个时候我们要考虑如果要对矩形进行倒角，我们就需要8个坐标点构成
也就是根据xy轴倒角的距离去做偏移，把一个坐标生成两个偏移后坐标, 代码如下:

```ts
// 计算第二个对角点相对于第一个对角点的象限位置, 分别返回四象限
const getQuadrant = (pt1: McGePoint3d, pt3: McGePoint3d) => {
    return [(pt3.x >= pt1.x && pt3.y >= pt1.y), (pt3.x < pt1.x && pt3.y >= pt1.y), (pt3.x < pt1.x && pt3.y < pt1.y), (pt3.x >= pt1.x && pt3.y < pt1.y)] as [boolean, boolean, boolean, boolean]
}

// 根据矩形的坐标点和两个倒角距离生成8个坐标点的多边形
function calculateRoundedRectangleVertices(points: McGePoint3d[], chamferDistance1: number, chamferDistance2: number) {
    // 首先如果倒角距离为0， 则直接返回矩形坐标点
    if (chamferDistance1 === 0 && chamferDistance2 === 0) return points
    const [pt1, pt2, pt3, pt4] = points

    // 然后计算矩形宽高, 与倒角距离进行比较，如果不能对矩形倒角就返回矩形坐标点
    const width = pt1.distanceTo(pt4)
    const height = pt1.distanceTo(pt2)
    if ((width - Math.abs(chamferDistanceX) * 2) <= 0) return points
    if ((height - Math.abs(chamferDistanceY) * 2) <= 0) return points

    // 为了确保矩形偏移生成的倒角点是正确的, 需要根据不都的象限做一些偏移取反处理
    const [_, isPt3InQuadrant2, isPt3InQuadrant3, isPt3InQuadrant4] = getQuadrant(pt1, pt3)
    const chamferDistanceX = isPt3InQuadrant2 || isPt3InQuadrant3 ? -chamferDistance1 : chamferDistance1;
    const chamferDistanceY = isPt3InQuadrant3 || isPt3InQuadrant4 ? -chamferDistance2 : chamferDistance2;

    // 计算出正确的xy倒角偏移距离，就开始对矩形的四个点在x或者y上进行偏移
    const chamferedPt1 = new McGePoint3d(pt1.x + chamferDistanceX, pt1.y, pt1.z);
    const chamferedPt2 = new McGePoint3d(pt1.x, pt1.y + chamferDistanceY, pt1.z);
    const chamferedPt3 = new McGePoint3d(pt2.x, pt2.y - chamferDistanceY, pt2.z);
    const chamferedPt4 = new McGePoint3d(pt2.x + chamferDistanceX, pt2.y, pt2.z);
    const chamferedPt5 = new McGePoint3d(pt3.x - chamferDistanceX, pt3.y, pt3.z);
    const chamferedPt6 = new McGePoint3d(pt3.x, pt2.y - chamferDistanceY, pt3.z);
    const chamferedPt7 = new McGePoint3d(pt4.x, pt4.y + chamferDistanceY, pt4.z);
    const chamferedPt8 = new McGePoint3d(pt4.x - chamferDistanceX, pt4.y, pt4.z);
    const chamferedPolygon = [
        chamferedPt1,
        chamferedPt2,
        chamferedPt3,
        chamferedPt4,
        chamferedPt5,
        chamferedPt6,
        chamferedPt7,
        chamferedPt8,
    ];
    return chamferedPolygon;
}
```

然后我们就要考虑圆角了， 在上面我们已知矩形倒角后的坐标集合, 那么我们把相当于要把矩形倒角点的四个角从原来的直线变成圆弧。
在cad中多段线去绘制圆弧我们只需要计算它的凸度就可以形成圆弧了，现在已经知道矩形的倒角连成的直线，那么也就知道了圆弧的开始点和结束点。
我们根据mxcad中提供的一些运算方法计算出对应的凸度:

```ts
import { MxCADUtility } from "mxcad"
// 根据第一个点和下一个点和表示弧切线的一个向量得到弧中点位置, 最后通过MxCADUtility.calcBulge计算出凸度
function CMxDrawPolylineDragArcDraw_CalcArcBulge(firstPoint: McGePoint3d, nextPoint: McGePoint3d, vecArcTangent: McGeVector3d): number {
    // 如果是同一个点，那凸度是0
    if (firstPoint.isEqualTo(nextPoint))
        return 0.0;
    // 先得到两点之间的中点
    let midPt = firstPoint.c().addvec(nextPoint.c().sub(firstPoint).mult(0.5));

    // 从 firstPoint 指向 nextPoint 的矢量。然后，它绕 Z 轴旋转了90度
    let vecMid = nextPoint.c().sub(firstPoint);
    vecMid.rotateBy(Math.PI / 2.0, McGeVector3d.kZAxis);

    // 然后中点和其延vecMid向量移动的一个新点构成的一条直线
    let tmpMidLine = new McDbLine(midPt, midPt.c().addvec(vecMid));

    // 然后讲vecArcTangent弧切线向量绕 Z 轴旋转了90度得到一个新向量
    let vecVertical: McGeVector3d = vecArcTangent.c();
    vecVertical.rotateBy(Math.PI / 2.0, McGeVector3d.kZAxis);

    // 第一个点和其vecArcTangent向z轴旋转了90度的新向量构成一条直线
    let tmpVerticalLine = new McDbLine(firstPoint, firstPoint.c().addvec(vecVertical));

    // 然后得tmpMidLine和tmpVerticalLine的交点
    let aryPoint: McGePoint3dArray = tmpMidLine.IntersectWith(tmpVerticalLine, McDb.Intersect.kExtendBoth);
    if (aryPoint.isEmpty())
        return 0.0;

    // 根据交点，就可以知道这个弧的圆心了
    let arcCenPoint = aryPoint.at(0);

    // 计算出半径
    let dR = arcCenPoint.distanceTo(firstPoint);

    // 然会对vecMid向量进行归一化和缩放, 乘以半径 dR
    vecMid.normalize();
    vecMid.mult(dR);

    // 最终计算出两个弧不同方向上的中点坐标, 根据两个中点与给定方向 vecArcTangent 的夹角，选择最接近的中点。
    let arcMidPt1 = arcCenPoint.c().addvec(vecMid);
    let arcMidPt2 = arcCenPoint.c().subvec(vecMid);
    let vecArcDir1 = arcMidPt1.c().sub(firstPoint);
    let vecArcDir2 = arcMidPt2.c().sub(firstPoint);
    let arcMidPt = arcMidPt1;
    if (vecArcDir1.angleTo1(vecArcTangent) > vecArcDir2.angleTo1(vecArcTangent)) {
        arcMidPt = arcMidPt2;
    }
    // 最后用mxcad中提供计算凸度的方法计算出凸度
    return MxCADUtility.calcBulge(firstPoint, arcMidPt, nextPoint).val;
}
```

那么有了凸度,我们就可以为多义线新增具有凸度的点, 两点相连就形成了一个圆弧,具体代码如下:

```ts
import { McDbPolyline } from "mxcad"
const pl = new McDbPolyline()
// bulge就算凸度值 通过给多段线添加两个点就形成了一个圆弧
pl.addVertexAt(startPoint, bulge)
pl.addVertexAt(endPoint)
```

通过上述关键代码的讲解,
结合如下完整绘制矩形的交互式代码阅读可以更好的理解mxcad中绘制矩形的具体实现方式
下面结合上述步骤描述实现了一个包含倒角/圆角/面积/尺寸四种不同的绘制方式,形成了根据用户的输入以不同方式绘制矩形的功能,
代码如下:

```ts
import { McDb, McDbLine, McDbPolyline, McGePoint3d, McGePoint3dArray, McGeVector3d, MxCADUiPrDist, MxCADUiPrInt, MxCADUiPrKeyWord, MxCADUiPrPoint,  MxCADUtility, MxCpp, createMxCad } from "mxcad"
async function drawRectang() {
    const getPoint = new MxCADUiPrPoint();
    // 倒角距离
    let chamfer1Length = 0
    let chamfer2Length = 0
    // 圆角
    let filletRadius = 0

    // 宽度
    let width = 1
    // 面积
    let area = 200
    let rectWidth = 0
    let rectLength = 0;
    let rotationAngle = 0
    let type: "default" | "chamfer" | "angleRounded" = "default"
    while (true) {
        // 获取两点间距离
        const getLength = async (pt1Msg: string) => {
            let getWidth = new MxCADUiPrDist();
            getWidth.setMessage(pt1Msg);
            let dWVal = await getWidth.go();
            if (!dWVal) throw "error getLength"
            return getWidth.value();
        }
        // 交互初始化
        getPoint.setUserDraw(() => { })
        getPoint.clearLastInputPoint()
        // 提示用户点击第一个点
        getPoint.setMessage("\n指定第一个角点");
        getPoint.setKeyWords("[倒角(C)/圆角(F)/宽度(W)]")
        const pt1CAD = await getPoint.go()
        // 实例化一个多段线
        let pl = new McDbPolyline();

        // 检查命令输入框是否输入了对于的关键词
        try {
            if (getPoint.isKeyWordPicked("C")) {
                // 获取倒角的距离
                chamfer1Length = await getLength("\n指定第一个倒角距离:")
                chamfer2Length = await getLength("\n指定第二个倒角距离")
                // 下次绘制将变成倒角绘制模式
                type = "chamfer"

                // 退出本次循环 进入新一轮的绘制交互
                continue;
            }
            if (getPoint.isKeyWordPicked("F")) {
                filletRadius = await getLength("\n指定矩形的圆角半径")
                type = "angleRounded"
                continue;
            }
            if (getPoint.isKeyWordPicked("W")) {
                width = await getLength("\n指定矩形的线宽")
                continue;
            }
        } catch (e) {
            break;
        }
        // 有了这些必要的信息, 我们就可以根据一些算法，就可以得到矩形的所有坐标点了
        const getRect = (pt1: McGePoint3d, pt3: McGePoint3d) => {
            // 重新实例化
            pl = new McDbPolyline()
            // 正常的矩形坐标
            const rectPoint = getRectPoints(pt1, pt3)

            let points = rectPoint
            if (type === "chamfer") {
                // 倒角的矩形
                points = calculateRoundedRectangleVertices(rectPoint, chamfer1Length, chamfer2Length)
            }
            if (type === "angleRounded" && filletRadius !== 0) {
                // 圆角后的矩形, 根据倒角的矩形坐标去计算
                points = calculateRoundedRectangleVertices(getRectPoints(pt1, pt3), filletRadius, filletRadius)
                // 四个象限
                const [_, isPt3InQuadrant2, isPt3InQuadrant3, isPt3InQuadrant4] = getQuadrant(pt1, pt3)
                if (points.length === 8) {
                    const addArc = (startPoint: McGePoint3d, endPoint: McGePoint3d, key?: McGeVector3d) => {
                        let vecArcTangent: McGeVector3d = new McGeVector3d(key);
                        const bulge = CMxDrawPolylineDragArcDraw_CalcArcBulge(startPoint, endPoint, vecArcTangent)
                        pl.addVertexAt(startPoint, bulge)
                        pl.addVertexAt(endPoint, 0)
                    }
                    const vec1 = new McGeVector3d(-1, 0)
                    const vec2 = new McGeVector3d(0, 1)
                    const vec3 = new McGeVector3d(1, 0)
                    const vec4 = new McGeVector3d(0, -1)
                    if (isPt3InQuadrant4) {
                        vec2.y = -1
                        vec3.x = 1
                        vec4.y = 1
                    }
                    if (isPt3InQuadrant2) {
                        vec1.x = 1
                        vec2.y = 1
                        vec3.x = -1
                        vec4.y = -1
                    }
                    if (isPt3InQuadrant3) {
                        vec1.x = 1
                        vec2.y = -1
                        vec3.x = -1
                        vec4.y = 1
                    }
                    addArc(points[0], points[1], vec1)

                    addArc(points[2], points[3], vec2)

                    addArc(points[4], points[5], vec3)

                    addArc(points[6], points[7], vec4)
                } else {
                    points.forEach((pt) => {
                        pl.addVertexAt(pt, 0);
                    })
                }

            } else {
                points.forEach((pt) => {
                    pl.addVertexAt(pt, 0, width, width);
                })

            }
            pl.isClosed = true;
            pl.constantWidth = width;
            return pl
        }
        const userDrawPoint1Rect = (currentPoint: McGePoint3d, pWorldDraw) => {
            if (!pt1CAD) return
            const pt1 = pt1CAD
            const pt3 = currentPoint
            pl = getRect(pt1, pt3)
            pWorldDraw.drawMcDbEntity(pl)
        }
        getPoint.setUserDraw(userDrawPoint1Rect)
        const run = async () => {
            getPoint.setMessage("\n指定另一个角点");
            getPoint.setKeyWords("[面积(A)/尺寸(D)]")
            let pt2CAD = await getPoint.go()
            const userDrawPoint2Rect = (currentPoint: McGePoint3d, pWorldDraw) => {
                if (!pt1CAD) return
                const [isPt3InQuadrant1, isPt3InQuadrant2, isPt3InQuadrant3, isPt3InQuadrant4] = getQuadrant(pt1CAD, currentPoint)
                if (isPt3InQuadrant1) {
                    pt2CAD = new McGePoint3d(pt1CAD.x + rectWidth, pt1CAD.y + rectLength)
                }
                if (isPt3InQuadrant2) {
                    pt2CAD = new McGePoint3d(pt1CAD.x - rectWidth, pt1CAD.y + rectLength)
                }
                if (isPt3InQuadrant3) {
                    pt2CAD = new McGePoint3d(pt1CAD.x - rectWidth, pt1CAD.y - rectLength)
                }
                if (isPt3InQuadrant4) {
                    pt2CAD = new McGePoint3d(pt1CAD.x + rectWidth, pt1CAD.y - rectLength)
                }
                if (!pt2CAD) return
                pl = getRect(pt1CAD, pt2CAD)
                pWorldDraw.drawMcDbEntity(pl)
            }

            if (getPoint.isKeyWordPicked("A")) {
                if (!pt1CAD) return
                getPoint.setUserDraw(() => { })
                const getInt = new MxCADUiPrInt()
                getInt.setMessage("输入当前单位计算的矩形面积<" + area + ">")
                const _area = await getInt.go()
                if (!_area) return
                area = _area
                const getKey = new MxCADUiPrKeyWord()
                getKey.setMessage("计算矩形标注时的依据")
                getKey.setKeyWords("[长度(L)/宽度(W)]")
                const key = await getKey.go()
                if (key === null) return
                if (key === "w") {
                    rectWidth = await getLength("输入矩形宽度")
                    rectLength = area / rectWidth
                }
                else {
                    rectLength = await getLength("输入矩形长度")
                    rectWidth = area / rectLength
                }
                pt2CAD = new McGePoint3d(pt1CAD.x + rectWidth, pt1CAD.y + rectLength)
                pl = getRect(pt1CAD, pt2CAD)
                MxCpp.getCurrentMxCAD().drawEntity(pl)
            }
            else if (getPoint.isKeyWordPicked("D")) {
                try {
                    rectWidth = await getLength("指定矩形宽度")
                    rectLength = await getLength("指定矩形宽度")
                } catch (e) {
                    return
                }
                getPoint.clearLastInputPoint()
                getPoint.setUserDraw(userDrawPoint2Rect)
                const is = await run()
                if (typeof is === "undefined") return
            }
            else if (pt2CAD) {
                getPoint.drawReserve()
            }
            return true
        }
        const is = await run()
        if (typeof is === "undefined") {
            break;
        }
    }
}
```

本文提供的源码下载地址: https://gitee.com/mxcadx/mxdraw-article/tree/master/使用mxcad绘制矩形/demo.zip
