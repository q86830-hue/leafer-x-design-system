# LeaferJS 深度学习知识库

## 概述

LeaferJS 是一款好用的 Canvas 引擎，革新的开发体验，可用于：
- 高效绘图
- UI 交互（小游戏、互动应用、组态）
- 图形编辑

**核心特性：**
- 66KB min+gzip 零依赖 (leafer-ui)
- 丰富的 UI 绘图元素
- 开箱即用的功能（自动布局、图形编辑、SVG 导出）
- 方便与 PS、Figma、Sketch 等产品对接
- 统一的交互事件（拖拽、旋转、缩放手势）
- 支持跨平台开发

## 核心概念

### 1. Leafer 引擎

Leafer 引擎是一个树状结构，提供布局、渲染等管理功能：

```javascript
// 创建固定宽高的 Leafer
const leafer = new Leafer({
    view: window,  // 支持 window、div、canvas 标签对象，或 id 字符串
    width: 600,
    height: 600,
    fill: '#333'   // 背景色
})

// 自适应布局
const leafer = new Leafer({ view: window, fill: '#333' })

// 自动生长（画布大小贴合内容）
const leafer = new Leafer({ view: window, grow: true, fill: '#333' })
```

### 2. 图形元素

#### 基础图形

**Rect - 矩形**
```javascript
// 标准创建
const rect = new Rect({
    x: 100, y: 100,
    width: 100, height: 100,
    fill: '#32cd79',
    cornerRadius: [0, 40, 20, 40]  // 不同圆角
})

// 简洁创建
const rect = Rect.one({ fill: '#32cd79' }, 100, 100, 100, 100)
```

**Ellipse - 椭圆/圆形**
```javascript
const ellipse = new Ellipse({
    width: 100, height: 100,
    startAngle: -60,    // 扇形起始角度
    endAngle: 180,      // 扇形结束角度
    innerRadius: 0.5,   // 内半径（圆环）
    fill: "#32cd79"
})
```

**Line - 线条**
```javascript
const line = new Line({
    width: 100,
    strokeWidth: 5,
    stroke: '#32cd79',
    dashPattern: [6, 6]  // 虚线
})
```

**Polygon - 多边形**
```javascript
const polygon = new Polygon({
    width: 100, height: 100,
    sides: 6,           // 边数
    cornerRadius: 10,   // 圆角
    fill: '#32cd79'
})
```

**Star - 星形**
```javascript
const star = new Star({
    width: 100, height: 100,
    innerRadius: 0.5,   // 内半径比例
    corners: 8,         // 角数
    cornerRadius: 5,
    fill: '#32cd79'
})
```

**Path - 路径**
```javascript
const path = new Path({
    path: 'M945.344 586.304c...',  // SVG 路径字符串
    fill: '#32cd79'
})
```

**Pen - 画笔**
```javascript
const pen = new Pen()
pen.setStyle({ fill: '#FF4B4B', windingRule: 'evenodd' })
pen.roundRect(0, 0, 100, 100, 30).arc(50, 50, 25)
```

#### 媒体元素

**Image - 图片**
```javascript
const image = new Image({
    url: '/image/leafer.jpg',
    draggable: true
})

// 加载 SVG
const image = new Image({
    url: Platform.toURL(svgString, 'svg'),
    draggable: true
})
```

**Canvas - 画布**
```javascript
const canvas = new Canvas({ width: 800, height: 600 })
const { context } = canvas
context.fillStyle = '#FF4B4B'
context.beginPath()
context.roundRect(0, 0, 100, 100, 30)
context.fill()
canvas.paint()  // 更新渲染
```

**Text - 文本**
```javascript
const text = new Text({
    fill: '#32cd79',
    text: 'Welcome to LeaferJS',
    fontSize: 16,
    fontFamily: 'Arial'
})
```

#### 容器元素

**Group - 组**
```javascript
const group = new Group({ x: 100, y: 100 })
group.add([rect, ellipse])
leafer.add(group)
```

**Box - 盒子（带样式的组）**
```javascript
const box = new Box({
    width: 100, height: 100,
    fill: '#FF4B4B'
})
box.add(circle)
```

**Frame - 画板**
```javascript
const frame = new Frame({
    width: 100, height: 100  // 默认白色背景，会裁剪超出内容
})
frame.add(circle)
```

