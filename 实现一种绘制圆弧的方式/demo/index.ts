import Mx, { MxFun, MrxDbgUiPrPoint, MxDbEntity, McGiWorldDraw, MxDbShape, Mx3PointArc, McGiWorldDrawType } from "mxdraw"

Mx.loadCoreCode().then(() => {
  Mx.MxFun.setIniset({
    "EnableGripEidt": true,
    "EnableIntelliSelect": true
  })
  // 创建控件对象 
  Mx.MxFun.createMxObject({
    canvasId: "mxcad", // canvas元素的id
    // 转换后的cad图纸文件 实际访问的是../../demo/buf/$hhhh.dwg.mxb[index].wgh
    cadFile: "./buf/test2.dwg",
  })
  drawArc()

})


class MxDbArc extends Mx3PointArc {
  getTypeName(): string {
    return "MxDbArc"
  }
  get startPoint() {
    return this.point1
  }
  set startPoint(v) {
    this.point1 = v
  }
  get endPoint() {
    return this.point2
  }
  set endPoint(v) {
    this.point2 = v
  }

  closed = false
  getGripPoints(): THREE.Vector3[] {
  
    return [this.point1, this.point2, this.point3]
  }
 
  worldDraw(pWorldDraw: McGiWorldDraw): void {
 
    if(pWorldDraw.getType() === McGiWorldDrawType.kDynDragDraw) {
      this.point3 = this.getArcMidPoint()
      if(! this.point3 ) this.point3 = new THREE.Vector3(this.point1.x, this.point2.y)
    }
    super.worldDraw(pWorldDraw)
  }


  /** 获取圆弧线中点坐标 */
  getArcMidPoint() {
    // 更新计算一些参数
    const THREE = MxFun.getMxFunTHREE()
    let { startAngle, endAngle, center, radius, clockwise, autoClockwise } = this
    if(center.x ===0 && center.y ===0) return
    this.upDateCenter(this.point1, this.point2, this.point3)
    this.upDateRadius(this.point1)
    const [angle1, angle2, angle3] = this.compute3PointAngle()
    this.startAngle = THREE.MathUtils.degToRad(angle1)
    this.endAngle = THREE.MathUtils.degToRad(angle2)
    this.upDataClockwise(angle1, angle2, angle3)
    // 根据顺逆时针方向进行调整
    if (clockwise) {
      if (startAngle < endAngle) {
        startAngle += 2 * Math.PI;
      }
    } else {
      if (startAngle > endAngle) {
        endAngle += 2 * Math.PI;
      }
    }
    var midAngle = (startAngle + endAngle) / 2;
    var midX = center.x + radius * Math.cos(midAngle);
    var midY = center.y + radius * Math.sin(midAngle);
    return new THREE.Vector3(midX, midY, 0)
  }
}

const drawArc = async () => {
  const getPoint = new MrxDbgUiPrPoint()
  const arc = new MxDbArc()
  // 确定弧长 
  const p1 = await getPoint.go()
  if (!p1) return
  arc.startPoint = p1
  getPoint.setUserDraw((point, draw) => {
    arc.endPoint = point

    draw.drawCustomEntity(arc)
  })
  const p2 = await getPoint.go()
  if (!p2) return

  arc.endPoint = p2

  MxFun.getCurrentDraw().addMxEntity(arc)
}