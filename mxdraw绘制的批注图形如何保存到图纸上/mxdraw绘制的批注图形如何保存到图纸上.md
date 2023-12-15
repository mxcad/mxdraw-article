# mxdraw绘制的批注图形如何保存到图纸上

如果你还不会创建一个在线浏览编辑在线CAD图纸的前端应用请参考:

使用MxDraw云图开发包的文档:<https://help.mxdraw.com/?pid=32>

mxcad库: <https://mxcadx.gitee.io/mxcad_docs/zh/>

用mxdraw绘制的批注图形，要保存到图纸上, 需要使用[MxDraw云图开发包](https://www.mxdraw.com/download.html)中对应服务进行保存
下面将详细讲解保存图纸批注的每一步。

首先下载[MxDraw云图开发包](https://www.mxdraw.com/download.html)开发包, 然后解压。

可用得到一个解压后的目录`MxDrawCloudServer`, 进入该目录, 运行Mx3dServer.exe软件。

点击按钮开始服务，再点击按钮VueBrowse 会加载一个网页，这个网页加载了一个在线浏览的图纸。

该网页的源码在开发包的`MxDrawCloudServer\SRC\sample\Browse\2d\Browse`目录, 在该目录下找到
`src\test\SaveDwg.ts`文件, 代码如下:

```ts
 let mxobj = MxFun.getCurrentDraw();
  let saveData:any = mxobj.saveMxEntityToObject(true);
  saveData.savefile = "../../SRC/TsWeb/public/demo/hhhhnew.dwg";
  saveData.filename = "../../SRC/TsWeb/public/demo/hhhh.dwg";

  console.log(saveData);
  //前端附带身份凭证的请求，服务器Access-Control-Allow-Origin 设为*不会生效.
  //所以需要  $api.defaults.withCredentials = false
  $api.defaults.withCredentials = false
    //$api.post("http://localhost:1337/savecomment", {
    $api.post(MxFun.getHostUrl() + ":1337/savecomment", {
    param: saveData
  }).then((response: any) => {
    if(response.data.ret == 0)
    {
      // 后台程序TsWebNodejs\routes\savedwg.js，它会调用MxFileConvert.exe使用MxDrawNode\src\mxconvert\SaveCommentToDwg.ts把批注数据，保存到demo目录下的hhhhnew.dwg文件中.
      const sSaveUrl = MxFun.getHostUrl() + ":3000/demo/hhhhnew.dwg";
      alert("保存成功，新文件下载地址:" + sSaveUrl);
    }
    else{
      alert("保存失败,错误码:" + response.data.ret);
      console.log(response.data);
    }
  })
  .catch((error: any)=> {
    alert("保存失败")
  });
```

保存批注使用mxdraw提供的方法`MxFun.getCurrentDraw().saveMxEntityToObject()` 得到一个JSON对象, 包含了页面中绘制的所有批注数据。

第一种方式是将这个数据保存在服务器的数据库中，再次打开这张图纸的时候，再去请求得到对应的批注数据，通过`MxFun.getCurrentDraw().loadMxEntityFromJson(jsonString)`在前端页面中直接恢复对应的批注

第二种方式是直接保存到图纸上, 从上面代码得知，我们得到了所有批注数据的对象，

在这个对象上设置了`savefile` 表示保存了包含了批注的新图纸服务器上的地址。

而`filename`就是现在网页上打开的图纸的原图纸再服务器上的地址.

然后发起了一个post请求, 下面我们看看再服务器中是如何处理的。

首先我们在开发包中找到`MxDrawCloudServer\Bin\MxDrawServer\Windows\routes\savecomment.js`

这里就是这个post请求接口定义的位置:

```js
param.cmd = "savecomment";
(0, convert_1.callMxNodeJS)(param, (ret) => {
    res.json(ret);
});
```

接下来我们找到callMxNodeJS这个函数, 在同目录下的`convert.js`文件中:

```js
function callMxNodeJS(param, retcall) {
    if (!param["cmd"]) {
        retcall({ code: 6, message: "param.cmd empty" });
        return;
    }
    let converparamFile;
    if (param["file"]) {
        if (mxconfig_1.default.isAbsolutePath(param.file)) {
            converparamFile = param.file + "_param.json";
        }
        else {
            converparamFile = mxconfig_1.default.getUploadPath() + param.file + "_param.json";
        }
    }
    else {
        converparamFile = mxconfig_1.default.getUploadPath() + createUuid() + "_param.json";
    }
    converparamFile = converparamFile.replace(/\\/g, '/');
    param = JSON.stringify(param);
    fs.writeFile(converparamFile, param, function (error) {
        if (error) {
            retcall({ code: 2, message: "write param file error" });
            //fs.unlink(converparamFile);
            return;
        }
        var pathConvertExt = '"' + mxconfig_1.default.getMxNodeAppPath() + '"';
        var pathMxconvertJs = mxconfig_1.default.getMxBinPath() + "mxconvert.js";
        //var cmdparam = '"' + pathMxconvertJs + '"' + ' "{\\"paramfile\\":\\"' + converparamFile + '\\"}"';
        var cmdparam = '"' + pathMxconvertJs + '"' + ' fileparam filepath="' + converparamFile + '"';
        var cmd = pathConvertExt + " " + cmdparam;
        const exec = child_process.exec;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                retcall({ code: 3, message: "exec cmd failed" });
            }
            else {
                try {
                    let index = stdout.lastIndexOf("{");
                    if (index != -1) {
                        stdout = stdout.substr(index);
                    }
                    let retCmd = JSON.parse(stdout);
                    retCmd.code = 0;
                    if (retCmd["resultfile"]) {
                        let strparam = fs.readFileSync(retCmd["resultfile"]);
                        if (strparam) {
                            let paramobj = JSON.parse(strparam);
                            retCmd.resultfile = paramobj;
                        }
                    }
                    if (retCmd["ret"] && retCmd["ret"] != 0)
                        retCmd.code = 7;
                    retcall(retCmd);
                }
                catch (err) {
                    console.log(err);
                    retcall({ code: 5, message: "exec cmd return error" });
                }
            }
        });
    });
}
```

可用看见，这里在组装参数, 然后运行mxconvert.js这个文件， 要找到这个文件的位置，我们要看`mxconfig_1.default.getMxBinPath()`这个函数的返回值

这个方法在`MxDrawCloudServer\Bin\MxDrawServer\Windows\mxconfig.js`中，最终我们可用在返回值是在同目录下的`ini.js`中配置的:

```js
function MxINI() {
    this.uploadPath = "./public/file/";
    this.mxbinPath = "../../Release/";
    //    ...
};
var mxIni = new MxINI();
module.exports = mxIni;
```

如上所知, `callMxNodeJS`函数运行的就是这个文件 `MxDrawCloudServer\Bin\Release\mxconvert.js`

```js
// 加载梦想控件服务程序
var mxweb = require('./MxNode.node');
var Mx2D = require('./Mx2DNode.node');
// 加载消息处理程序 
var mxFun = require('./mxfun');

try{
    const mxDraw_1 = require("./mxdraw/MxDraw");
    mxDraw_1.init(mxFun, Mx2D);

    var MxConvert_1 = require('./mxconvert/MxConvert');

    const args = process.argv.slice(2);

    if(args.length == 0){
        console.log(mxweb.getVersionInformation()); 
    }
    else
    {
        MxConvert_1.Call(args);
    }
}
catch(err)
{
 console.log(err);
}

mxweb.stopAll();
```

同理，在同目录下找到`mxconvert/MxConvert.js`

```js
function saveComment(param) {
    let save = new SaveCommentToDWG_1.SaveCommentToDWG();
    return save.Do(param);
}
function Call(aryParam) {
    // ...
    aryCmd["savecomment"] = saveComment;
    // ...
    aryCmd[sCmd](cmdParam)
    // ...
}
```

如上,最终 我们要在`aryParam`参数中找到`cmd`字符串调用对应命令, 这里的字符串就是`savecomment`
然后调用`new SaveCommentToDWG_1.SaveCommentToDWG().DO()` 我们可用在同目录下找到`SaveCommentToDWG.js`

```js
class SaveCommentToDWG {
    Do(param) {
        if (!param.filename) {
            return { ret: 1 };
        }
        if (!param.savefile) {
            return { ret: 4 };
        }
        let curPath = Mx2DDraw.getCurrentPath();
        if (param.userConvertPath) {
            curPath = Mx2DDraw.getConvertPath();
        }
        let dwgFilePath = curPath + "/" + param.filename;
        // 打开dwg文件。
        if (!mxConvert.openFile(dwgFilePath)) {
            return { ret: 2 };
        }
        Mx2DDraw.makeBackgroundToCurrent();
        this.matDocToCad = new MxMath_1.MathMatrix4d;
        if (param["matDoc2Cad"]) {
            this.matDocToCad.fromArray(param.matDoc2Cad.elements);
        }
        let saveFilePath = curPath + "/" + param.savefile;
        let entitys = param["entitys"];
        let i = 0;
        for (i = 0; i < entitys.length; i++) {
            // 绘制对象.
            let ent = entitys[i];
            if (ent.TypeName == "MxDbLine") {
                let pt1 = new Mx.McGePoint3dClass();
                this.DocPt2DCoordToCAD(ent.pt1);
                pt1.x = ent.pt1.x;
                pt1.y = ent.pt1.y;
                let pt2 = new Mx.McGePoint3dClass();
                this.DocPt2DCoordToCAD(ent.pt2);
                pt2.x = ent.pt2.x;
                pt2.y = ent.pt2.y;
                //Mx2DDraw.setColor([255, 200, 0]);
                Mx2DDraw.drawLine(pt1, pt2);
            }
            else if (ent.TypeName == "MxDbLeadComment") {
                this.DrawMxDbLeadComment(ent, this);
            }
            else if (ent.TypeName == "MxDbAnyLine") {
                MxDbAnyLine_1.DrawMxDbAnyline(ent, this);
            }
            else if (ent.TypeName == "MxDbSplineCurve") {
                MxDbSplineCurve_1.DrawMxDbSplineCurve(ent, this);
            }
            else if (ent.TypeName == "MxDbCloudLine") {
                MxDbCloudLine_1.DrawMxDbCloudLine(ent, this);
            }
            else if (ent.TypeName == "MxDbRectBoxLeadComment") {
                MxDbRectBoxLeadComment_1.DrawMxDbRectBoxLeadComment(ent, this);
            }
            else if (ent.TypeName == "MxDbRect") {
                MxDbRect_1.DrawMxDbRect(ent, this);
            }
            else if (ent.TypeName == "MxDbCircle") {
                MxDbCircle_1.DrawMxDbCircle(ent, this);
            }
            else if (ent.TypeName == "MxDbEllipse") {
                MxDbEllipse_1.DrawMxDbEllipse(ent, this);
            }
            else if (ent.TypeName == "MxDbText") {
                MxDbText_1.DrawMxDbText(ent, this);
            }
            else if (ent.TypeName == "MxDbRegularPolygon") {
                MxDbRegularPolygon_1.DrawMxDbRegularPolygon(ent, this);
            }
        }
        // 保存图纸
        if (!mxConvert.writeFile(saveFilePath)) {
            return { ret: 3 };
        }
        return { ret: 0 };
    }
}
```

如上代码中，将各种不同的批注都绘制到图纸中, 最终将图纸保存在参数提供的`savefile` 中。

根据上文所述，我们知道了保存批注到图纸中的整个实现，可用参考代码或者直接使用提供的这个服务。

注意以上代码为代码片段，请自行下载[MxDraw云图开发包](https://www.mxdraw.com/download.html)按照上文步骤了解保存批注的整个实现流程和实现细节。

