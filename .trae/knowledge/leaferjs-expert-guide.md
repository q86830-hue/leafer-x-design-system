# LeaferJS 专家指南 - 源码架构与高级开发

## 1. LeaferJS 架构深度解析

### 1.1 核心架构设计

LeaferJS 采用分层架构设计：

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│    (App, Leafer, Frame, Group...)       │
├─────────────────────────────────────────┤
│           Element Layer                 │
│  (Rect, Ellipse, Text, Image, Path...)  │
├─────────────────────────────────────────┤
│           Render Layer                  │
│     (Canvas, Skia, WebGL Renderer)      │
├─────────────────────────────────────────┤
│           Event System                  │
│   (Pointer, Drag, Drop, Gesture...)     │
├─────────────────────────────────────────┤
│           Math & Utils                  │
│  (Matrix, Bounds, Point, Color...)      │
└─────────────────────────────────────────┘
```

### 1.2 核心类继承关系

```
Leaf (基类)
├── Leafer (引擎根节点)
├── Group (容器基类)
│   ├── Group
│   ├── Box
│   └── Frame
└── UI (图形元素基类)
    ├── Rect
    ├── Ellipse
    ├── Line
    ├── Polygon
    ├── Star
    ├── Path
    ├── Text
    ├── Image
    └── Canvas
```

### 1.3 渲染管线

```
1. 数据变更 → 2. 布局计算 → 3. 渲染准备 → 4. 绘制执行
     ↓              ↓              ↓              ↓
  set()         update()      render()      canvas.draw()
```

**渲染流程详解：**

```typescript
// 1. 属性变更触发更新
rect.fill = '#ff0000'  // 触发 setter

// 2. 标记需要更新
this.__layout.renderChanged = true

// 3. 下一帧执行渲染
requestAnimationFrame(() => {
    // 4. 计算布局
    this.updateLayout()
    
    // 5. 执行绘制
    this.render(canvas)
})
```

## 2. 自定义插件开发

### 2.1 插件架构

```typescript
// 插件接口定义
interface ILeaferPlugin {
    name: string
    version: string
    install: (leafer: ILeafer) => void
    uninstall?: (leafer: ILeafer) => void
}

// 基础插件模板
export const MyPlugin: ILeaferPlugin = {
    name: 'my-plugin',
    version: '1.0.0',
    
    install(leafer) {
        // 1. 扩展元素原型
        this.extendElement()
        
        // 2. 注册新元素类型
        this.registerElements()
        
        // 3. 添加全局方法
        this.addGlobalMethods()
        
        // 4. 监听事件
        this.setupEvents()
    },
    
    extendElement() {
        // 扩展 Leaf 原型
        Leaf.prototype.myMethod = function() {
            // 实现逻辑
        }
    },
    
    registerElements() {
        // 注册新元素
        registerUI(MyCustomElement)
    }
}
```

### 2.2 创建自定义元素

```typescript
import { UI, registerUI } from 'leafer-ui'

// 定义自定义元素
class StarBurst extends UI {
    // 定义属性
    rays: number = 8
    innerRadius: number = 0.5
    
    // 定义可绑定属性
    get __tag() { return 'StarBurst' }
    
    // 创建绘制路径
    __drawPath(canvas: ILeaferCanvas) {
        const { width, height, rays, innerRadius } = this
        const cx = width / 2
        const cy = height / 2
        const outerR = Math.min(width, height) / 2
        const innerR = outerR * innerRadius
        
        canvas.beginPath()
        for (let i = 0; i < rays * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR
            const angle = (Math.PI * i) / rays
            const x = cx + Math.cos(angle) * r
            const y = cy + Math.sin(angle) * r
            
            if (i === 0) canvas.moveTo(x, y)
            else canvas.lineTo(x, y)
        }
        canvas.closePath()
    }
    
    // 自定义渲染
    __render(canvas: ILeaferCanvas) {
        this.__drawPath(canvas)
        
        if (this.fill) {
            canvas.fillStyle = this.fill
            canvas.fill()
        }
        
        if (this.stroke) {
            canvas.strokeStyle = this.stroke
            canvas.lineWidth = this.strokeWidth
            canvas.stroke()
        }
    }
}

// 注册元素
registerUI(StarBurst)
```

### 2.3 高级插件：AI 布局助手

```typescript
// ai-layout-plugin.ts
import { ILeaferPlugin, Group, Box } from 'leafer-ui'

interface AILayoutConfig {
    type: 'grid' | 'flex' | 'absolute'
    columns?: number
    gap?: number
    padding?: number
}

