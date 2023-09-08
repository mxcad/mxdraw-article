import { createMxCad, McDbEntity, McGeMatrix3d, McGePoint3d, McGeVector3d, MxCADUtility, MxCpp } from "mxcad"
window.onload = () => {
    createMxCad({
        canvas: "#mxcad",
        locateFile: (fileName) => new URL(`/node_modules/mxcad/dist/wasm/2d-st/${fileName}`, import.meta.url).href,
        // 加载字体的目录位置
        fontspath: new URL(`./fonts/`, import.meta.url).href,
        // 加载转换后的图纸文件
        fileUrl: new URL(`./test2.mxweb`, import.meta.url).href,
    })
    const btn = document.getElementById("array")
    if (!btn) return
    btn.onclick = Mx_Array
}


async function Mx_Array() {
    const rowNum = Number(prompt("输入行数"))
    const colNum = Number(prompt("输入列数"))
    if (isNaN(rowNum) || isNaN(colNum)) return

    alert("点击画布两点之间的距离作为偏移量")
    let offset = await MxCADUtility.getCorner("输入偏移距离");
    if (!offset) return
    let dColOffset = offset.pt2.x - offset.pt1.x;
    let dRowOffset = offset.pt2.y - offset.pt1.y;

    // 得到选中的图形
    let aryId = await MxCADUtility.userSelect("选择陈列对象");
    // 得到这些图形的包围盒
    let ext = MxCADUtility.getMcDbEntitysBoundingBox(aryId);
    if (!ext) return;

    let cenPt = new McGePoint3d();

    if (dColOffset > 0)
        cenPt.x = ext.minPt.x;
    else
        cenPt.x = ext.maxPt.x;

    if (dRowOffset > 0)
        cenPt.y = ext.minPt.y;
    else
        cenPt.y = ext.maxPt.y;
    // 角度
    let dAng = Number(prompt("输入角度"));
    if (isNaN(dAng)) return
    let matRot = new McGeMatrix3d().setToRotation(dAng * Math.PI / 180.0, McGeVector3d.kZAxis, cenPt);

    // 循环渲染
    let iMaxNum = 50000;
    let iCount = 0;
    for (let i = 0; i < rowNum; i++) {
        // 行 平移矩阵
        let yOffsetVec = new McGeVector3d(0.0, dRowOffset * i, 0.0);
        let offsetMatY = new McGeMatrix3d().setToTranslation(yOffsetVec);

        for (let j = 0; j < colNum; j++) {
            if (i == 0 && j == 0)
                continue;
            // 列 平移矩阵
            let xOffsetVec = new McGeVector3d(dColOffset * j, 0.0, 0.0);
            let ofssetMatX = new McGeMatrix3d().setToTranslation(xOffsetVec);

            let vecOffset = new McGePoint3d(cenPt.x, cenPt.y, cenPt.z);
            // 应用对应矩阵
            vecOffset.transformBy(offsetMatY);
            vecOffset.transformBy(ofssetMatX);
            vecOffset.transformBy(matRot);

            // 最终的变换矩阵
            let tmpMat = new McGeMatrix3d().setToTranslation(new McGeVector3d(vecOffset.x - cenPt.x, vecOffset.y - cenPt.y, vecOffset.z - cenPt.z));
            for (let m = 0; m < aryId.length; m++) {
                let tmp = aryId[m].clone() as McDbEntity
                if (!tmp) {
                    continue;
                }
                // 将该变换矩阵应用在图形对象上
                tmp.TransformBy(tmpMat);
                MxCpp.GetCurrentMxCAD().DrawEntity(tmp);
                iCount++;
                if (iCount > iMaxNum) {
                    alert("超出最大阵列对象个数" + iMaxNum + "限制. \n");
                    return;
                }
            }
        }
    }
}