### 3. 样式系统

#### 填充 (Fill)

```javascript
// 纯色填充
fill: '#32cd79'

// 线性渐变
fill: {
    type: 'linear',
    from: 'top',      // 或 'left', 'right', 'bottom'
    to: 'bottom',
    stops: ['#FF4B4B', '#FEB027']
}

// 径向渐变
fill: {
    type: 'radial',
    stops: ['#FF4B4B', '#FEB027']
}

// 图案填充
fill: {
    type: 'image',
    url: '/image/pattern.png'
}
```

#### 描边 (Stroke)

```javascript
stroke: '#32cd79'
strokeWidth: 2
strokeAlign: 'center'    // 'inside', 'center', 'outside'
strokeCap: 'round'       // 'none', 'round', 'square'
strokeJoin: 'round'      // 'miter', 'bevel', 'round'
dashPattern: [6, 6]      // 虚线模式
dashOffset: 6           // 虚线偏移
strokeScaleFixed: true   // 固定线宽（不受缩放影响）
```

#### 阴影

```javascript
// 外阴影
shadow: {
    x: 10, y: -10,
    blur: 20,
    color: '#FF0000AA'
}

// 内阴影
innerShadow: {
    x: 10, y: 5,
    blur: 20,
    color: '#FF0000AA'
}
```

#### 高级定位

```javascript
// 原点（旋转/缩放中心）
origin: 'center'  // 或 'top-left', 'top-right', 'bottom-left', 'bottom-right'

// 围绕点绘制（类似锚点）
around: 'center'

// 层级
zIndex: 10

// 可见性
visible: false
opacity: 0.5
```

### 4. 事件系统

```javascript
import { PointerEvent, DragEvent, DropEvent } from 'leafer-ui'

// 监听事件
rect.on(PointerEvent.ENTER, (e) => {
    e.current.fill = '#42dd89'
})

rect.on(PointerEvent.LEAVE, (e) => {
    e.current.fill = '#32cd79'
})

// 使用字符串
rect.on('pointer.enter', onEnter)

// 初始化时传入事件
const rect = Rect.one({
    fill: '#32cd79',
    draggable: true,
    event: {
        [PointerEvent.ENTER]: function(e) {
            e.current.fill = '#42dd89'
        }
    }
}, 100, 100, 200, 200)
```

### 5. 交互属性

```javascript
{
    hittable: true,           // 是否响应交互
    hitChildren: true,        // 子元素是否可交互
    hitSelf: true,            // 自身是否可交互
    hitFill: true,            // fill 区域是否可交互
    hitStroke: true,          // stroke 区域是否可交互
    draggable: true,          // 是否可拖拽
    editable: true,           // 是否可编辑（需插件）
    cursor: 'pointer',        // 光标样式
    
    // 状态样式（需交互状态插件）
    hoverStyle: { fill: '#42dd89' },
    pressStyle: { fill: '#22bd69' },
    focusStyle: { stroke: '#000' },
    selectedStyle: { stroke: '#00f' },
    disabledStyle: { opacity: 0.5 }
}
```

### 6. 动画系统

```javascript
import '@leafer-in/animate'

// 基础动画
const rect = new Rect({
    fill: '#32cd79',
    animation: {
        style: { x: 500, fill: '#ffcd00' },
        duration: 1,
        swing: true  // 摇摆循环
    }
})

// 关键帧动画
animation: {
    keyframes: [
        { style: { x: 150, scaleX: 2 }, duration: 0.5 },
        { style: { x: 50, scaleX: 1 }, duration: 0.2 },
        { x: 550, easing: 'bounce-out' }
    ],
    duration: 3,
    loop: true,
    join: true  // 加入初始状态作为 from 关键帧
}

// 入场/出场动画
animation: {
    keyframes: [{ opacity: 0, offsetX: -150 }, { opacity: 1, offsetX: 0 }],
    duration: 0.8
},
animationOut: {
    style: { opacity: 0, offsetX: 150 },
    duration: 0.8
}
```

### 7. JSON 数据导入导出

