import { McCmColor, McDb, McDbAlignedDimension, McDbArc, McDbCircle, McDbEllipse, McDbLine, McDbMText, McDbPoint, McDbPolyline, McDbRotatedDimension, McDbText, McGePoint3d, McGeVector3d, MxCADUiPrInt, MxCADUiPrKeyWord, MxCADUiPrPoint, MxCADUiPrString, MxCpp, createMxCad } from "mxcad"
import { MxFun } from "mxdraw"

const canvas = document.createElement("canvas")
canvas.id = "myCanvas"
const canvasBox = document.createElement("div")
canvasBox.style.overflow = "hidden"
canvasBox.style.height = "80vh"
canvasBox.appendChild(canvas)
const input = document.createElement("input")
input.addEventListener("keydown", (e: KeyboardEvent) => {
    // 设置传输命令行消息数据
    MxFun.setCommandLineInputData((e.target as HTMLInputElement).value, e.keyCode);
    if(e.keyCode === 13) (e.target as HTMLInputElement).value = ""
})

const tip = document.createElement("div")
const dis = document.createElement("div")
MxFun.listenForCommandLineInput(({ msCmdTip, msCmdDisplay, msCmdText }) => {
    console.log(msCmdTip, msCmdDisplay, msCmdText)
    tip.innerText = msCmdTip + msCmdText
    dis.innerText = msCmdDisplay
 }
);

document.body.appendChild(tip)
document.body.appendChild(input)
document.body.appendChild(canvasBox)
document.body.appendChild(dis)


