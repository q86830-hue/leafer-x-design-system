# 🎨 Leafer Design System

基于 LeaferJS 的高保真 UI 设计系统生成器，支持响应式设计、暗黑模式和丰富的组件库。

## ✨ 特性

- 🎯 **高保真渲染**: 基于 LeaferJS + Skia Canvas，输出像素级精准的 UI 原型
- 📱 **响应式设计**: 支持桌面端、移动端、平板多种设备尺寸
- 🌓 **双主题模式**: 内置亮色/暗色主题，一键切换
- 🧩 **丰富组件**: 按钮、输入框、表格、模态框、下拉菜单、标签页、开关等
- 🔤 **中文支持**: 完美支持中文字体渲染
- ⚡ **高性能**: 缓存机制，批量渲染更高效
- 🛠️ **CLI 工具**: 命令行快速生成和渲染

## 📦 安装

### 从 npm 安装（推荐）

```bash
# 全局安装
npm install -g leafer-x-design-system

# 或本地安装
npm install leafer-x-design-system
```

### 从 GitHub 安装（最新开发版）

```bash
# 克隆仓库
git clone https://github.com/q86830-hue/leafer-x-design-system.git
cd leafer-x-design-system

# 安装依赖
npm install

# 启动 MCP 服务
npm start
```

### 系统要求

- **Node.js**: >= 16.0.0
- **操作系统**: Windows 10/11、macOS 10.15+、Linux

### 字体支持

- **Windows**: 系统自带中文字体，无需额外配置
- **macOS**: 系统自带中文字体（PingFang SC、STHeiti），无需额外配置
- **Linux**: 需要安装中文字体（详见文档底部）

## 🚀 快速开始

### 方式一：使用 CLI

```bash
# 生成设计系统
leafer-design generate "My App" "#667eea" "#764ba2"

# 渲染模板
leafer-design render ./templates/login.json

# 启动 MCP 服务
leafer-design serve 3001

# 查看帮助
leafer-design help
```

### 方式二：使用 API

```javascript
const {
  generateDesignSystem,
  renderTemplate,
  createGenerator
} = require('leafer-design-system');

// 快速生成设计系统
const designSystem = generateDesignSystem({
  name: 'My App',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  mode: 'light'
}, './output');

// 渲染单个模板
const template = require('./templates/login.json');
const result = await renderTemplate(template, {
  outputDir: './output',
  format: 'png'
});

console.log('图片已生成:', result.url);
```

### 方式三：高级自定义

```javascript
const {
  DesignSystemProGenerator,
  AdvancedComponentGenerator,
  createRenderer
} = require('leafer-design-system');

// 创建生成器
const generator = new DesignSystemProGenerator({
  name: 'Custom Design System',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  mode: 'dark'
});

// 获取组件生成器
const componentGen = generator.componentGen;

// 生成自定义表格
const table = componentGen.generateTable(
  ['姓名', '邮箱', '角色'],
  [
    ['张三', 'zhangsan@example.com', '管理员'],
    ['李四', 'lisi@example.com', '编辑']
  ],
  { width: 600 }
);

// 渲染
const renderer = createRenderer({ outputDir: './output' });
const result = await renderer.render({
  width: 800,
  height: 600,
  elements: [table],
  options: { format: 'png' }
});
```

## 📋 组件列表

### 基础组件

- ✅ Button (7种变体: Primary, Secondary, Success, Warning, Error, Ghost, Outline)
- ✅ Input (多种状态: Default, Focused, Error, Disabled)
- ✅ Card
- ✅ Badge
- ✅ Avatar
- ✅ Progress

### 高级组件

- ✅ Table (表格)
- ✅ Modal (模态框)
- ✅ Dropdown (下拉菜单)
- ✅ Tabs (标签页)
- ✅ Switch (开关)
- ✅ Checkbox (复选框)
- ✅ Radio (单选按钮)

### 响应式模板

