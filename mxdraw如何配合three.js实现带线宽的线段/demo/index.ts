import { McGiWorldDraw, MrxDbgUiPrPoint, MxDbEntity, MxFun } from "mxdraw"
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
class MxDbLine extends MxDbEntity {
    getTypeName(): string {
        return "MxDbLine"
    }
    points: THREE.Vector3[] = []

      // ...
     // 临时存放的material
     material: LineMaterial
     worldDraw(pWorldDraw: McGiWorldDraw): void {
        const material = new LineMaterial()
        this.material = material
        const geometry = new LineGeometry()
        // 得到mxdraw中使用的three.js
        const THREE = MxFun.getMxFunTHREE()
        // 设置颜色
        material.color = new THREE.Color(this.color)
        this.updateLineWidth()
        // line2必须设置的分辨率
        const canvas = MxFun.getCurrentDraw().getCanvas()
        material.resolution.set( canvas.width, canvas.height)
        // 设置透明 因为这样才能覆盖底层的cad图纸
        material.transparent = true

        // 设置点向量位置，line2需要这样设置
        const positions: number[] = []
        for(let i = 0; i < this.points.length; i++) {
            positions.push(this.points[i].x, this.points[i].y, (this.points[i] as any)?.z || 0)
        }
        geometry.setPositions(positions)

        const line2 = new Line2(geometry, material)
        // 最后把这个three.js生成的线段绘制出来
        pWorldDraw.drawEntity(line2)
    }
    // 记录1屏幕像素下three.js的长度 比例
    _lineWidthRatio: number
    //  更新实际的线宽
    updateLineWidth() {
        if(!this._lineWidthRatio) {
            this._lineWidthRatio = MxFun.screenCoordLong2World(1)
        }
        this.material.linewidth =  this.lineWidthByPixels ? this.dLineWidth :  this.dLineWidth *  this._lineWidthRatio / MxFun.screenCoordLong2World(1)
    }
      //  在画布视图缩放变化时立即触发更新重写渲染
      onViewChange() {
        // 只有当时以three.js长度为单位的时候才这样立即更新去调整宽度
        if(!this.lineWidthByPixels) {
            this.setNeedUpdateDisplay()
            MxFun.updateDisplay()
        }
        return true
    }
    // 顺便我们把夹点操作移动给写上，这样就可以移动每一个向量点来来改变线段了
    getGripPoints(): THREE.Vector3[] {
        return this.points
    }
    moveGripPointsAt(index: number, offset: THREE.Vector3): boolean {
        this.points[index] = this.points[index].clone().add(offset)
       return true
    }
    //  _lineWidthRatio属性必须一直存在 这样线宽才算正确的
    dwgIn(obj: any): boolean {
       this.onDwgIn(obj)
       this.dwgInHelp(obj, ["points", "_lineWidthRatio"])
       return true
    }
    dwgOut(obj: any): object {
        this.onDwgOut(obj)
        this.dwgOutHelp(obj, ["points", "_lineWidthRatio"])
        return obj
    }
}
MxFun.setIniset({
    "EnableGripEidt": true,
    "EnableIntelliSelect": true
})
// 创建控件对象 
MxFun.createMxObject({
    canvasId: "mxcad", // canvas元素的id
    // 转换后的cad图纸文件 实际访问的是../../demo/buf/$hhhh.dwg.mxb[index].wgh
    cadFile: "./buf/hhhh.dwg",
})
const drawLine = ()=> {
    const line = new MxDbLine()
    line.dLineWidth = 10
    const getPoint = new MrxDbgUiPrPoint()
    // 这是绘制过程中设置的动态绘制函数
    getPoint.setUserDraw((currentPoint, pWorldDraw)=> {
        if(line.points.length === 0) return
        if(line.points.length >= 2) {
            pWorldDraw.drawCustomEntity(line)
        }
        pWorldDraw.drawLine(currentPoint, line.points[line.points.length - 1])
    })
    getPoint.goWhile(()=> {
        // 鼠标左键点击
        line.points.push(getPoint.value())
    }, ()=> {
        // 鼠标右键结束绘制
        MxFun.getCurrentDraw().addMxEntity(line)
    })
}
drawLine()

