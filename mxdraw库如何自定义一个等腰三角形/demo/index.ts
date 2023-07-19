import Mx, { MxFun, MrxDbgUiPrPoint } from "mxdraw"
Mx.loadCoreCode().then(() => {
    Mx.MxFun.setIniset({
        "EnableGripEidt": true,
        "EnableIntelliSelect": true
    })
    // 创建控件对象 
    Mx.MxFun.createMxObject({
        canvasId: "mxcad", // canvas元素的id
        // 转换后的cad图纸文件 实际访问的是../../demo/buf/$hhhh.dwg.mxb[index].wgh
        cadFile: "./buf/hhhh.dwg",
    })
    drawTriangle()

})

import { MxDbShape } from "mxdraw"

export class MxDbTriangle extends MxDbShape {
    // 这是必须的,这里相当于增加了一个传输值 points属性, 这个points就表示三个点的坐标位置
    points: THREE.Vector3[] = []
    protected _propertyDbKeys = [...this._propertyDbKeys, "points"]

    //  我们直接重写getShapePoints 方法, 这样就可以直接把三个点渲染出来了
    getShapePoints(): THREE.Vector3[] {
        return this.points
    }
    // 计算一下三角形的中间位置 这样我们我们就可以通过中点控制整个三角形的位置
    getCenter() {
        const _points = this.getShapePoints()
        // 计算点的数量
        const numPoints = _points.length;
        // 计算所有点的向量之和
        let sum = new THREE.Vector3();
        for (let i = 0; i < numPoints; i++) {
            sum.add(_points[i]);
        }
        const center = sum.divideScalar(numPoints);
        return center
    }

    // 返回可以操作和移动的多个点坐标, 只有知道要操作的点在上面位置才能进行操作呀
    getGripPoints() {
        return [...this.points, this.getCenter()]
    }

    // 这里就开始移动点的位置了 offset就是鼠标点击操作点后的偏移量， 我们就可以通过add的方式改变点的位置了
    //  那么如果是中点的话，我们就把三角形的三个点都进行偏移， 这样就实现移动整个三角形的功能了
    moveGripPointsAt(index: number, offset: THREE.Vector3): boolean {
        if (index === 3) {
            this.points = [this.points[0].clone().add(offset), this.points[1].clone().add(offset), this.points[2].clone().add(offset)]
        } else {
            this.points[index] = this.points[index].clone().add(offset)
        }
        return true
    }
}

export class MxDbIsoscelesTriangle extends MxDbTriangle {
    protected _propertyDbKeys = [...this._propertyDbKeys]

    getShapePoints() {
        const [baseStart, baseEnd, topPoint] = this.points
        // 计算等腰三角形底边的中点
        const midpoint = baseStart.clone().add(baseEnd).multiplyScalar(0.5);

        // 计算高度和顶点位置
        const height = topPoint.distanceTo(midpoint);


        // 计算topPoint相对于baseStart和baseEnd的位置关系
        const baseVector = new THREE.Vector3().subVectors(baseEnd, baseStart).normalize();
        const perpendicularVector = new THREE.Vector3().crossVectors(baseVector, new THREE.Vector3(0, 0, 1)).normalize();

        const direction = new THREE.Vector3().subVectors(topPoint, midpoint).dot(perpendicularVector);
        const vertex = midpoint.clone().addScaledVector(perpendicularVector, direction >= 0 ? height : -height);

        // 将三个点按照逆时针方向排列
        const _points = [baseStart, baseEnd, vertex];
        return _points;
    }
    getGripPoints() {
        return [...this.getShapePoints(), this.getCenter()]
    }
}

const getPoint = new MrxDbgUiPrPoint()

async function drawTriangle() {
    // 表示一个等腰三角形
    const triangle = new MxDbIsoscelesTriangle()

    // 这里就是获取第一个鼠标点击的位置，并自动帮你转换成three.js坐标
    const pt1 = await getPoint.go()
    if(!pt1) return
    triangle.points.push(pt1)
    // 我们可能需要一个绘制的过程， 通过这样的方式就可以实现
    getPoint.setUserDraw((currentPoint, draw)=> {
        // 因为现在这个动态绘制只有两个已知点，所以无法构成三角形，我们就画一个直线，表示我们正在画三角形的底边
        draw.drawLine(currentPoint, pt1)
    })


    // 这时又在屏幕上点了以下得到了pt2这个坐标
    const pt2 = await getPoint.go()
    if(!pt2) return
    triangle.points.push(pt2)

    // 这时triangle三角形示例已经又两个点了，我们可以直接动态绘制过程绘制出这个三角形了，可以实时看见现在画出的三角形的样子。
     getPoint.setUserDraw((currentPoint, draw)=> {
        // 去设置三角形的最好一个点
        triangle.points[2] = currentPoint
        // 并且把它绘制出来
        draw.drawCustomEntity(triangle)
    })

    // 最后我们再次点击屏幕，确定下这个三角形的形状
    const pt3 = await getPoint.go()
    if(!pt3) return
    triangle.points[2] = pt3

    // 最后将它添加渲染到控件中，就完成了整个三角形的绘制
    MxFun.getCurrentDraw().addMxEntity(triangle)
}
// 最后将这个drawTriangle函数在点击按钮时触发就可以开始画等腰三角形了