```javascript
// 导出 JSON
const json = leafer.toJSON()
const jsonString = leafer.toString()

// 导入 JSON
leafer.add(json)

// 使用 tag 创建
leafer.add({
    tag: 'Rect',
    x: 100, y: 100,
    width: 100, height: 100,
    fill: '#32cd79'
})

// 复杂结构
const json = {
    tag: 'Group',
    x: 20, y: 20,
    children: [{
        tag: 'Rect',
        x: 100, y: 100,
        width: 100, height: 100,
        fill: '#32cd79',
        draggable: true
    }]
}
```

### 8. Node.js 服务端渲染

```javascript
const { Leafer, Rect, useCanvas } = require('@leafer-ui/node')
const skia = require('skia-canvas')

// 初始化 Canvas 环境
useCanvas('skia', skia)

// 创建 Leafer
const leafer = new Leafer({
    width: 600,
    height: 600,
    pixelRatio: 2,
    fill: '#333'
})

// 添加元素
leafer.add(new Rect({
    x: 100, y: 100,
    width: 100, height: 100,
    fill: '#32cd79'
}))

// 等待准备就绪
await new Promise(resolve => {
    leafer.once('ready', resolve)
})

// 导出图片
const buffer = await leafer.canvas.view.toBuffer('image/png')
fs.writeFileSync('output.png', buffer)

// 销毁
leafer.destroy()
```

## 最佳实践

### 1. 性能优化

- 使用 `pixelRatio` 控制渲染精度
- 批量添加元素而非逐个添加
- 使用 `visible: false` 隐藏而非移除元素
- 利用缓存机制

### 2. 响应式设计

- 使用自适应布局 (`view: window`)
- 使用 `grow: true` 自动贴合内容
- 使用相对定位而非绝对定位

### 3. 可访问性

- 提供适当的交互反馈（hover、press 样式）
- 使用语义化的元素标签
- 确保足够的对比度

### 4. 与 AI 结合

LeaferJS 的 JSON 数据结构清晰，便于 AI 理解和生成：

```javascript
// AI 友好的数据结构
{
    tag: 'Rect',
    x: 100, y: 100,
    width: 200, height: 100,
    fill: '#32cd79',
    cornerRadius: 10,
    shadow: { x: 0, y: 4, blur: 10, color: '#00000033' }
}
```

## 9. 插件系统

### 9.1 图形编辑器插件 (@leafer-in/editor)

```javascript
import '@leafer-in/editor'
import '@leafer-in/viewport'

const app = new App({
    view: window,
    fill: '#333',
    editor: {}  // 自动创建 editor 实例
})

// 添加可编辑元素
app.tree.add(Rect.one({ 
    editable: true,  // 启用编辑
    fill: '#FEB027' 
}, 100, 100))
```

**编辑功能：**
- 移动、缩放、旋转、倾斜
- 多选、框选、编组
- 锁定、层级调整
- 自定义编辑工具

### 9.2 交互状态插件 (@leafer-in/state)

```javascript
import '@leafer-in/state'
import '@leafer-in/animate'

const box = new Box({
    x: 100, y: 100,
    fill: '#32cd79',
    cornerRadius: 5,
    origin: 'center',
    
    button: true,  // 标记为按钮
    
    hoverStyle: {  // hover 状态
        fill: '#FF4B4B',
        scale: 1.5,
        cornerRadius: 20,
    },
    pressStyle: {  // 按下状态
        fill: '#FEB027',
        scale: 1.1,
        transitionOut: 'bounce-out'
    },
    
    children: [{
        tag: 'Text',
        text: 'Button',
        hoverStyle: { fill: 'black' }
    }]
})
```

**状态类型：**
- `hoverStyle` - 鼠标悬停
- `pressStyle` - 鼠标按下
- `focusStyle` - 聚焦状态
- `selectedStyle` - 选中状态
- `disabledStyle` - 禁用状态

### 9.3 导出插件 (@leafer-in/export)

```javascript
import '@leafer-in/export'

// 导出为图片文件
rect.export('test.png')

// 导出高清图
rect.export('HD.png', { pixelRatio: 2 })

// 导出 Base64
rect.export('jpg').then(result => {
    console.log(result.data)  // base64 数据
})

// 同步导出
const result = rect.syncExport('jpg')

// 导出二进制
rect.export('png', { blob: true })

// 带水印导出
rect.export('test.png', {
    pixelRatio: 2,
    onCanvas(canvas) {
        const { context, width, height } = canvas
        context.fillText('水印', width - 60, height - 20)
    }
})

// 截图导出
leafer.export('screenshot.png', { screenshot: true })
```

