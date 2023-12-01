import { McDb, McDbLine, McDbPolyline, McGePoint3d, McGePoint3dArray, McGeVector3d, MxCADUiPrDist, MxCADUiPrInt, MxCADUiPrKeyWord, MxCADUiPrPoint,  MxCADUtility, MxCpp, createMxCad } from "mxcad"
import { MxFun } from "mxdraw"


window.onload = async () => {
    const input = document.createElement("input")
    input.addEventListener("keydown", (e: KeyboardEvent) => {
        // 设置传输命令行消息数据
        MxFun.setCommandLineInputData((e.target as HTMLInputElement).value, e.keyCode);
        if (e.keyCode === 13) (e.target as HTMLInputElement).value = ""
    })

    const tip = document.createElement("div")
    const dis = document.createElement("div")
    MxFun.listenForCommandLineInput(({ msCmdTip, msCmdDisplay, msCmdText }) => {
        tip.innerText = msCmdTip + msCmdText
        dis.innerText = msCmdDisplay
    }
    );

    document.body.appendChild(tip)
    document.body.appendChild(input)
    document.body.appendChild(dis)

    const mode = "SharedArrayBuffer" in window ? "2d" : "2d-st"
    await createMxCad({
        canvas: "#mxcad",
        locateFile: (fileName) => {
            return new URL(`/node_modules/mxcad/dist/wasm/${mode}/${fileName}`, import.meta.url).href
        },
        fileUrl: new URL("../public/empty_template.mxweb", import.meta.url).href,
        fontspath: new URL("../node_modules/mxcad/dist/fonts", import.meta.url).href,
    })
}
const getRectPoints = (pt1: McGePoint3d, pt3: McGePoint3d): McGePoint3d[] => {
    const pt2 = new McGePoint3d(pt1.x, pt3.y, pt1.z);
    const pt4 = new McGePoint3d(pt3.x, pt1.y, pt3.z);
    return [pt1, pt2, pt3, pt4];
};
const getQuadrant = (pt1: McGePoint3d, pt3: McGePoint3d) => {
    return [(pt3.x >= pt1.x && pt3.y >= pt1.y), (pt3.x < pt1.x && pt3.y >= pt1.y), (pt3.x < pt1.x && pt3.y < pt1.y), (pt3.x >= pt1.x && pt3.y < pt1.y)] as [boolean, boolean, boolean, boolean]
}
function calculateRoundedRectangleVertices(points: McGePoint3d[], chamferDistance1: number, chamferDistance2: number) {
    if (chamferDistance1 === 0 && chamferDistance2 === 0) return points
    const [pt1, pt2, pt3, pt4] = points

    const width = pt1.distanceTo(pt4)
    const height = pt1.distanceTo(pt2)
    const [_, isPt3InQuadrant2, isPt3InQuadrant3, isPt3InQuadrant4] = getQuadrant(pt1, pt3)
    const chamferDistanceX = isPt3InQuadrant2 || isPt3InQuadrant3 ? -chamferDistance1 : chamferDistance1;
    const chamferDistanceY = isPt3InQuadrant3 || isPt3InQuadrant4 ? -chamferDistance2 : chamferDistance2;
    if ((width - Math.abs(chamferDistanceX) * 2) <= 0) return points
    if ((height - Math.abs(chamferDistanceY) * 2) <= 0) return points

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
function CMxDrawPolylineDragArcDraw_CalcArcBulge(firstPoint: McGePoint3d, nextPoint: McGePoint3d, vecArcTangent: McGeVector3d): number {
    if (firstPoint.isEqualTo(nextPoint))
        return 0.0;
    let midPt = firstPoint.c().addvec(nextPoint.c().sub(firstPoint).mult(0.5));

    let vecMid = nextPoint.c().sub(firstPoint);
    vecMid.rotateBy(Math.PI / 2.0, McGeVector3d.kZAxis);

    let tmpMidLine = new McDbLine(midPt, midPt.c().addvec(vecMid));

    let vecVertical: McGeVector3d = vecArcTangent.c();
    vecVertical.rotateBy(Math.PI / 2.0, McGeVector3d.kZAxis);

    let tmpVerticalLine = new McDbLine(firstPoint, firstPoint.c().addvec(vecVertical));

    let aryPoint: McGePoint3dArray = tmpMidLine.IntersectWith(tmpVerticalLine, McDb.Intersect.kExtendBoth);
    if (aryPoint.isEmpty())
        return 0.0;

    let arcCenPoint = aryPoint.at(0);

    let dR = arcCenPoint.distanceTo(firstPoint);

    vecMid.normalize();
    vecMid.mult(dR);

    let arcMidPt1 = arcCenPoint.c().addvec(vecMid);
    let arcMidPt2 = arcCenPoint.c().subvec(vecMid);
    let vecArcDir1 = arcMidPt1.c().sub(firstPoint);
    let vecArcDir2 = arcMidPt2.c().sub(firstPoint);
    let arcMidPt = arcMidPt1;
    if (vecArcDir1.angleTo1(vecArcTangent) > vecArcDir2.angleTo1(vecArcTangent)) {
        arcMidPt = arcMidPt2;
    }
    return MxCADUtility.calcBulge(firstPoint, arcMidPt, nextPoint).val;
}
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

const button = document.createElement("button")
button.innerText = "绘制矩形"
button.onclick = drawRectang
document.body.appendChild(button)
MxFun.addCommand("draw_rect", drawRectang)