- ✅ Mobile Login (移动端登录)
- ✅ Mobile Home (移动端首页)
- ✅ Tablet Dashboard (平板仪表盘)
- ✅ Desktop Dashboard (桌面仪表盘)
- ✅ Desktop Showcase (组件展示)

## 🎨 主题配置

```javascript
{
  // 颜色
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565',
    info: '#4299e1'
  },
  
  // 字体
  typography: {
    fontFamily: 'Microsoft YaHei',
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20 }
  },
  
  // 间距
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
  
  // 圆角
  borderRadius: { none: 0, sm: 2, md: 4, lg: 8, xl: 12 },
  
  // 阴影
  shadows: {
    sm: { x: 0, y: 1, blur: 2, color: '#0000000d' },
    md: { x: 0, y: 4, blur: 6, color: '#0000001a' },
    lg: { x: 0, y: 10, blur: 15, color: '#00000026' }
  }
}
```

## 🤖 AI 模型支持

本系统使用 **大语言模型（LLM）** 生成 UI 设计描述（JSON格式），然后通过 LeaferJS 渲染成图像。

### 国内大语言模型（推荐用于 UI 描述生成）
- **百度文心一言**: ERNIE-4.0, ERNIE-3.5
- **阿里通义千问**: Qwen-Max, Qwen-Plus, Qwen-Turbo ⭐推荐
- **字节豆包**: Doubao-Pro, Doubao-Lite ⭐推荐（中文优化）
- **智谱 AI**: GLM-4, GLM-3-Turbo
- **讯飞星火**: Spark-3.5, Spark-3.0
- **DeepSeek**: DeepSeek-Chat, DeepSeek-Coder ⭐性价比高
- **Kimi**: Kimi-Latest, Kimi-128K（长文本）
- **MiniMax**: abab6.5, abab6
- **零一万物**: Yi-Large, Yi-Medium
- **百川智能**: Baichuan-4, Baichuan-3

### 国外大语言模型
- **OpenAI**: GPT-4o, GPT-4-Turbo, GPT-3.5-Turbo
- **Anthropic Claude**: Claude-3.5-Sonnet, Claude-3-Opus ⭐JSON能力强
- **Google Gemini**: Gemini-1.5-Pro, Gemini-1.5-Flash
- **OpenRouter**: Healer-Alpha ⭐UI设计专用
- **Cohere**: Command-R-Plus, Command-R
- **Mistral**: Mistral-Large, Mixtral-8x22B

### 图像生成模型（如需直接生成图片）
如需直接生成位图图片（而非本系统的矢量渲染），可使用：
- **OpenAI DALL-E 3**: 高质量图像生成
- **阿里通义万相**: 中文理解好
- **字节豆包·生图**: 速度快
- **百度文心一格**: 艺术风格
- **Stability AI**: 开源生态

> 💡 **说明**: 本系统主要使用 LLM 生成结构化 UI 描述，再通过 LeaferJS 渲染成高保真矢量图像。这种方式比直接生成位图更灵活、可编辑、可缩放。

### 使用 AI 生成 UI

```javascript
const { AIUIGenerator } = require('leafer-x-design-system');

// 使用 OpenRouter
const generator = new AIUIGenerator({
  aiProvider: 'openrouter',
  model: 'openrouter/healer-alpha',
  apiKey: 'your-api-key'
});

// 使用 DeepSeek (国内)
const generator = new AIUIGenerator({
  aiProvider: 'deepseek',
  model: 'deepseek-chat',
  apiKey: 'your-api-key'
});

// 使用通义千问 (国内)
const generator = new AIUIGenerator({
  aiProvider: 'qwen',
  model: 'qwen-max',
  apiKey: 'your-api-key'
});

// 使用字节豆包 (国内，中文优化)
const generator = new AIUIGenerator({
  aiProvider: 'doubao',
  model: 'doubao-pro',
  apiKey: 'your-api-key'
});

// 生成 UI 描述
const uiDescription = await generator.generateUIDescription(
  '创建一个现代化的电商商品详情页',
  { style: '现代简洁', primaryColor: '#ff6b6b' }
);
```