## 10. 坐标系统

LeaferJS 使用多层级的树状结构，每个层级都有独立的坐标系：

### 10.1 坐标系类型

**内部坐标系 (inner)**
- 以元素的 x,y 位置为起点 (0,0)
- 元素的 width、height、路径坐标
- 不受 x、y、scale、rotation 影响

**本地坐标系 (local)**
- 相对父元素的坐标
- 类似 HTML 的 offset 坐标系
- 受元素的 x、y、scale、rotation 影响

**场景坐标系 (page)**
- 相对缩放层的坐标
- 第一层根元素添加在此坐标系

**世界坐标系 (world)**
- 画布视口坐标
- 以画布左上角为起点 (0,0)
- 交互事件中的坐标基本都是世界坐标

### 10.2 坐标转换方法

```javascript
// 世界坐标转本地坐标
const localPoint = element.getLocalPoint(worldPoint)

// 世界坐标转内部坐标
const innerPoint = element.getInnerPoint(worldPoint)

// 内部坐标转世界坐标
const worldPoint = element.getWorldPoint(innerPoint)

// 获取 page 坐标
const pagePoint = element.getPagePoint(worldPoint)
```

## 11. 动画系统深入

### 11.1 基础动画

```javascript
import '@leafer-in/animate'

const rect = new Rect({
    fill: '#32cd79',
    animation: {
        style: { x: 500, fill: '#ffcd00' },
        duration: 1,
        swing: true  // 摇摆循环
    }
})
```

### 11.2 关键帧动画

```javascript
animation: {
    keyframes: [
        { style: { x: 150, scaleX: 2 }, duration: 0.5 },
        { style: { x: 50, scaleX: 1 }, duration: 0.2 },
        { x: 550, easing: 'bounce-out' }
    ],
    duration: 3,
    loop: true,
    join: true  // 加入初始状态作为 from 关键帧
}
```

### 11.3 入场/出场动画

```javascript
animation: {
    keyframes: [{ opacity: 0, offsetX: -150 }, { opacity: 1, offsetX: 0 }],
    duration: 0.8
},
animationOut: {
    style: { opacity: 0, offsetX: 150 },
    duration: 0.8
}
```

### 11.4 过渡效果

```javascript
// 状态过渡
transition: {
    duration: 0.3,
    easing: 'ease-out'
}

// 退出状态过渡
transitionOut: {
    duration: 0.5,
    easing: 'bounce-out'
}
```

## 12. 更多插件详解

### 12.1 自动布局插件 (@leafer-in/flow)

```javascript
import { Flow } from '@leafer-in/flow'

const flow = new Flow({
    fill: '#676',
    width: 100,
    height: 100,
    children: [
        new Box({ fill: '#FF4B4B' }),
        new Box({ fill: '#FEB027' }),
        new Box({ fill: '#79CB4D' })
    ]
})
```

### 12.2 运动路径插件 (@leafer-in/motion-path)

```javascript
import '@leafer-in/motion-path'

// 沿路径运动
const car = new Path({
    motion: 0,  // 起始位置
    animation: {
        style: { motion: { type: "percent", value: 1 } },
        duration: 9,
        loop: true
    }
})

// 描边生长动画
const path = new Path({
    motionPath: true,
    motion: 0,
    animation: {
        style: { motion: { type: "percent", value: 1 } },
        duration: 9,
        loop: true
    }
})
```

### 12.3 查找插件 (@leafer-in/find)

```javascript
import '@leafer-in/find'

// 通过 id 查找
const element = leafer.findId('myId')

// 通过 tag 查找
const rects = leafer.findTag('Rect')

// 通过 className 查找
const items = leafer.find('.item')

// 复杂条件查找
const result = leafer.find((element) => {
    return element.x > 100 && element.fill === '#32cd79'
})

// 只查找一个
const first = leafer.findOne('Rect')
```

### 12.4 调整大小插件 (@leafer-in/resize)

```javascript
import '@leafer-in/resize'

// 调整宽度
rect.resizeWidth(200)

// 调整高度
rect.resizeHeight(100)

// 缩放调整
rect.scaleResize(1.5)

// 锁定比例
rect.lockRatio = true
```

