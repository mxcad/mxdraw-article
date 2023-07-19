# mxdraw库如何自定义一个等腰三角形-前端小白版本

如果你是前端开发人员请直接[阅读mxdraw库如何自定义一个等腰三角形.md]， 这可以节省你很多时间

如果你不了解前端知识，你只需要完全按照下文每一个步骤进行操作，就可以将CAD图纸在页面中显示出来，并且可以实现一个用鼠标绘制等腰三角形的功能。

## 安装前端工程化需要的环境

我们需要先安装Node环境来初始化一个工程化的前端项目。

你可以完全按照https://blog.csdn.net/WHF__/article/details/129362462文章一步一步操作，你就可以安装配置好Node环境。

有了Node环境就有了npm包管理工具，我们现在需要通过Vite这个打包工具初始化一个最简单的前端项目

这里你可以直接参考vite官方文档：https://cn.vitejs.dev/guide/

你只需在命令行输入以下命令就可以创建出一个基于Vite打败的前端项目:

```sh
npm create vite@latest
```

这时命令行会出现一些选择,
Ok to proceed? (y) 这个选项直接输入y然后按下回车键

? Project name: » vite-project 这里就是项目的名称，默认就是vite-project， 你可以改成其他名称

? Select a framework: » - Use arrow-keys. Return to submit.
    Vanilla
    Vue
    React
    Preact
    Lit
    Svelte
    Others
这里是让你选择一个前端的框架，本文以Vue为。 如果你不知道什么是前端框架，或者不知道从这些框架只能选择哪个，那么这里就选择Vue吧，直接上下键选择，回车键确定选择 跟着我的步骤走就可以了

Select a variant: » - Use arrow-keys. Return to submit.
    TypeScript
    JavaScript
    Customize with create-vue ↗
    Nuxt ↗

如果你还是不懂这些是选择什么，就选择 TypeScript，因为本文实例就是用TypeScript进行开发的

![创建vite项目选项](./imgs/%E5%88%9B%E5%BB%BAvite%E9%A1%B9%E7%9B%AE%E9%80%89%E9%A1%B9.jpg)

当你看下以下提示时说明你已经将一个前端项目创建出来了。
Done. Now run:
  cd vite-project
  npm install
  npm run dev

那么我们直接按照上述信息来， 先`cd vite-project`进入这个目录

然后`npm install` 下载前端项目依赖

最后运行`npm dev` 你会看见下信息:

  VITE v4.3.9  ready in 1042 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help

我们直接在浏览器打开http://127.0.0.1:5173/ 就可以看见页面了

## 在页面显示CAD图纸

看见页面觉得没啥问题了，我们返回到命令行窗口， 按下`ctrl + c`退出页面的服务

然后我们要安装一下mxdraw 前端库，我们渲染图纸都是要围绕它进行的。

输入命令:

```sh
npm i mxdraw@latest
```

我们直接下载最新版本。

这里给出两个链接，看得懂就看，看不懂也没有关系，先有个印象

> mxdraw入门查看:https://mxcadx.gitee.io/mxdraw_docs/start/quickStart.html#%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F
> cad图纸转换为mxdraw支持渲染的文件请查看: https://mxcadx.gitee.io/mxdraw_docs/start/drawingConversion.html#%E4%B8%80%E3%80%81%E4%B8%8B%E8%BD%BDmxdraw%E4%BA%91%E5%9B%BE%E5%BC%80%E5%8F%91%E5%8C%85

我们现在将mxdraw安装好了。

这时候我们需要开始写代码了。

先找到项目的src目录下的App.vue文件:

找到代码 `<template>...</template>` 里的内容，全部都删掉，替换成以下代码:

```html
<div style="height: 80vh; overflow: hidden;">
  <canvas id="mxcad"></canvas>
</div>
```

然后我们找到`<script setup lang="ts"></script>`里的内容将它替换成以下内容：

```ts
import Mx from "mxdraw"
Mx.loadCoreCode().then(()=> {
  // 创建控件对象 
  Mx.MxFun.createMxObject({
      canvasId: "mxcad", // canvas元素的id
       // 转换后的cad图纸文件 实际访问的是 http://127.0.0.1:5173/buf/$hhhh.dwg.mxb[index].wgh
      cadFile: "/buf/hhhh.dwg",
  })
})
```

这里还没完，你并的项目中没有/buf/hhhh.dwg所对应的转换后的渲染文件。所以，我们需要准备一张CAD图纸对他进行一个转换。