### 环境变量配置

创建 `.env` 文件配置 API 密钥：

```bash
# 国内模型
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key
CHATGLM_API_KEY=your_chatglm_api_key
KIMI_API_KEY=your_kimi_api_key

# 国外模型
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# 默认配置
DEFAULT_AI_PROVIDER=openrouter
DEFAULT_MODEL=openrouter/healer-alpha
```

## 🔌 MCP 服务 API

启动 MCP 服务后，可通过 HTTP API 调用：

```bash
curl -X POST http://localhost:3001/api/v1/ui/render \
  -H "Content-Type: application/json" \
  -d '{
    "width": 800,
    "height": 600,
    "elements": [
      {
        "type": "box",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100,
        "fill": "#667eea",
        "cornerRadius": 8
      }
    ]
  }'
```

### MCP 服务配置（Trae 集成）

在 Trae 中使用 MCP 服务，请在 `.trae/mcp.json` 中添加以下配置：

```json
{
  "mcpServers": {
    "leafer-design-system": {
      "command": "node",
      "args": [
        "path/to/node_modules/leafer-x-design-system/mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      },
      "description": "Leafer Design System - 高保真UI设计系统生成和渲染服务"
    }
  }
}
```

或者使用全局安装的 CLI：

```json
{
  "mcpServers": {
    "leafer-design-system": {
      "command": "leafer-design",
      "args": ["mcp"],
      "description": "Leafer Design System MCP 服务"
    }
  }
}
```

### HTTP API 端点（独立服务）

如果使用独立 HTTP 服务（`npm start` 或 `leafer-design serve`）：

| 端点                        | 方法   | 描述    |
| ------------------------- | ---- | ----- |
| `/health`                 | GET  | 健康检查  |
| `/api/v1/ui/render`       | POST | 渲染 UI |
| `/api/v1/ui/batch-render` | POST | 批量渲染  |
| `/api/v1/cache/clear`     | POST | 清空缓存  |
| `/api/v1/stats`           | GET  | 获取统计  |
| `/output/:filename`       | GET  | 获取图片  |

## 📁 项目结构

```
my-design-system/
├── design-system.json      # 设计系统配置
├── components.json         # 组件定义
└── templates/
    ├── desktop-login.json
    ├── desktop-dashboard.json
    ├── desktop-showcase.json
    ├── mobile-login.json
    ├── mobile-home.json
    └── tablet-dashboard.json
```

## 🖼️ 输出示例

生成的 UI 原型图：

- 移动端登录页: 375x812
- 移动端首页: 375x812
- 桌面仪表盘: 1200x800
- 组件展示: 1200x1600

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/yourusername/leafer-design-system.git
cd leafer-design-system

# 安装依赖
npm install

# 生成设计系统
npm run generate

# 渲染模板
npm run render

# 启动服务
npm start
```

## 📄 许可证

MIT License © 2024

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 🔗 相关链接

- [LeaferJS 官网](https://www.leaferjs.com/)
- [LeaferJS GitHub](https://github.com/leaferjs/leafer)
- [Skia Canvas](https://github.com/samizdatco/skia-canvas)

***

## 🤝 支持与联系

如果您觉得本项目对您有帮助，欢迎请作者喝杯咖啡 ☕

<table>
  <tr>
    <td align="center">
      <img src="./assets/wechat-pay.png" width="200" alt="微信支付"/>
      <br />
      <sub>微信支付</sub>
    </td>
    <td align="center">
      <img src="./assets/assetswechat-qr.png" width="200" alt="联系作者"/>
      <br />
      <sub>联系作者</sub>
    </td>
  </tr>
</table>

### 联系方式

- **微信**: 尽为一土
- **邮箱**: <spring60@vip.qq.com>
- **GitHub Issues**: [提交问题](https://github.com/yourusername/leafer-design-system/issues)

### 加入社区

欢迎加入我们的社区，一起交流 LeaferJS 和设计系统的相关技术！

***

**如果这个项目对你有帮助，请给我们一个 ⭐ Star！**
