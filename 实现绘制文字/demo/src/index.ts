import { McDbMText, McDbText, MxCADResbuf, MxCADSelectionSet, MxCADUiPrPoint, createMxCad } from "mxcad"

const canvas = document.createElement("canvas")
canvas.id = "myCanvas"
const canvasBox = document.createElement("div")
canvasBox.style.overflow = "hidden"
canvasBox.style.height = "80vh"
canvasBox.appendChild(canvas)
document.body.appendChild(canvasBox)
window.onload = async () => {
    const mode = "SharedArrayBuffer" in window ? "2d" : "2d-st"
    const mxcad = await createMxCad({
        canvas: "#myCanvas",
        locateFile: (fileName) => {
            return new URL(`/node_modules/mxcad/dist/wasm/${mode}/${fileName}`, import.meta.url).href
        },
        fileUrl: new URL("../public/test2.mxweb", import.meta.url).href,
        fontspath: new URL("../node_modules/mxcad/dist/fonts", import.meta.url).href,
    })

    const getPoint = new MxCADUiPrPoint()
    const point = await getPoint.go()
    if(point) {
        const text = prompt("输入文字")
        if (text) {
            const isNewLine = /\n/.test(text)
            if (isNewLine) {
                mxcad.drawMText(point.x, point.y, text.replace(/\n/g, "\\P"), 10000, 0, 0, 1)
            } else {
                mxcad.drawText(point.x, point.y, text, 10000, 0, 0, 1)
            }
        }
    } 
  
    alert("开始编辑文字")
    getPoint.clearLastInputPoint()
    const point1 = await getPoint.go()
    if(point1) {
        const filter = new MxCADResbuf()
        filter.AddMcDbEntityTypes("TEXT,MTEXT")
        const select = new MxCADSelectionSet()
        const objId = select.item(select.pointSelect(point1.x, point1.y, filter))
        const ent = objId.getMcDbEntity()
        let txt:string | undefined;
        if(ent instanceof McDbText){
            txt = (ent as McDbText).textString;
        }
        else if(ent instanceof McDbMText){
            txt = (ent as McDbMText).contents;
        }

        if(!txt) return;
        const text = prompt("编辑文字 原文本: " + txt)
        if(!text) return 
        if(ent instanceof McDbText){
            (ent as McDbText).textString = text;
          }
          else if(ent instanceof McDbMText){
            (ent as McDbMText).contents = text.replace(/\n/g, "\\P");
          }
    }
}
