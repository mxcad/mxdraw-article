import { McDbBlockReference, MxCADUiPrPoint, createMxCad } from "mxcad"
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
        // 加载图块转换的mxweb文件
        let blkrecId = await mxcad.insertBlock(new URL("../public/tree.mxweb", import.meta.url).href, "tree");

        // id是否有效
        if (!blkrecId.isValid()) {
            return;
        }
        // 实例化一个块
        let blkRef = new McDbBlockReference();
        // 将加载的图块ID赋值给它
        blkRef.blockTableRecordId = blkrecId;
        // 然后计算一下这个块的包围盒
        let box = blkRef.getBoundingBox();
        if (box.ret) {
            let dLen = box.maxPt.distanceTo(box.minPt);
            // 如果图块包围盒特别小
            if (dLen > 0.00001) {
                // 则需要放大
                blkRef.setScale(mxcad.getMxDrawObject().screenCoordLong2Doc(100) / dLen);
            }
        }

        // 这里开始做用户交互
        let getPoint = new MxCADUiPrPoint();
        getPoint.setMessage("\指定插入基点");

        // 动态绘制这个图块
        getPoint.setUserDraw((v, worldDraw) => {
            blkRef.position = v;
            worldDraw.drawMcDbEntity(blkRef);
        });

        // 用户鼠标点击时得到位置
        let pt = await getPoint.go();
        if (!pt) return;
        blkRef.position = pt;
        // 绘制这个图块
        mxcad.drawEntity(blkRef);
    }, 1000)

}