export const AILayoutPlugin: ILeaferPlugin = {
    name: 'ai-layout',
    version: '1.0.0',
    
    install(leafer) {
        // 扩展 Group 原型
        Group.prototype.aiLayout = async function(config: AILayoutConfig) {
            const children = this.children
            
            switch (config.type) {
                case 'grid':
                    await this.applyGridLayout(children, config)
                    break
                case 'flex':
                    await this.applyFlexLayout(children, config)
                    break
                case 'absolute':
                    await this.applyAbsoluteLayout(children, config)
                    break
            }
        }
        
        Group.prototype.applyGridLayout = async function(children, config) {
            const { columns = 3, gap = 10, padding = 20 } = config
            const cellWidth = (this.width - padding * 2 - gap * (columns - 1)) / columns
            
            children.forEach((child, index) => {
                const row = Math.floor(index / columns)
                const col = index % columns
                
                child.x = padding + col * (cellWidth + gap)
                child.y = padding + row * (child.height + gap)
                child.width = cellWidth
            })
        }
    }
}

// 使用
import '@leafer-in/ai-layout'

const group = new Group({
    width: 600,
    height: 400
})

// AI 自动布局
group.aiLayout({
    type: 'grid',
    columns: 3,
    gap: 15,
    padding: 20
})
```

## 3. 性能优化专家技巧

### 3.1 渲染性能优化

```typescript
// 1. 使用对象池
class ObjectPool<T> {
    private pool: T[] = []
    private createFn: () => T
    
    constructor(createFn: () => T) {
        this.createFn = createFn
    }
    
    get(): T {
        return this.pool.pop() || this.createFn()
    }
    
    release(obj: T) {
        this.pool.push(obj)
    }
}

const rectPool = new ObjectPool(() => new Rect())

// 2. 批量渲染优化
class BatchRenderer {
    private batch: UI[] = []
    private frameId: number | null = null
    
    add(element: UI) {
        this.batch.push(element)
        this.scheduleRender()
    }
    
    private scheduleRender() {
        if (this.frameId) return
        
        this.frameId = requestAnimationFrame(() => {
            this.render()
            this.frameId = null
        })
    }
    
    private render() {
        // 批量渲染逻辑
        const elements = this.batch.splice(0)
        // ...
    }
}

// 3. 视口裁剪优化
class ViewportCulling {
    private viewport: IBounds
    
    updateViewport(bounds: IBounds) {
        this.viewport = bounds
        this.cullElements()
    }
    
    private cullElements() {
        leafer.children.forEach(child => {
            const visible = this.viewport.hit(child.worldRenderBounds)
            child.visible = visible
        })
    }
}
```

### 3.2 内存管理

```typescript
// 1. 智能缓存系统
class SmartCache<K, V> {
    private cache = new Map<K, V>()
    private lru = new Map<K, number>()
    private maxSize: number
    
    constructor(maxSize = 100) {
        this.maxSize = maxSize
    }
    
    get(key: K): V | undefined {
        const value = this.cache.get(key)
        if (value) {
            this.lru.set(key, Date.now())
        }
        return value
    }
    
    set(key: K, value: V) {
        if (this.cache.size >= this.maxSize) {
            this.evictLRU()
        }
        this.cache.set(key, value)
        this.lru.set(key, Date.now())
    }
    
    private evictLRU() {
        let oldestKey: K | null = null
        let oldestTime = Infinity
        
        this.lru.forEach((time, key) => {
            if (time < oldestTime) {
                oldestTime = time
                oldestKey = key
            }
        })
        
        if (oldestKey) {
            this.cache.delete(oldestKey)
            this.lru.delete(oldestKey)
        }
    }
}

// 2. 自动垃圾回收
class AutoGC {
    private elements = new WeakSet<UI>()
    
    track(element: UI) {
        this.elements.add(element)
    }
    
    cleanup() {
        // 自动清理不再使用的元素
    }
}
```

## 4. 高级渲染技术

### 4.1 自定义渲染器

```typescript
// 自定义 WebGL 渲染器
class WebGLRenderer {
    private gl: WebGLRenderingContext
    private programs: Map<string, WebGLProgram>
    
    constructor(canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl2')!
        this.programs = new Map()
        this.initShaders()
    }
    
    private initShaders() {
        // 初始化着色器程序
        const vertexShader = `
            attribute vec2 position;
            uniform mat3 transform;
            
            void main() {
                vec3 pos = transform * vec3(position, 1.0);
                gl_Position = vec4(pos.xy, 0.0, 1.0);
            }
        `
        
        const fragmentShader = `
            precision mediump float;
            uniform vec4 color;
            
            void main() {
                gl_FragColor = color;
            }
        `
        
        // 编译和链接着色器
        // ...
    }
    
