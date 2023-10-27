import { McCmColor, McDb, McDbLayerTableRecord, MxCADUiPrEntity, MxCpp, createMxCad } from "mxcad"
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

    setTimeout(async () => {
        let mxcad = MxCpp.App.getCurrentMxCAD();
        let layerTable = mxcad.getDatabase().getLayerTable();
        let aryId = layerTable.getAllRecordId();
        const layers = aryId.map((id) => {
            let layerRec = id.getMcDbLayerTableRecord();
            if (layerRec === null) return;
            return layerRec
        })
        const layer = layers[0]
        if (!layer) return
        const color = new McCmColor()
        color.setRGB(255, 0, 0)
        layer.color = color
        mxcad.updateDisplay()
        
    }, 1000)
    let getEnt = new MxCADUiPrEntity();
    const selectEntity = async ()=> {
        getEnt.setMessage("select entity:");
        let id = await getEnt.go();
        let ent = id.getMcDbEntity();
        if(ent) {
            const color = ent.trueColor.clone()
            color.setRGB(255, 0, 0)
            ent.trueColor = color
            mxcad.updateDisplay()
        }
        selectEntity()
    }
    setTimeout(()=> {
        selectEntity()
    }, 1000)
    
    setTimeout(()=> {
        const layer = new McDbLayerTableRecord()
        layer.color = new McCmColor(0, 0, 0)
        layer.isFrozen = true
        layer.isLocked = true
        layer.isOff = true
        layer.lineWeight = McDb.LineWeight.kLnWt018
        layer.name = "testLayer1"
        const layerTable = mxcad.getDatabase().getLayerTable();
        const objId = layerTable.add(layer)
        const layerObj = objId.getMcDbLayerTableRecord()
        const layerJsonString = layerTable.getJson()
        const layerJson = JSON.parse(layerJsonString)
        const  keepLayerNames = ["0", "排水", layerObj?.name]
        const keepLayers = layerJson.filter((layerJsonObj)=> {
            return keepLayerNames.includes(layerJsonObj.name)
        })
        const keepLayersJsonString = JSON.stringify(keepLayers)
        layerTable.setJson(keepLayersJsonString)
        console.log("图层0的对象ID", layerTable.get("0"))
    }, 1000)
}

