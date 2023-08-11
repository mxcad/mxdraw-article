import { MrxDbgUiPrPoint, MxFun, MxDbCircleShape, McEdGetPointWorldDrawObject, } from "mxdraw"

class MxDbCircle extends MxDbCircleShape {
    isClosedToCenter = false
    /**
     * 返回自定义对象的夹点.
     * @param
     * @returns Array<THREE.Vector3>
     */
    getGripPoints() {
        const { x, y, z } = this.center;
        // 计算圆的上下左右夹点
        let upPoint = new THREE.Vector3(x, y + this.radius, z),
            downPoint = new THREE.Vector3(x, y - this.radius, z),
            leftPoint = new THREE.Vector3(x - this.radius, y, z),
            rightPoint = new THREE.Vector3(x + this.radius, y, z);

        return [this.center, upPoint, downPoint, leftPoint, rightPoint];
    }
    /**
     * 移动自定义对象的夹点.
     * @param
     * @returns boolean
     */
    moveGripPointsAt(index: number, offset: THREE.Vector3) {
        const [center, upPoint, downPoint, leftPoint, rightPoint] =
            this.getGripPoints();
        // 改变上下左右的夹点则改变radius半径
        if (index === 0) this.center = center.add(offset);
        if (index === 1) this.radius = upPoint.add(offset).distanceTo(this.center);
        if (index === 2)
            this.radius = downPoint.add(offset).distanceTo(this.center);
        if (index === 3)
            this.radius = leftPoint.add(offset).distanceTo(this.center);
        if (index === 4)
            this.radius = rightPoint.add(offset).distanceTo(this.center);
        return true;
    }
}
MxFun.setIniset({
    // "EnableGripEidt": true,
    "EnableIntelliSelect": true
})
// 创建控件对象 
MxFun.createMxObject({
    canvasId: "mxcad", // canvas元素的id
    // 转换后的cad图纸文件 实际访问的是../../demo/buf/$hhhh.dwg.mxb[index].wgh
    cadFile: "./buf/hhhh.dwg",
})

// 两点确定圆
const drawCircleAtTwoPoints = async () => {
    const getPoint = new MrxDbgUiPrPoint();
    const circle = new MxDbCircle();
    circle.center = await getPoint.go()
    getPoint.setUserDraw(
        (
            currentPoint: THREE.Vector3,
            pWorldDraw: McEdGetPointWorldDrawObject
        ) => {
            circle.radius = circle.center.distanceTo(currentPoint)
            pWorldDraw.drawCustomEntity(circle);
            pWorldDraw.drawLine(circle.center, currentPoint);
        }
    );
    circle.radius = circle.center.distanceTo(await getPoint.go())
    MxFun.getCurrentDraw().addMxEntity(circle);
}
// drawCircleAtTwoPoints()


// 三点确定圆
const threePointsToDetermineTheCenterOfTheCircle = (
    points: [THREE.Vector3, THREE.Vector3, THREE.Vector3]
) => {
    const [point1, point2, point3] = points;
    const { x: x1, y: y1, z: z1 } = point1;
    const { x: x2, y: y2, z: z2 } = point2;
    const { x: x3, y: y3, z: z3 } = point3;

    const a1 = y1 * z2 - y2 * z1 - y1 * z3 + y3 * z1 + y2 * z3 - y3 * z2,
        b1 = -(x1 * z2 - x2 * z1 - x1 * z3 + x3 * z1 + x2 * z3 - x3 * z2),
        c1 = x1 * y2 - x2 * y1 - x1 * y3 + x3 * y1 + x2 * y3 - x3 * y2,
        d1 = -(
            x1 * y2 * z3 -
            x1 * y3 * z2 -
            x2 * y1 * z3 +
            x2 * y3 * z1 +
            x3 * y1 * z2 -
            x3 * y2 * z1
        ),
        a2 = 2 * (x2 - x1),
        b2 = 2 * (y2 - y1),
        c2 = 2 * (z2 - z1),
        d2 = x1 * x1 + y1 * y1 + z1 * z1 - x2 * x2 - y2 * y2 - z2 * z2,
        a3 = 2 * (x3 - x1),
        b3 = 2 * (y3 - y1),
        c3 = 2 * (z3 - z1),
        d3 = x1 * x1 + y1 * y1 + z1 * z1 - x3 * x3 - y3 * y3 - z3 * z3,
        cx =
            -(
                b1 * c2 * d3 -
                b1 * c3 * d2 -
                b2 * c1 * d3 +
                b2 * c3 * d1 +
                b3 * c1 * d2 -
                b3 * c2 * d1
            ) /
            (a1 * b2 * c3 -
                a1 * b3 * c2 -
                a2 * b1 * c3 +
                a2 * b3 * c1 +
                a3 * b1 * c2 -
                a3 * b2 * c1),
        cy =
            (a1 * c2 * d3 -
                a1 * c3 * d2 -
                a2 * c1 * d3 +
                a2 * c3 * d1 +
                a3 * c1 * d2 -
                a3 * c2 * d1) /
            (a1 * b2 * c3 -
                a1 * b3 * c2 -
                a2 * b1 * c3 +
                a2 * b3 * c1 +
                a3 * b1 * c2 -
                a3 * b2 * c1),
        cz =
            -(
                a1 * b2 * d3 -
                a1 * b3 * d2 -
                a2 * b1 * d3 +
                a2 * b3 * d1 +
                a3 * b1 * d2 -
                a3 * b2 * d1
            ) /
            (a1 * b2 * c3 -
                a1 * b3 * c2 -
                a2 * b1 * c3 +
                a2 * b3 * c1 +
                a3 * b1 * c2 -
                a3 * b2 * c1);

    return new THREE.Vector3(cx, cy, cz);
};

const drawCircleAtThreePoints = async () => {
    const getPoint = new MrxDbgUiPrPoint();
    const circle = new MxDbCircle();
    let points = [] as unknown as [THREE.Vector3, THREE.Vector3, THREE.Vector3]
    points.push(await getPoint.go())
    getPoint.setUserDraw((currentPoint, pWorldDraw) => {
        pWorldDraw.drawLine(points[0], currentPoint)
    })
    points.push(await getPoint.go())
    getPoint.setUserDraw(
        (
            currentPoint: THREE.Vector3,
            pWorldDraw: McEdGetPointWorldDrawObject
        ) => {
            circle.center = threePointsToDetermineTheCenterOfTheCircle([points[0], points[1], currentPoint])
            circle.radius = circle.center.distanceTo(currentPoint)
            pWorldDraw.drawCustomEntity(circle);
        }
    );
    points.push(await getPoint.go())
    circle.center = threePointsToDetermineTheCenterOfTheCircle(points);
    circle.radius = circle.center.distanceTo(points[0]);
    MxFun.getCurrentDraw().addMxEntity(circle);
}
drawCircleAtThreePoints()