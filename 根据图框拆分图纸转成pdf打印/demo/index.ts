import { MrxDbgUiPrPoint, MxFun, MxDbRect } from "mxdraw"
MxFun.setIniset({
  // "EnableGripEidt": true,
})

MxFun.createMxObject({
  canvasId: "mxcad", // canvas元素的id
  // 转换后的cad图纸文件 实际访问的是../../demo/buf/$hhhh.dwg.mxb[index].wgh
  cadFile: "./buf/hhhh.dwg"
})
// 绘制临时的选框, 然后通过回调函数 根据框选的CAD坐标 请求云图Node服务对于API完成本地的转PDF功能
drawSelectBox((pt1, pt2) => {
  const params = new URLSearchParams();
  params.append('cmd', 'cutcad');
  // file 参数对应的是要拆分的目标图纸文件, 这里D:/hhhh.dwg是指的后台服务 部署的主机D盘下的hhhh.dwg文件; out参数同理
  params.append('param', `file=D:/hhhh.dwg out=D:/hhhh_1.pdf lbx=${pt1.x} lby=${pt1.y} rtx=${pt2.x} rty=${pt2.y}`);
  fetch('http://localhost:1337/users/tools', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }).then(async (res) => {
    const { code } = await res.json()
    if(code === 0) {
      alert("剪切成功")
    }else {
      alert("剪切失败")
    }
  }).catch((err) => {
    console.error(err)
  })
})
async function drawSelectBox(callback: (pt1, pt2) => void) {
  const getPoint = new MrxDbgUiPrPoint()
  getPoint.go(() => {
    const pt1 = getPoint.value()
    // 需要将THREE.JS坐标转文档坐标.
    const cadPt1 = MxFun.docCoord2Cad(pt1.x, pt1.y, pt1.z)
    getPoint.setBasePt(pt1);
    const rect = new MxDbRect()
    rect.color = "#f00"
    rect.pt1 = pt1
    getPoint.setUserDraw((currentPoint, pWorldDraw) => {
      rect.pt2 = currentPoint
      pWorldDraw.drawCustomEntity(rect)
    })
    getPoint.go(async () => {
      const pt2 = getPoint.value()
      const cadPt2 = MxFun.docCoord2Cad(pt2.x, pt2.y, pt2.z)
      await callback(cadPt1, cadPt2)
    })
  })
}