    renderRect(rect: Rect) {
        const gl = this.gl
        
        // 设置顶点数据
        const vertices = new Float32Array([
            0, 0,
            rect.width, 0,
            rect.width, rect.height,
            0, rect.height
        ])
        
        // 绑定缓冲区并绘制
        // ...
    }
}
```

### 4.2 着色器效果

```typescript
// 自定义着色器效果
const gradientShader = {
    vertex: `
        attribute vec2 position;
        varying vec2 vUv;
        
        void main() {
            vUv = position;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `,
    
    fragment: `
        precision mediump float;
        varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float time;
        
        void main() {
            float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
            float gradient = vUv.y + sin(time + vUv.x * 10.0) * 0.1;
            vec3 color = mix(color1, color2, gradient + noise * 0.1);
            gl_FragColor = vec4(color, 1.0);
        }
    `
}
```

## 5. 测试与调试

### 5.1 单元测试

```typescript
// 元素测试
import { describe, it, expect } from 'vitest'
import { Rect, Leafer } from 'leafer-ui'

describe('Rect', () => {
    it('should create rect with correct properties', () => {
        const rect = new Rect({
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            fill: '#ff0000'
        })
        
        expect(rect.x).toBe(100)
        expect(rect.y).toBe(100)
        expect(rect.width).toBe(200)
        expect(rect.height).toBe(150)
        expect(rect.fill).toBe('#ff0000')
    })
    
    it('should calculate bounds correctly', () => {
        const rect = new Rect({
            x: 100,
            y: 100,
            width: 200,
            height: 150
        })
        
        const bounds = rect.boxBounds
        expect(bounds.width).toBe(200)
        expect(bounds.height).toBe(150)
    })
})

// 性能测试
describe('Performance', () => {
    it('should render 10000 elements in under 100ms', () => {
        const leafer = new Leafer({ width: 800, height: 600 })
        const start = performance.now()
        
        for (let i = 0; i < 10000; i++) {
            leafer.add(new Rect({
                x: Math.random() * 800,
                y: Math.random() * 600,
                width: 10,
                height: 10,
                fill: '#ff0000'
            }))
        }
        
        const end = performance.now()
        expect(end - start).toBeLessThan(100)
    })
})
```

### 5.2 调试工具

```typescript
// 调试装饰器
function Debug(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(...args: any[]) {
        console.log(`[Debug] ${propertyKey} called with:`, args)
        const result = originalMethod.apply(this, args)
        console.log(`[Debug] ${propertyKey} returned:`, result)
        return result
    }
}

// 性能监控
class PerformanceMonitor {
    private metrics = new Map<string, number[]>()
    
    measure<T>(name: string, fn: () => T): T {
        const start = performance.now()
        const result = fn()
        const end = performance.now()
        
        const times = this.metrics.get(name) || []
        times.push(end - start)
        this.metrics.set(name, times)
        
        return result
    }
    
    report() {
        this.metrics.forEach((times, name) => {
            const avg = times.reduce((a, b) => a + b, 0) / times.length
            const max = Math.max(...times)
            const min = Math.min(...times)
            
            console.log(`[Performance] ${name}:`)
            console.log(`  Average: ${avg.toFixed(2)}ms`)
            console.log(`  Min: ${min.toFixed(2)}ms`)
            console.log(`  Max: ${max.toFixed(2)}ms`)
        })
    }
}
```

## 6. 贡献指南

### 6.1 如何贡献

1. **Fork 仓库**
```bash
git clone https://github.com/your-name/leafer-ui.git
cd leafer-ui
```

2. **创建分支**
```bash
git checkout -b feature/my-feature
```

3. **提交代码**
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

4. **创建 PR**
- 描述清楚改动内容
- 提供测试用例
- 更新文档

### 6.2 代码规范

```typescript
// ✅ 好的实践
class GoodExample {
    // 使用明确的类型
    private _width: number = 0
    
    // 使用 getter/setter
    get width(): number {
        return this._width
    }
    
    set width(value: number) {
        if (value !== this._width) {
            this._width = value
            this.updateLayout()
        }
    }
    
    // 清晰的命名
    calculateBoundingBox(): IBounds {
        // ...
    }
}

// ❌ 避免的做法
class BadExample {
    // 不明确类型
    w = 0
    
    // 直接修改
    setW(v) {
        this.w = v
    }
    
