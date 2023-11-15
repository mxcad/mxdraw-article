# 使用mxcad绘制规则多边形图形


在 CAD（计算机辅助设计）领域，绘制多边形是常见的任务之一。MxCAD 是一款专注在线CAD的前端库，提供了丰富的绘图和设计功能，使得绘制多边形变得轻松而灵活。本文将带领您通过使用 MxCAD 实现绘制多边形的过程，深入了解其基本概念和功能。

[mxcad](https://mxcadx.gitee.io/mxcad_docs/) 是一个基于 TypeScript 的前端库，专为 CAD 开发者设计。它提供了丰富的 API 和功能，用于创建、编辑和展示 CAD 图形。通过导入各种模块实现各种绘制任务。

下面以绘制规则多边形为例，介绍如何使用 mxcad 绘制多边形。

```ts
import { DynamicInputType, MrxDbgUiPrInt, MrxDbgUiPrPoint, MxCursorType, MxFun } from "mxdraw";
import { MxCpp, McCmColor, McDbCircle, McDbPolyline, McGePoint3d, MxCADUiPrInt, MxCADUiPrPoint } from "mxcad";
```

上述代码片段导入 mxcad和mxdraw 的在本文中会用到的模块。其中 DynamicInputType、MrxDbgUiPrInt 等是 MxCAD 提供的功能模块，而 McDbCircle、McDbPolyline 则是表示 CAD 图形的对象。

如果看了文中导出的API使用示例不理解可以在[mxcadAPI文档](https://mxcadx.gitee.io/mxcad_docs/api/README.html)或者[mxdrawAPI文档](https://mxcadx.gitee.io/mxdraw_api_docs/)中查找对应说明。

理解生成规则多边形的算法的每一步计算对于绘制正多边形非常重要。以下是 `computeRegularPolygonVertices` 函数的详细解释：

```ts
/**
 * 生成规则多边形的顶点坐标
 * @param {McGePoint3d} centerPoint - 多边形中心点
 * @param {McGePoint3d} vertexPoint - 多边形顶点
 * @param {number} sides - 多边形边数（至少为3）
 * @returns {McGePoint3d[]} 多边形的顶点坐标数组
 */
export function computeRegularPolygonVertices(centerPoint = new McGePoint3d(), vertexPoint = new McGePoint3d(), sides = 3): McGePoint3d[] {
    const verticesArray: McGePoint3d[] = [];
    sides = Math.max(3, sides);
    verticesArray.push(vertexPoint);

    // 计算每个顶点的角度增量
    const angleIncrement = (Math.PI * 2) / sides;

    for (let i = 1; i < sides; i++) {
        // 计算当前顶点对应的角度上的余弦和正弦值
        const cosValue = Math.cos(angleIncrement * i),
            sinValue = Math.sin(angleIncrement * i);

        // 复制中心点和顶点，以免修改原始点的值
        const startPt = centerPoint.clone();
        const endPt = vertexPoint.clone();

        // 计算相对于中心点的偏移量
        const deltaX = endPt.x - startPt.x;
        const deltaY = endPt.y - startPt.y;

        // 根据旋转公式计算新的顶点坐标
        const newX = deltaX * cosValue - deltaY * sinValue + startPt.x;
        const newY = deltaX * sinValue + deltaY * cosValue + startPt.y;

        // 创建新的顶点对象并加入数组
        const point = new McGePoint3d(newX, newY);
        verticesArray.push(point);
    }

    return verticesArray;
}
```

下面是算法的每一步计算的详细解释：

1. **初始化参数：** 首先，函数初始化了一个空数组 `verticesArray` 用于存储多边形的顶点坐标。同时，确保多边形的边数至少为3，如果用户输入的边数小于3，就将边数设置为3。

    ```javascript
    const verticesArray: McGePoint3d[] = [];
    sides = Math.max(3, sides);
    verticesArray.push(vertexPoint);
    ```

2. **计算角度增量：** 通过将完整的圆周角（2π）除以多边形的边数，计算出每个顶点之间的角度增量。

    ```javascript
    const angleIncrement = (Math.PI * 2) / sides;
    ```

3. **计算顶点坐标：** 利用余弦和正弦值计算每个顶点相对于起始点的偏移量。这里采用了旋转公式，通过旋转坐标系来计算新的顶点坐标。

    ```javascript
    const cosValue = Math.cos(angleIncrement * i),
        sinValue = Math.sin(angleIncrement * i);
    ```

4. **复制中心点和顶点：** 为了防止修改原始点的值，创建了中心点和顶点的副本。

    ```javascript
    const startPt = centerPoint.clone();
    const endPt = vertexPoint.clone();
    ```

5. **计算偏移量：** 计算相对于中心点的偏移量，即顶点相对于中心点的位置。

    ```javascript
    const deltaX = endPt.x - startPt.x;
    const deltaY = endPt.y - startPt.y;
    ```

6. **旋转计算新坐标：** 利用旋转公式计算新的顶点坐标，并将其添加到顶点数组中。

    ```javascript
    const newX = deltaX * cosValue - deltaY * sinValue + startPt.x;
    const newY = deltaX * sinValue + deltaY * cosValue + startPt.y;
    const point = new McGePoint3d(newX, newY);
    verticesArray.push(point);
    ```

7. **返回结果：** 最终，返回计算得到的多边形的顶点坐标数组。

    ```javascript
    return verticesArray;
    ```

通过这个算法，我们可以在 CAD 中绘制出规则多边形，而不仅仅是简单的直角坐标系中的顶点。这使得多边形的绘制更加灵活和适应性强。

与之对应的，我们从注释可以看出, 他们是通过多边形中心点和多边形顶点来计算出整个多边形的顶点坐标。

那么在autoCad中,还有其他方式可以绘制正多边形，那么我们接下来一一将这些算法实现。

下面是 `computePolygonVerticesFromEdge` 函数的详细解释：

```javascript
/**
 * 计算多边形顶点坐标（基于边）
 * @param {McGePoint3d} startPoint - 多边形边的起始点
 * @param {McGePoint3d} endPoint - 多边形边的结束点
 * @param {number} sides - 多边形边数（至少为3）
 * @returns {McGePoint3d[]} 多边形的顶点坐标数组
 */
export function computePolygonVerticesFromEdge(startPoint: McGePoint3d, endPoint: McGePoint3d, sides: number): McGePoint3d[] {
    // 计算边的长度和角度
    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;
    let length = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);

    // 计算每个顶点的角度增量
    let angleIncrement = (2 * Math.PI) / Math.max(3, sides);

    let polygonVertices = [startPoint, endPoint];

    for (let i = 0; i < sides; i++) {
        // 计算当前顶点的坐标
        let x = startPoint.x + length * Math.cos(angle + i * angleIncrement);
        let y = startPoint.y + length * Math.sin(angle + i * angleIncrement);

        // 更新起始点并加入数组
        startPoint = new McGePoint3d(x, y);
        polygonVertices.push(startPoint);
    }

    return polygonVertices;
}
```

以下是该算法的每一步计算的详细解释：

1. **计算边的长度和角度：** 首先，计算给定边的长度和角度。这是通过计算起始点和结束点的横向和纵向差异，然后使用勾股定理计算长度，最后使用反正切函数计算角度。

    ```javascript
    let dx = endPoint.x - startPoint.x;
    let dy = endPoint.y - startPoint.y;
    let length = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);
    ```

2. **计算每个顶点的角度增量：** 为了均匀地分布多边形的顶点，计算每个顶点之间的角度增量。

    ```javascript
    let angleIncrement = (2 * Math.PI) / Math.max(3, sides);
    ```

3. **初始化顶点数组：** 创建一个数组，其中包含起始点和结束点，这是为了确保多边形是封闭的。

    ```javascript
    let polygonVertices = [startPoint, endPoint];
    ```

4. **计算顶点坐标：** 循环计算每个顶点的坐标。利用极坐标系的转换，通过给定的角度增量计算出每个顶点相对于起始点的坐标。

    ```javascript
    for (let i = 0; i < sides; i++) {
        let x = startPoint.x + length * Math.cos(angle + i * angleIncrement);
        let y = startPoint.y + length * Math.sin(angle + i * angleIncrement);
        startPoint = new McGePoint3d(x, y);
        polygonVertices.push(startPoint);
    }
    ```

5. **返回结果：** 最终，返回计算得到的多边形的顶点坐标数组。

    ```javascript
    return polygonVertices;
    ```

通过这个算法，我们可以根据给定的起始点和结束点绘制多边形。

下面是 `computePolygonVerticesFromMidpoint` 函数的详细解释：

```javascript
/**
 * 计算多边形顶点坐标（基于中点）
 * @param {McGePoint3d} centerPoint - 多边形中心点
 * @param {McGePoint3d} edgeMidPoint - 多边形一条边的中点
 * @param {number} sides - 多边形边数（至少为3）
 * @returns {McGePoint3d[]} 多边形的顶点坐标数组
 */
function computePolygonVerticesFromMidpoint(centerPoint = new McGePoint3d(), edgeMidPoint = new McGePoint3d(), sides = 3): McGePoint3d[] {
    const midX = edgeMidPoint.x;
    const midY = edgeMidPoint.y;
    const centerX = centerPoint.x;
    const centerY = centerPoint.y;
    const numberOfSides = Math.max(3, sides);

    // 计算中点到多边形中心的距离
    const distanceToCenter = Math.sqrt((midX - centerX) ** 2 + (midY - centerY) ** 2);

    // 计算中点到多边形中心的半径
    const radius = distanceToCenter / Math.cos(Math.PI / numberOfSides);

    // 计算起始角度
    const startAngle = Math.atan2(midY - centerY, midX - centerX) - Math.PI / numberOfSides;

    const vertices = [];

    for (let i = 0; i < numberOfSides; i++) {
        // 计算当前顶点的角度
        const angle = startAngle + (i * 2 * Math.PI / numberOfSides);

        // 根据极坐标系转换成直角坐标系的坐标
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // 创建新的顶点对象并加入数组
        vertices.push(new McGePoint3d(x, y));
    }

    return vertices;
}
```

以下是该算法的每一步计算的详细解释：

1. **获取中点和中心点的坐标：** 首先，获取给定边的中点（`edgeMidPoint`）和多边形的中心点（`centerPoint`）的坐标。

    ```javascript
    const midX = edgeMidPoint.x;
    const midY = edgeMidPoint.y;
    const centerX = centerPoint.x;
    const centerY = centerPoint.y;
    ```

2. **计算中点到中心的距离和半径：** 利用勾股定理计算中点到中心的距离，然后计算出多边形的半径。

    ```javascript
    const distanceToCenter = Math.sqrt((midX - centerX) ** 2 + (midY - centerY) ** 2);
    const radius = distanceToCenter / Math.cos(Math.PI / numberOfSides);
    ```

3. **计算起始角度：** 利用反正切函数计算出中点到中心的方向角，并减去角度增量的一半，以确保多边形顶点的均匀分布。

    ```javascript
    const startAngle = Math.atan2(midY - centerY, midX - centerX) - Math.PI / numberOfSides;
    ```

4. **计算顶点坐标：** 循环计算每个顶点的坐标。通过极坐标系转换，将极坐标系中的角度转换为直角坐标系中的坐标。

    ```javascript
    for (let i = 0; i < numberOfSides; i++) {
        const angle = startAngle + (i * 2 * Math.PI / numberOfSides);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push(new McGePoint3d(x, y));
    }
    ```

5. **返回结果：** 最终，返回计算得到的多边形的顶点坐标数组。

    ```javascript
    return vertices;
    ```

通过这个算法，我们可以根据给定的边的中点和多边形的中心点绘制多边形。

以上我们介绍了这三种算法，已经把autoCAD中绘制正多边形的算法都模拟出来了，那么接下来就是模拟它的交互绘制过程了。

代码如下:

```ts
/**
 * 绘制多边形的函数
 */
export async function drawPolygon() {
    // 创建用户输入对象，用于获取侧面数
    const getNum = new MxCADUiPrInt();
    getNum.setMessage("\n输入侧面数 <5>")
    
    // 获取用户输入的侧面数
    let sideNum = await getNum.go() as number;
    if (!sideNum) sideNum = 5;

    // 创建用户输入对象，用于获取多边形的中心点或边
    const getPoint = new MxCADUiPrPoint();
    getPoint.setMessage("\n指定正多变形的中心点");
    getPoint.setKeyWords("[边(E)]");

    // 设置光标类型
    getPoint.setCursorType(MxCursorType.kCross);

    // 获取用户输入的中心点或边
    const centerPoint = await getPoint.go();

    if (!centerPoint) {
        // 如果用户选择边，进入边绘制流程
        if (getPoint.isKeyWordPicked("e")) {
            // 获取用户输入的边的第一个端点
            getPoint.setMessage("\n指定边的第一个端点");
            getPoint.setKeyWords("");
            const startPoint = await getPoint.go();

            if (!startPoint) return;

            // 设置用户绘制回调函数，用于实时绘制多边形
            getPoint.setUserDraw((currentPoint, pWorldDraw) => {
                const pPolyline = new McDbPolyline();
                // 计算多边形顶点
                const points = computePolygonVerticesFromEdge(startPoint, currentPoint, sideNum);

                // 将顶点添加到多边形
                points.forEach((point) => {
                    pPolyline.addVertexAt(point);
                });

                // 设置多边形为闭合状态
                pPolyline.isClosed = true;

                // 实时绘制多边形
                pWorldDraw.drawMcDbEntity(pPolyline);
            });

            // 获取用户输入的边的第二个端点
            getPoint.setMessage("\n指定边的第二个端点");
            await getPoint.go();

            // 绘制多边形并清除绘制保留
            getPoint.drawReserve();
        }
        return;
    }

    // 用户选择中心点后的绘制流程
    getPoint.setMessage("\n输入选项");
    getPoint.setKeyWords("[内接于圆(I)/外切于圆(C)]");

    // 获取用户选择的是内切圆还是外切圆
    await getPoint.go();
    let isTangentToTheCircle = true;
    if(getPoint.isKeyWordPicked("i")) isTangentToTheCircle = false;

    // 设置用户绘制回调函数，用于实时绘制多边形
    getPoint.setUserDraw((currentPoint, pWorldDraw) => {
        // 获取当前绘图颜色
        let drawColor = MxCpp.getCurrentMxCAD().getCurrentDatabaseDrawColor();

        // 创建多边形对象
        const pPolyline = new McDbPolyline();
        pPolyline.trueColor = new McCmColor(drawColor.r, drawColor.g, drawColor.b);

        // 计算多边形顶点
        const points = isTangentToTheCircle ? computePolygonVerticesFromMidpoint(centerPoint, currentPoint, sideNum) : computeRegularPolygonVertices(centerPoint, currentPoint, sideNum);

        // 将顶点添加到多边形
        points.forEach((pt) => {
            pPolyline.addVertexAt(pt);
        });

        // 设置多边形为闭合状态
        pPolyline.isClosed = true;

        // 实时绘制多边形
        pWorldDraw.drawMcDbEntity(pPolyline);
    });

    // 获取用户输入的圆的半径
    getPoint.setMessage("\n指定圆的半径");
    await getPoint.go();

    // 绘制多边形并清除绘制保留
    getPoint.drawReserve();
}

// 将绘制多边形的函数注册为MxCAD命令
MxFun.addCommand("Mx_Polygon", drawPolygon);
```

详细说明一下整个绘制的过程

1.用户输入

首先，我们需要从用户那里获取一些信息，包括多边形的侧面数以及中心点或边的位置。为了实现这一点，我们使用了 `MxCADUiPrInt` 和 `MxCADUiPrPoint` 类。

```javascript
const getNum = new MxCADUiPrInt();
getNum.setMessage("\n输入侧面数 <5>")
let sideNum = await getNum.go() as number;
if (!sideNum) sideNum = 5;

const getPoint = new MxCADUiPrPoint();
getPoint.setMessage("\n指定正多变形的中心点");
getPoint.setKeyWords("[边(E)]");
```

在这里，我们设置了一个消息，提示用户输入多边形的侧面数。如果用户没有输入，默认为5。然后，我们创建了一个用于获取点的对象，并设置了一些参数，包括用户可能的关键字（在这里是选择边的标志）。

2.选择中心点或边

通过 `getPoint.go()`，我们等待用户选择中心点或边。如果用户选择了边，我们进入边绘制的流程，否则，我们将继续中心点的绘制。

```javascript
const centerPoint = await getPoint.go();
if (!centerPoint) {
    if (getPoint.isKeyWordPicked("e")) {
        // 边绘制流程...
    }
    return;
}
```

这一步是用户与程序的第一次交互，用户可以选择是通过中心点绘制多边形，还是选择一条边开始绘制。这增加了用户的灵活性，使得工具更加实用。

3.边绘制流程

如果用户选择了边，我们首先获取边的起始点，然后设置用户绘制回调函数。这个回调函数用于实时绘制多边形，以便用户在选择边的过程中看到预览效果。

```javascript
const startPoint = await getPoint.go();
if (!startPoint) return;

getPoint.setUserDraw((currentPoint, pWorldDraw) => {
    // 实时绘制多边形...
});

await getPoint.go();
getPoint.drawReserve();
```

在这一步中，我们利用用户输入的起始点，实时计算并绘制多边形的预览效果。用户可以看到一个动态的多边形，随着鼠标移动而更新。

4.中心点绘制流程

如果用户选择了中心点，我们首先获取用户选择的是内切圆还是外切圆。然后，我们设置用户绘制回调函数，用于实时绘制多边形，并获取用户输入的圆的半径。

```javascript
getPoint.setMessage("\n输入选项");
getPoint.setKeyWords("[内接于圆(I)/外切于圆(C)]");
await getPoint.go();

getPoint.setUserDraw((currentPoint, pWorldDraw) => {
    // 实时绘制多边形...
});

getPoint.setMessage("\n指定圆的半径");
await getPoint.go();
getPoint.drawReserve();
```

这一步用户有选择地指定了多边形是内接于圆还是外切于圆，进一步增加了工具的功能。

5.实时绘制多边形

在用户选择中心点或边后，通过用户绘制回调函数，我们实时计算多边形的顶点，并使用 MxCAD 提供的绘图工具实时绘制多边形的预览效果。

```javascript
getPoint.setUserDraw((currentPoint, pWorldDraw) => {
    // 获取当前绘图颜色...
    let drawColor = MxCpp.getCurrentMxCAD().getCurrentDatabaseDrawColor();

    // 创建多边形对象...
    const pPolyline = new McDbPolyline();
    pPolyline.trueColor = new McCmColor(drawColor.r, drawColor.g, drawColor.b);

    // 计算多边形顶点...
    const points = isTangentToTheCircle ? computePolygonVerticesFromMidpoint(centerPoint, currentPoint, sideNum) : computeRegularPolygonVertices(centerPoint, currentPoint, sideNum);

    // 将顶点添加到多边形...
    points.forEach((pt) => {
        pPolyline.addVertexAt(pt);
    });

    // 设置多边形为闭合状态...
    pPolyline.isClosed = true;

    // 实时绘制多边形...
    pWorldDraw.drawMcDbEntity(pPolyline);
});
```

这一步是整个流程的关键，它展示了用户如何与实时绘制进行交互。用户在选择中心点或边后，可以通过鼠标移动来动态地看到多边形的形状。这种实时反馈是提高用户体验的重要因素。

6.注册为MxCAD命令

最后，我们将绘制多边形的函数注册为 MxCAD 命令，以便用户可以通过命令行调用。

```javascript
MxFun.addCommand("Mx_Polygon", drawPolygon);
```

通过这一系列步骤，我们演示了如何使用 MxCAD 来实现一个交互式的多边形绘制。
这不仅涵盖了用户输入的处理，还展示了如何结合 MxCAD 提供的功能来实现实时绘制和用户选择的功能。
通过使用mxcad，使开发者能够专注于业务逻辑而不是底层图形处理和交互处理。

实际效果查看:<https://demo.mxdraw3d.com:3000/mxcad/>
在页面的命令行输入`Mx_Polygon`