window.onload = async () => {
    const mode = "SharedArrayBuffer" in window ? "2d" : "2d-st"
    const mxcad = await createMxCad({
        canvas: "#myCanvas",
        locateFile: (fileName) => {
            return new URL(`/node_modules/mxcad/dist/wasm/${mode}/${fileName}`, import.meta.url).href
        },
        fileUrl: new URL("../public/empty_template.mxweb", import.meta.url).href,
        fontspath: new URL("../node_modules/mxcad/dist/fonts", import.meta.url).href,
    })

    // setTimeout(()=> {
    //    const mxcad = MxCpp.App.getCurrentMxCAD()
    //    const point = new McDbPoint()
    //    const color = new McCmColor()
    //    color.setRGB(0, 255, 255)
    //    point.trueColor = color
    //    point.position = new McGePoint3d(0, 0)
    //    mxcad.drawEntity(point)
    //    mxcad.updateDisplay()
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const mText = new McDbMText()
    //     const textId = mxcad.drawEntity(mText)
    //     const text = textId.getMcDbEntity() as McDbMText
    //     text.attachment = McDb.AttachmentPoint.kTopLeft
    //     text.contents = "内容 \\P 内容"
    //     text.location = new McGePoint3d(10, 20)
    //     text.trueColor = new McCmColor(255, 0, 255)
    //     text.textHeight = 10
    //     mxcad.updateDisplay()
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const text = new McDbText()
    //     text.widthFactor = 1
    //     text.horizontalMode = McDb.TextHorzMode.kTextCenter
    //     text.verticalMode = McDb.TextVertMode.kTextBottom
    //     text.textString = "内容"
    //     text.position = new McGePoint3d(-10, -20)
    //     text.trueColor = new McCmColor(255, 0, 255)
    //     text.height = 10
    //     mxcad.drawEntity(text)
    //     mxcad.updateDisplay()
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const mDimension = new McDbAlignedDimension()
    //     const dimensionId = mxcad.drawEntity(mDimension)
    //     const dimension = dimensionId.getMcDbEntity() as McDbAlignedDimension
    //     dimension.xLine1Point = new McGePoint3d(0, 255)
    //     dimension.xLine2Point = new McGePoint3d(30, 60)
    //     dimension.dimLinePoint = new McGePoint3d(88, 88)
    //     dimension.textAttachment = McDb.AttachmentPoint.kTopLeft
    //     dimension.trueColor = new McCmColor(200, 255, 0)
    //     dimension.oblique = 0
    //     mxcad.updateDisplay()
    // }, 1000)
    
    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const mDimension = new McDbRotatedDimension()
    //     const dimensionId = mxcad.drawEntity(mDimension)
    //     const dimension = dimensionId.getMcDbEntity() as McDbRotatedDimension
    //     dimension.xLine1Point = new McGePoint3d(100, -137)
    //     dimension.xLine2Point = new McGePoint3d(161,30)
    //     dimension.dimLinePoint = new McGePoint3d(80, -60)
    //     dimension.textAttachment = McDb.AttachmentPoint.kTopLeft
    //     dimension.textRotation = 0.23
    //     dimension.trueColor = new McCmColor(200, 255, 0)
    //     dimension.oblique = 0
    //     dimension.rotation = 0
    //     mxcad.updateDisplay()
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const line = new McDbLine(0, 0, 0, -80, -80, 0)
    //     line.trueColor = new McCmColor(255, 0, 0)
    //     mxcad.drawEntity(line)
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const circle = new McDbCircle(-100, 300, 0, 20)
    //     circle.trueColor = new McCmColor(255, 0, 0)
    //     mxcad.drawEntity(circle)
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const polyline = new McDbPolyline()
    //     polyline.isClosed = false
    //     polyline.constantWidth = 10
    //     polyline.addVertexAt(new McGePoint3d(100, 100))
    //     polyline.addVertexAt(new McGePoint3d(200, 100), 0.2, 1, 5, 1)
    //     polyline.addVertexAt(new McGePoint3d(100, 200), 0.2, 5, 1, 2)
    //     mxcad.drawEntity(polyline)
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const arc = new McDbArc()
    //     arc.center = new McGePoint3d(-100, -100),
    //     arc.radius = 20
    //     arc.startAngle = Math.PI / 2
    //     arc.endAngle = Math.PI * 3 / 2
    //     arc.trueColor = new McCmColor(255, 233, 0)
    //     mxcad.drawEntity(arc)
    // }, 1000)

    // setTimeout(()=> {
    //     const mxcad = MxCpp.App.getCurrentMxCAD()
    //     const ellipse = new McDbEllipse()
    //     ellipse.center = new McGePoint3d(-200, -200),
    //     ellipse.majorAxis = new McGeVector3d(0, 300, 0)
    //     ellipse.minorAxis = new McGeVector3d(33, 0, 0)
    //     ellipse.radiusRatio = 0.5
    //     ellipse.startAngle = Math.PI / 2
    //     ellipse.endAngle = Math.PI * 3 / 2
    //     ellipse.trueColor = new McCmColor(255, 233, 0)
    //     mxcad.drawEntity(ellipse)
    // }, 1000)


    // const getInt = new MxCADUiPrInt()
    // const getKey = new MxCADUiPrKeyWord()
    // const getStr = new MxCADUiPrString()
    // getInt.setMessage("提示用户输入数字:")
    // const intVal = await getInt.go()
    // console.log(intVal)
    // getKey.setMessage("提示用户关键词 A、 B、 C:")
    // getKey.setKeyWords("A B C")
    // const keyVal = await getKey.go()
    // console.log(keyVal)
    // getStr.setMessage("提示用户输入字符串:")
    // const strVal = await getStr.go()
    // console.log(strVal)
    MxFun.addCommand("Mx_draw_Text", async ()=> {
        const getInt = new MxCADUiPrInt()
        const getKey = new MxCADUiPrKeyWord()
        const getStr = new MxCADUiPrString()
        const getPoint = new MxCADUiPrPoint()
        const text = new McDbText()
        getPoint.setMessage("请点击确定文字位置")

        const position = await getPoint.go()
        if(!position) return
        text.position = position

        getInt.setMessage("请输入文字高度")
        const height = await getInt.go()
        if(!height) return
        text.height = height

        getKey.setMessage("选择水平对齐方式 快捷键 L: 左对齐 C: 居中对齐 R: 右对齐 A: 水平对齐 M: 垂直中间对齐 F: 自适应")

        getKey.setKeyWords("L C R A M F")

        await getKey.go()
        if(getKey.isKeyWordPicked("L")) text.horizontalMode = McDb.TextHorzMode.kTextLeft
        if(getKey.isKeyWordPicked("C")) text.horizontalMode = McDb.TextHorzMode.kTextCenter
        if(getKey.isKeyWordPicked("R")) text.horizontalMode = McDb.TextHorzMode.kTextRight
        if(getKey.isKeyWordPicked("A")) text.horizontalMode = McDb.TextHorzMode.kTextAlign
        if(getKey.isKeyWordPicked("M")) text.horizontalMode = McDb.TextHorzMode.kTextMid
        if(getKey.isKeyWordPicked("F")) text.horizontalMode = McDb.TextHorzMode.kTextFit

        getStr.setMessage("请输入文字内容")
        const str = await getStr.go()
        if(!str) return
        text.textString = str
        const mxcad = MxCpp.App.getCurrentMxCAD()
        mxcad.drawEntity(text)
    })
}