用命令去转图纸你可能会觉得不好理解，我们可以使用云图开发包软件对CAD图纸进行转换。

具体的教程你可以一步一步按照https://mxcadx.gitee.io/mxdraw_docs/start/drawingConversion.html#%E4%B8%80%E3%80%81%E4%B8%8B%E8%BD%BDmxdraw%E4%BA%91%E5%9B%BE%E5%BC%80%E5%8F%91%E5%8C%85 操作去做就可以了

这时把转换后的buf目录放在项目的public目录下就可以了，要渲染这个CAD图纸只需要把`cadFile: "/buf/hhhh.dwg"` 改成自己转换的图纸名称就可以运行了

![转换后的文件位置](./imgs/%E8%BD%AC%E6%8D%A2%E5%90%8E%E7%9A%84%E6%96%87%E4%BB%B6%E4%BD%8D%E7%BD%AE.jpg)

最后我们直接在命令行输入:

```sh
npm run dev
```

打开网页你应该就可以看到一个显示CAD图纸的页面了

## 写一个等腰三角形的形状类

我们知道要构成三角形一定是需要三个点的, 所以我们可以通过mxdraw库提供的自定义形状类MxDbShape扩展出一个三角形。

首先我们在`src/App.vue`文件中找打`<script setup lang="ts"></script>`中的内容继续往下写

```ts
import { MxDbShape } from "mxdraw"
// ...其他内容

export class MxDbTriangle extends MxDbShape { 
     // 这是必须的,这里相当于增加了一个传输值 points属性, 这个points就表示三个点的坐标位置
     points: THREE.Vector3[] = []
     protected _propertyDbKeys = [...this._propertyDbKeys, "points"]

    //  我们直接重写getShapePoints 方法, 这样就可以直接把三个点渲染出来了
    getShapePoints(): THREE.Vector3[] {
        return this.points
    }
}

```

以上就是实现了一个三角形类, 只需要往points中添加3个点,就会构成一个三角形, 你也可以用其他属性表示三角形的三个点, 比如point1 point2 point3

但是这个三角形只是一个静态的三角形,你不能对三角形的三个点进行移动,也不能移动整个三角形

因此我们还可以再重写几个方法,让它支持再画布上移动三角形或者构成三角形的点

```ts
import { MxDbShape } from "mxdraw"
export class MxDbTriangle extends MxDbShape { 

  // ...
  // 计算一下三角形的中间位置 这样我们我们就可以通过中点控制整个三角形的位置
  getCenter() {
        const _points = this.getShapePoints()
        // 计算点的数量
        const numPoints = _points.length;
        // 计算所有点的向量之和
        let sum = new THREE.Vector3();
        for (let i = 0; i < numPoints; i++) {
            sum.add(_points[i]);
        }
        const center = sum.divideScalar(numPoints);
        return center
  }

  // 返回可以操作和移动的多个点坐标, 只有知道要操作的点在上面位置才能进行操作呀
   getGripPoints() {
        return [...this.points, this.getCenter()]
    }

    // 这里就开始移动点的位置了 offset就是鼠标点击操作点后的偏移量， 我们就可以通过add的方式改变点的位置了
    // 那么如果是中点的话，我们就把三角形的三个点都进行偏移， 这样就实现移动整个三角形的功能了
    moveGripPointsAt(index: number, offset: THREE.Vector3): boolean {
        if (index === 3) {
            this.points = [this.points[0].clone().add(offset), this.points[1].clone().add(offset), this.points[2].clone().add(offset)]
        } else {
            this.points[index] = this.points[index].clone().add(offset)
        }
        return true
    } 
}
```

有了三角形，那么我们再思考等腰三角形是什么样的呢? 以下只是其中一种实现方式，你也可以通过其他方式实现。

首先等腰三角形也是三角形， 所以我们用三个点来表示等腰三角形的三个点， 分别是底部开始点和结束点以及顶点。

我们需要先知道中点，去计算这个三角形的高度， 然后通过三个点的位置关系确认三角形的方向

最好得到三角形的实际顶点位置

