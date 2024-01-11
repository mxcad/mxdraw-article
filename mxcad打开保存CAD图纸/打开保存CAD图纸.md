# 实现打开CAD图纸的方式

示例项目地址: <https://demo.mxdraw3d.com:3000/mxcad/>

在示例项目中，可以直接打开CAD图纸，它是怎么做到的呢？

这依赖于[mxcad](https://mxcadx.gitee.io/mxcad_docs/zh/)这个前端库可以读取[MxDraw云图开发包](https://help.mxdraw.com/?pid=32)将CAD图纸转换成mxweb格式的文件。

有了图纸转换和文件渲染的, 就可以做到读取编辑CAD图纸。

大致原理如下: 首先 上传CAD图纸到我们Node服务进行处理，

它会调用[MxDraw云图开发包](https://help.mxdraw.com/?pid=32)中提供的程序将CAD图纸转换成mxweb文件，然后返回给前端对应的访问地址就好了。

我们该示例项目对应的Node服务, 方便参考具体的Node代码, 请点击查看该链接了解详情:<https://help.mxdraw.com/?pid=115>

我们可以直接在开发包找到对应的Node服务源码, 可以直接使用对应接口, 但是可能它并不能完全满足你的需求，需要自己修改甚至重写。

为此，我们详细讲解应该如何来实现图纸转换的接口。

## 后端具体实现

首先我们需要[Node环境 点击查看安装]("https://www.runoob.com/nodejs/nodejs-install-setup.html")

如果你不是使用的Node作为后端开发语言, 那么只需要理解如何转换就好, 然后自行实现。

验证是否安装成功

```sh
node -v
```

下面我们可以直接通过Node `child_process` 使用子进程调用云图开发包中的`mxcadassembly`程序

mxcadassembly程序所在目录:

windows目录: `MxDrawCloudServer\Bin\MxCAD\Release\mxcadassembly.exe`

linux目录: `MxDrawCloudServer\Bin\Linux\BinMxCAD\mxcadassembly`

```ts
const { exec } = require('child_process');
// 如果是要将mxweb格式文件转成服务器 那么 srcpath就是mxweb文件路径 而outname 的后缀名应该是对应图纸的后缀名，如: test.dwg
const param = {
  srcpath: "要转换的文件在服务器上的路径",
  outpath: "转换后生成的文件在服务器上的目录路径",
  outname: "转换后的文件名称"
}
exec(`"mxcadassembly程序在服务器所在位置" "${JSON.stringify(param)}"`, ()=> {})
```

如上所知, 我们要将mxweb文件保存为dwg图纸只需要改变`srcpath`和`outname`就可以了

将CAD图纸上传到服务器上, 请自行实现

这里建议点击查看<https://help.mxdraw.com/?pid=115>

然后结合云图开发包`MxDrawCloudServer\Bin\MxCAD\MxCADSaveFile\server.js`文件查看到源码可以非常清晰的知道如何上传CAD实现转换和保存dwg图纸。

最后我们将转换的文件放在了服务器上，当然你也可以上传到oss或者其他云存储上，然后返回对应的访问地址就可以了。

## 前端具体实现

前端直接调用后端提供的接口上传CAD图纸，等成功转换成mxweb文件后在前端用mxcad打开, [打开mxweb文件 点击查看参考](https://mxcadx.gitee.io/mxcad_docs/zh/1.%E6%8C%87%E5%8D%97/1.%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8.html#%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95)

这里主要讲解一下如何将目前网页上打开渲染好并且编辑了的mxweb文件保存成CAD图纸。

首先我们需要得到现在修改后的mxweb文件数据,

然后上传到服务器，后端将mxweb格式的数据写在一个mxweb格式的文件中,

最后使用`mxcadassembly`程序将mxweb格式文件转换为CAD图纸的文件, 然后返回对应的访问地址。

默认情况下, 我们提供`saveFileToUrl` 来实现保存CAD图纸, 它实际上帮我们将当前的mxweb数据上传到了你指定的一个后端接口中。

下面是它的使用方法:

```ts
import { MxCpp, MxTools } from "mxcad"
MxCpp.getCurrentMxCAD().saveFileToUrl("http://localhost:3337/mxcad/savefiledwg", (iResult, sserverResult)=> {
  /** 这个就是对应接口的返回数据结果 */ 
  console.log(sserverResult)

  // 我们可以直接拿到请求结果中携带的CAD图纸的访问地址 下载对应的图纸
  // 假设返回结果是filePath
  const filePath = JSON.parse(sserverResult).filePath

   fetch(filePath).then(async (res)=> {
    const blob = await res.blob()
    // 默认使用了一些新的特性，如果不支持则会自动降级使用a标签下载
    MxTools.saveAsFileDialog({
      blob,
      filename: "test.dwg",
      types: [{
        description: "dwg图纸",
        accept: {
            "application/octet-stream": [".dwg"],
        },
      }]
    })
  })
})
```

`http://localhost:3337/mxcad/savefiledwg` 接口实际就是云图开发包中提供的对应的Node服务

但是在实际使用时，这种常规的方法并不能完全满足你的需求, 这个时候我们可以自己来实现这个保存dwg的功能，请参考如下代码:

```ts
import { MxCpp } from "mxcad"
const mxcad = MxCpp.getCurrentMxCAD()
// 这里直接拿到mxweb数据
mxcad.saveFile(void 0, (data)=> {
      let blob: Blob
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        blob = new Blob([data.buffer], { type: "application/octet-stream" });
      } else {
        blob = new Blob([data.buffer], { type: "application/octet-binary" });
      }
      // 这里直接将blob转成file
      const file = new File([blob], 'test.mxweb', { type: isSafari ? "application/octet-stream" : "application/octet-binary" })
      // 上传文件转CAD图纸
      fetch('http://localhost:3337/mxcad/savefiledwg', {
          method:'POST',
          body: file
      })
}, false, true)
```

以上代码只是参考代码, 其核心是需要利用云图开发包, 下载好后，它能够最快让你看到实际效果

详情参考文档: <https://help.mxdraw.com/?pid=32>

前端mxcad文档: <https://mxcadx.gitee.io/mxcad_docs/zh/>

## 完整演示在网页打开保存CAD图纸的DEMO

如果下载了云图开发包你阅读了其中前后端源码还是无法理解如何实现打开和保存图纸

在这里给你准备了一个最简完整DEMO 只需要js + html 就可以完整实现网页打开和保存CAD图纸的页面

方便你快速理解如何打开和保存CAD图纸

首先该DEMO 是一个Node服务， 需要安装[Node环境](https://www.runoob.com/nodejs/nodejs-install-setup.html)

查看是否安装完成

```sh
node -v
```

然后可以下载我们的demo源码: <https://gitee.com/mxcadx/mxdraw-article/blob/master/mxcad打开保存CAD图纸/demo.zip>

下载好demo后 解压进入demo目录

执行如下命令:

```sh
node app.js
```

最后控制台会提示访问: <http://localhost:3333/>

注意DEMO中的mxcad和mxdraw库是通过CDN方式引入的，如果你发现打开页面后没有CAD图纸显示，可能是你无法访问CDN资源

你可以选择通过npm安装下载mxcad和mxdraw库 然后引入其中对应的文件就好

```sh
npm init
npm install mxcad mxdraw
```

然后将CDN引入的改成本地引入就好

注意DEMO中的图纸转换程序并不是最新的，请不要正式使用, 该DEMO只是为了理解如何实现在网页打开和保存CAD图纸