## 13. 包围盒系统

### 13.1 边界类型

**内容边界 (content)**
- 填充内容的边界，不包含 padding
- 一般用于 Text 元素

**基准边界 (box)**
- 包含 padding，以此为基准向内、向外延伸边界

**笔触边界 (stroke)**
- 基准边界 + stroke
- 可响应交互事件的边界

**外部边界 (margin)**
- 基准边界 + margin

**渲染边界 (render)**
- 笔触边界 + 阴影等

### 13.2 获取边界方法

```javascript
// 内部坐标系边界
const boxBounds = element.boxBounds

// 世界坐标系边界
const worldBounds = element.worldBoxBounds
const renderBounds = element.worldRenderBounds

// 获取方法
const bounds = element.getBounds()
const layoutBounds = element.getLayoutBounds()
const layoutPoints = element.getLayoutPoints()
```

## 14. 性能优化最佳实践

### 14.1 渲染优化

```javascript
// 1. 使用合适的 pixelRatio
const leafer = new Leafer({
    pixelRatio: 2  // 根据设备调整
})

// 2. 批量添加元素
leafer.add([element1, element2, element3])

// 3. 使用 visible 而非移除元素
element.visible = false  // 比 remove() 更高效

// 4. 使用缓存
const renderer = new LeaferRenderer({
    maxCacheSize: 100
})
```

### 14.2 内存优化

```javascript
// 及时销毁不再使用的元素
element.destroy()

// 批量销毁
leafer.destroy()
```

### 14.3 事件优化

```javascript
// 使用事件委托
leafer.on(PointerEvent.DOWN, (e) => {
    console.log(e.target)  // 实际点击的元素
})

// 避免过多事件监听
// 使用 hittable 控制交互
```

## 15. 完整插件清单

| 插件 | 功能 | 安装 | 重要性 |
|------|------|------|--------|
| `@leafer-in/animate` | 动画系统 | `npm i @leafer-in/animate` | ⭐⭐⭐ |
| `@leafer-in/arrow` | 箭头绘制 | `npm i @leafer-in/arrow` | ⭐⭐ |
| `@leafer-in/editor` | 图形编辑器 | `npm i @leafer-in/editor` | ⭐⭐⭐ |
| `@leafer-in/export` | 导出功能 | `npm i @leafer-in/export` | ⭐⭐⭐ |
| `@leafer-in/find` | 元素查找 | `npm i @leafer-in/find` | ⭐⭐ |
| `@leafer-in/flow` | 自动布局 | `npm i @leafer-in/flow` | ⭐⭐ |
| `@leafer-in/html` | HTML 嵌入 | `npm i @leafer-in/html` | ⭐⭐ |
| `@leafer-in/motion-path` | 运动路径 | `npm i @leafer-in/motion-path` | ⭐⭐ |
| `@leafer-in/resize` | 调整大小 | `npm i @leafer-in/resize` | ⭐⭐ |
| `@leafer-in/scroll` | 滚动功能 | `npm i @leafer-in/scroll` | ⭐⭐⭐ |
| `@leafer-in/state` | 交互状态 | `npm i @leafer-in/state` | ⭐⭐⭐ |
| `@leafer-in/viewport` | 视口控制 | `npm i @leafer-in/viewport` | ⭐⭐⭐ |
| `@leafer-in/robot` | 游戏元素 | `npm i @leafer-in/robot` | ⭐⭐ |

## 16. 学习路径总结

### 入门阶段
1. ✅ Leafer 引擎创建
2. ✅ 基础图形元素
3. ✅ 样式系统
4. ✅ 事件系统

### 进阶阶段
5. ✅ 动画系统
6. ✅ 坐标系统
7. ✅ 容器嵌套
8. ✅ 导出功能

### 高级阶段
9. ✅ 插件系统
10. ✅ 图形编辑器
11. ✅ 性能优化
12. ✅ 服务端渲染

### 专家阶段
13. 自定义插件开发
14. 源码贡献
15. 社区生态建设

## 资源链接

- 官网: https://www.leaferjs.com
- GitHub: https://github.com/leaferjs/leafer-ui
- Playground: https://www.leaferjs.com/ui/playground
- 文档: https://www.leaferjs.com/ui/guide/
- npm: https://www.npmjs.com/package/leafer-ui
