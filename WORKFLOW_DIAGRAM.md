# 🎨 Leafer X Design System - 工作流程图

## 📊 完整工作流程

```mermaid
flowchart TB
    subgraph Input["📝 输入阶段"]
        A[用户需求] --> B{选择平台}
        B -->|iOS/Android| C1[移动端App]
        B -->|Web| C2[网页设计]
        B -->|Desktop| C3[桌面应用]
        B -->|Responsive| C4[响应式设计]
    end

    subgraph AI_Agents["🤖 AI代理系统"]
        D[灵境UI架构师<br/>lingjing_ui_architect] --> E[生成UI规范JSON]
        E --> F[灵境UI工匠<br/>lingjing_ui_crafter]
        F --> G[渲染HTML预览]
        
        H[像素手图标设计<br/>pixelhand_icon_designer] --> I[生成图标集]
        
        J[灵境团队协作<br/>lingjing_team_cluster] --> K[完整产品交付]
        
        L[造物者全生命周期<br/>creator_full_lifecycle] --> M[从想法到产品]
    end

    subgraph Output["🎨 输出阶段"]
        G --> N[高保真UI预览]
        I --> N
        K --> N
        M --> N
        N --> O[导出PNG/SVG]
        N --> P[获取前端代码]
    end

    C1 --> D
    C2 --> D
    C3 --> D
    C4 --> D
```

## 🔄 快速开始流程

```mermaid
flowchart LR
    A[📝 描述需求] --> B{选择代理}
    B -->|单页面| C[灵境双代理]
    B -->|图标集| D[像素手图标]
    B -->|完整产品| E[灵境团队]
    B -->|从零开始| F[造物者]
    
    C --> G[🎨 获得UI设计]
    D --> G
    E --> G
    F --> G
    
    G --> H[💾 导出使用]
```

## 🛠️ MCP工具速查

```mermaid
flowchart TB
    subgraph Tools["🔧 可用工具"]
        T1[generate_ui_spec<br/>生成UI规范]
        T2[render_mobile_ui<br/>渲染移动端UI]
        T3[web_design_system<br/>网页设计系统]
        T4[responsive_preview<br/>响应式预览]
        T5[get_platform_guidelines<br/>平台规范指南]
        T6[design_icon_set<br/>设计图标集]
        T7[create_product_package<br/>创建产品包]
        T8[incubate_product<br/>产品孵化]
    end

    subgraph Platforms["📱 支持平台"]
        P1[iOS<br/>375×812]
        P2[Android<br/>360×800]
        P3[Web<br/>1440×900]
        P4[Desktop<br/>1920×1080]
        P5[Responsive<br/>多断点]
    end

    Tools --> Platforms
```

## 🎯 使用示例

### 示例1：移动端登录页
```mermaid
sequenceDiagram
    participant U as 用户
    participant A as 灵境架构师
    participant C as 灵境工匠
    
    U->>A: 生成登录页UI规范
    A->>A: 分析需求<br/>设计布局<br/>定义组件
    A->>U: 返回JSON规范
    U->>C: 渲染HTML预览
    C->>C: 生成HTML/CSS<br/>创建375×812预览
    C->>U: 返回预览链接
```

### 示例2：网页仪表盘
```mermaid
sequenceDiagram
    participant U as 用户
    participant W as 网页设计系统
    participant R as 响应式预览
    
    U->>W: 创建SaaS仪表盘
    W->>W: 生成设计系统<br/>色彩/字体/组件
    W->>U: 返回设计规范
    U->>R: 生成响应式预览
    R->>R: 创建多断点预览<br/>手机/平板/桌面
    R->>U: 返回预览链接
```

## 📁 项目结构

```mermaid
flowchart TB
    subgraph Core["🎯 核心文件"]
        C1[index.js<br/>主入口]
        C2[cli.js<br/>命令行工具]
        C3[mcp-server-v3.js<br/>MCP服务器v3.1]
    end

    subgraph Renderers["🎨 渲染器"]
        R1[leafer-renderer-v2.js<br/>矢量渲染]
        R2[render-design-system-v3.js<br/>设计系统渲染]
    end

    subgraph AI["🤖 AI模块"]
        A1[ai-ui-generator.js<br/>UI生成器]
        A2[ai-model-config.js<br/>模型配置]
    end

    subgraph Design["📐 设计系统"]
        D1[leafer-design-system-pro.js<br/>高级设计系统]
        D2[leafer-ai-layout-plugin-v2.js<br/>AI布局插件]
    end

    subgraph Config["⚙️ 配置"]
        F1[mcp-config.json<br/>MCP配置]
        F2[font-config.js<br/>字体配置]
        F3[browser-bridge.js<br/>浏览器桥接]
    end

    Core --> Renderers
    Core --> AI
    Core --> Design
    Core --> Config
```

## 🚀 快速命令

```bash
# 启动MCP服务
npm start

# 生成设计系统
node cli.js generate "My App" "#667eea" "#764ba2"

# 渲染模板
node cli.js render ./templates/login.json
```

---

**支持的AI模型**: OpenRouter, DeepSeek, 通义千问, 字节豆包, Claude, GPT-4o 等16+模型

**输出格式**: PNG, SVG, HTML, JSON