```ts

// 等腰三角形
export class MxDbIsoscelesTriangle extends MxDbTriangle {
    protected _propertyDbKeys = [...this._propertyDbKeys]

    getShapePoints() {
        const [baseStart, baseEnd, topPoint] = this.points
        // 计算等腰三角形底边的中点
        const midpoint = baseStart.clone().add(baseEnd).multiplyScalar(0.5);

        // 计算高度和顶点位置
        const height = topPoint.distanceTo(midpoint);


        // 计算topPoint相对于baseStart和baseEnd的位置关系
        const baseVector = new THREE.Vector3().subVectors(baseEnd, baseStart).normalize();
        const perpendicularVector = new THREE.Vector3().crossVectors(baseVector, new THREE.Vector3(0, 0, 1)).normalize();

        const direction = new THREE.Vector3().subVectors(topPoint, midpoint).dot(perpendicularVector);
        const vertex = midpoint.clone().addScaledVector(perpendicularVector, direction >= 0 ? height : -height);

        // 将三个点按照逆时针方向排列
        const _points = [baseStart, baseEnd, vertex];
        return _points;
    }
    getGripPoints() {
        return [...this.getShapePoints(), this.getCenter()]
    }
}
```

以上就是实现一个等腰三角形的全部过程。

那么我们要在画布上画出这个等腰三角形应该如何实现呢？

首先我们需要点击一个按钮, 表示开始画等腰三角形，

然后我们需要监听canvas上的点击事件， 并记录点击位置转换成three.js坐标，

最后将坐标值添加到MxDbIsoscelesTriangle实例中。

我们需要三个点的位置坐标，所以需要监听三次点击。

上述步骤比较繁琐, 为此mxdraw库提供了MrxDbgUiPrPoint 来帮助我们简化上述步骤

```ts
import { MrxDbgUiPrPoint } from "mxdraw"

const getPoint = new MrxDbgUiPrPoint()

async function drawTriangle() {
    // 表示一个等腰三角形
    const triangle = new MxDbIsoscelesTriangle()

    // 这里就是获取第一个鼠标点击的位置，并自动帮你转换成three.js坐标
    const pt1 = await getPoint.go()
    triangle.points.push(pt1)
    // 我们可能需要一个绘制的过程， 通过这样的方式就可以实现
    getPoint.setUserDraw((currentPoint, draw)=> {
        // 因为现在这个动态绘制只有两个已知点，所以无法构成三角形，我们就画一个直线，表示我们正在画三角形的底边
        draw.drawLine(currentPoint, pt1)
    })


    // 这时又在屏幕上点了以下得到了pt2这个坐标
    const pt2 = await getPoint.go()
    triangle.points.push(pt2)

    // 这时triangle三角形示例已经又两个点了，我们可以直接动态绘制过程绘制出这个三角形了，可以实时看见现在画出的三角形的样子。
     getPoint.setUserDraw((currentPoint, draw)=> {
        // 去设置三角形的最好一个点
        triangle.points[2] = currentPoint
        // 并且把它绘制出来
        draw.drawCustomEntity(triangle)
    })

    // 最后我们再次点击屏幕，确定下这个三角形的形状
    const pt3 = await getPoint.go()
    triangle.points[2] = pt3

    // 最后将它添加渲染到控件中，就完成了整个三角形的绘制
    MxFun.getCurrentDraw().addMxEntity(triangle)
}
// 最后将这个drawTriangle函数在点击按钮时触发就可以开始画等腰三角形了
```

我们将这个函数放在一个按钮的点击事件中，在`App.vue`的`<template></template>`中继续新增代码:

```html
<button @click="drawTriangle">绘制等腰三角形</button>
```

现在我们就可以看看画等腰三角形的功能是否实现了。
![等腰三角形效果图](./imgs//%E7%AD%89%E8%85%B0%E4%B8%89%E8%A7%92%E5%BD%A2%E6%95%88%E6%9E%9C%E5%9B%BE.png)

试试点击中点移动等腰三角形
![移动等腰三角形](./imgs/%E7%AD%89%E8%85%B0%E4%B8%89%E8%A7%92%E5%BD%A2%E7%A7%BB%E5%8A%A8%E5%9B%BE.png)

我们最后总结一下，我们需要先搭建一个在线CAD的网页，在网页上可以绘制自定义的等腰三角形

我们需要Node环境、Vite前端工程化项目、使用mxdraw、对CAD图纸进行转换、实现自定义形状

对于自定义形状，我们先定义了三角形，又根据三角形定义了等腰三角形的类。在效果图中，我们可以看见等腰三角形是有描边效果和填充效果，这些都是自定义形状的基类提供的功能。
你只需要设置对应的属性就可以实现对应的效果。

自定义图形类的属性和方法说明请参考:https://mxcad.github.io/mxdraw_api_docs/classes/MxDbShape.html

最后没有问题，我们可以通过在项目根目录运行命令:

```sh
npm run build
```

打包文件用打包线上的版本前端资源，在dist目录中是具体打包后的代码