    // 模糊命名
    calc() {
        // ...
    }
}
```

## 7. 专家级项目实战

### 7.1 构建设计系统

```typescript
// design-system.ts
export const DesignSystem = {
    colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565',
        gray: {
            100: '#f7fafc',
            200: '#edf2f7',
            300: '#e2e8f0',
            400: '#cbd5e0',
            500: '#a0aec0',
            600: '#718096',
            700: '#4a5568',
            800: '#2d3748',
            900: '#1a202c'
        }
    },
    
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64
    },
    
    borderRadius: {
        none: 0,
        sm: 2,
        md: 4,
        lg: 8,
        xl: 12,
        '2xl': 16,
        full: 9999
    },
    
    shadows: {
        sm: { x: 0, y: 1, blur: 2, color: '#0000000d' },
        md: { x: 0, y: 4, blur: 6, color: '#0000001a' },
        lg: { x: 0, y: 10, blur: 15, color: '#0000001a' },
        xl: { x: 0, y: 20, blur: 25, color: '#00000026' }
    },
    
    typography: {
        h1: { fontSize: 48, fontWeight: 'bold', lineHeight: 1.2 },
        h2: { fontSize: 36, fontWeight: 'bold', lineHeight: 1.3 },
        h3: { fontSize: 24, fontWeight: 'semibold', lineHeight: 1.4 },
        body: { fontSize: 16, fontWeight: 'normal', lineHeight: 1.5 },
        small: { fontSize: 14, fontWeight: 'normal', lineHeight: 1.5 }
    }
}

// 使用
const button = new Box({
    fill: DesignSystem.colors.primary,
    cornerRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    shadow: DesignSystem.shadows.md
})
```

### 7.2 完整应用示例

```typescript
// 构建一个完整的图表应用
import { App, Leafer, Group, Rect, Text, Line } from 'leafer-ui'
import '@leafer-in/animate'
import '@leafer-in/editor'

class ChartApp {
    private app: App
    private data: number[] = []
    
    constructor(container: HTMLElement) {
        this.app = new App({
            view: container,
            fill: '#f8fafc',
            editor: {}
        })
        
        this.init()
    }
    
    private init() {
        this.renderAxes()
        this.renderData()
        this.setupInteractions()
    }
    
    private renderAxes() {
        const axisGroup = new Group()
        
        // X轴
        axisGroup.add(new Line({
            x: 50, y: 350,
            width: 700,
            stroke: '#cbd5e0',
            strokeWidth: 2
        }))
        
        // Y轴
        axisGroup.add(new Line({
            x: 50, y: 50,
            toPoint: { x: 0, y: 300 },
            stroke: '#cbd5e0',
            strokeWidth: 2
        }))
        
        this.app.tree.add(axisGroup)
    }
    
    private renderData() {
        const barWidth = 60
        const gap = 20
        const maxValue = Math.max(...this.data)
        
        this.data.forEach((value, index) => {
            const height = (value / maxValue) * 250
            const bar = new Rect({
                x: 100 + index * (barWidth + gap),
                y: 350 - height,
                width: barWidth,
                height: 0,  // 从0开始动画
                fill: '#667eea',
                cornerRadius: [4, 4, 0, 0],
                editable: true,
                animation: {
                    style: { height: height },
                    duration: 0.8,
                    easing: 'bounce-out',
                    delay: index * 0.1
                }
            })
            
            this.app.tree.add(bar)
        })
    }
    
    private setupInteractions() {
        // 添加交互逻辑
    }
    
    updateData(newData: number[]) {
        this.data = newData
        // 更新图表
    }
}

// 启动应用
const app = new ChartApp(document.getElementById('chart-container')!)
app.updateData([65, 59, 80, 81, 56, 55, 40])
```

## 8. 总结

成为 LeaferJS 专家需要：

1. **深入理解源码** - 掌握架构设计和实现原理
2. **熟练插件开发** - 能够扩展和定制功能
3. **性能优化能力** - 处理大规模数据和复杂场景
4. **测试与调试** - 保证代码质量和稳定性
5. **社区贡献** - 参与开源生态建设

**继续学习资源：**
- 阅读源码：`node_modules/leafer-ui/src`
- 研究插件：`node_modules/@leafer-in/*`
- 参与讨论：GitHub Issues & Discussions
- 贡献代码：提交 PR 和 Bug 修复

**下一步行动：**
1. 选择一个感兴趣的方向深入研究
2. 创建自己的插件或工具
3. 为社区贡献代码
4. 分享学习经验和最佳实践

你已经站在 LeaferJS 专家的起跑线上了！🏃‍♂️
