import { McCmColor, McObjectId, MxCpp, createMxCad } from "mxcad"
import { MxFun } from "mxdraw"
window.onload = async () => {
    const mode = "SharedArrayBuffer" in window ? "2d" : "2d-st"
    MxFun.setIniset({
        // 启动夹点编辑功能, 开启单选图形(mxcad默认开启)
        "EnableGripEidt": true,
        // 开启多选
        "multipleSelect": true
    })
    await createMxCad({
        canvas: "#mxcad",
        locateFile: (fileName) => {
            return new URL(`/node_modules/mxcad/dist/wasm/${mode}/${fileName}`, import.meta.url).href
        },
        fileUrl: new URL("../public/test2.mxweb", import.meta.url).href,
        fontspath: new URL("../node_modules/mxcad/dist/fonts", import.meta.url).href,
    })
    let oldColors: (McCmColor | undefined)[] =  []
    let oldIds: McObjectId[] = []
    MxCpp.getCurrentMxCAD().on("selectChange", (ids: McObjectId[])=> {
        // 还原颜色
        oldIds.forEach((id, index)=> {
            const color = oldColors[index]
            const ent = id.getMcDbEntity()
            if(!ent) return
            if(color) ent.trueColor = color
        })
        // 选中更改颜色
        oldColors = ids.map((id)=> {
            const ent = id.getMcDbEntity()
            if(!ent) return
            const color =  ent.trueColor.clone()
            ent.trueColor = new McCmColor(255, 0, 0)
            return color
        })
        oldIds = ids
    })

    // 当我们点击某个CAD图形并对其进行编辑或者夹点拖动后, mxdraw会触发`databaseModify`事件表示该图纸已被修改
    const mxdraw = MxCpp.getCurrentMxCAD().getMxDrawObject()
    mxdraw.on("databaseModify", ()=> {
        console.log("图纸被修改")
    })
}
