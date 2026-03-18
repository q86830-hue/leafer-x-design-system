# 📖 Leafer X Design System - 使用指南

## 🚀 快速开始

### 1. 安装

#### 方式一：从 NPM 安装（推荐）

```bash
# 全局安装（推荐）
npm install -g leafer-x-design-system

# 或本地安装到项目
npm install leafer-x-design-system
```

#### 方式二：从 GitHub 安装（最新开发版）

```bash
git clone https://github.com/q86830-hue/leafer-x-design-system.git
cd leafer-x-design-system
npm install
npm link  # 创建全局链接
```

### 2. 验证安装

```bash
# 查看帮助
leafer-design help

# 输出版本信息
leafer-design --version
```

---

## 🛠️ 使用方式

### 方式一：CLI 命令行工具

#### 生成设计系统

```bash
# 基本用法
leafer-design generate "My App" "#667eea" "#764ba2"

# 指定输出目录和主题模式
leafer-design generate "My App" "#667eea" "#764ba2" --output ./my-design --mode dark
```

#### 渲染模板

```bash
# 渲染单个模板
leafer-design render ./templates/login.json

# 指定输出格式
leafer-design render ./templates/login.json --format png --output ./output
```

#### 启动 MCP 服务

```bash
# 默认端口 3001
leafer-design serve

# 指定端口
leafer-design serve 3002
```

服务启动后：
- HTTP 健康检查：`http://localhost:3001/health`
- 工具列表：`http://localhost:3001/tools`

---

### 方式二：在 Node.js 项目中使用

#### 安装依赖

```bash
npm install leafer-x-design-system
```

#### 基础用法

```javascript
const {
  generateDesignSystem,
  renderTemplate,
  createGenerator
} = require('leafer-x-design-system');

// 生成设计系统
const designSystem = generateDesignSystem({
  name: 'My App',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  mode: 'light'
}, './output');

// 渲染模板
const template = require('./templates/login.json');
const result = await renderTemplate(template, {
  outputDir: './output',
  format: 'png'
});

console.log('图片已生成:', result.url);
```

#### 高级自定义

```javascript
const {
  DesignSystemProGenerator,
  createRenderer
} = require('leafer-x-design-system');

// 创建生成器
const generator = new DesignSystemProGenerator({
  name: 'Custom Design System',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  mode: 'dark'
});

// 生成自定义表格
const componentGen = generator.componentGen;
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

---

### 方式三：在 Trae IDE 中使用 MCP 服务

#### 配置 MCP

在项目根目录创建 `.trae/mcp.json`：

```json
{
  "mcpServers": {
    "leafer-design-system": {
      "command": "node",
      "args": [
        "path/to/node_modules/leafer-x-design-system/mcp-server-v3.js"
      ],
      "env": {
        "NODE_ENV": "production"
      },
      "description": "Leafer Design System - 高保真UI设计系统生成和渲染服务"
    }
  }
}
```

如果是全局安装：

```json
{
  "mcpServers": {
    "leafer-design-system": {
      "command": "leafer-design",
      "args": ["serve"],
      "description": "Leafer Design System MCP 服务"
    }
  }
}
```

#### 使用 MCP 工具

配置完成后，在 Trae 的 AI 对话中可以直接调用：

```
用户：帮我设计一个移动端登录页面
AI：我来帮您设计移动端登录页面。
    [调用 lingjing_architect 工具生成UI规范]
    [调用 lingjing_craftsman 工具渲染预览]
    已为您生成登录页面设计，您可以查看预览...
```

---

### 方式四：跨项目调用服务

#### 场景：在其他项目中调用已启动的服务

**步骤 1：在一个终端启动服务**

```bash
# 在项目A中启动服务
leafer-design serve 3001
```

**步骤 2：在另一个项目中调用**

```javascript
// 项目B中的代码
const axios = require('axios');

async function callLeaferService() {
  // 检查服务健康状态
  const health = await axios.get('http://localhost:3001/health');
  console.log('服务状态:', health.data);

  // 获取可用工具列表
  const tools = await axios.get('http://localhost:3001/tools');
  console.log('可用工具:', tools.data);
}

callLeaferService();
```

#### 使用 MCP 客户端直接连接

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function useMCPClient() {
  const transport = new StdioClientTransport({
    command: 'leafer-design',
    args: ['serve']
  });

  const client = new Client(
    { name: 'my-app', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  // 列出可用工具
  const tools = await client.listTools();
  console.log('可用工具:', tools);

  // 调用工具
  const result = await client.callTool({
    name: 'lingjing_architect',
    arguments: {
      prd: '设计一个移动端登录页面',
      platform: 'iOS/Android'
    }
  });

  console.log('结果:', result);
}
```

---

## 🔌 MCP 工具列表

| 工具名 | 描述 | 适用平台 |
|--------|------|----------|
| `lingjing_architect` | PRD → UI规格书JSON | iOS, Android, Web, Desktop, Responsive |
| `lingjing_craftsman` | JSON → HTML/PNG渲染 | iOS, Android, Web, Desktop, Responsive |
| `lingjing_pipeline` | 完整流程: PRD→预览 | 全平台 |
| `pixelhand_icon_designer` | 图标集设计 | 全平台 |
| `lingjing_team_fullapp` | 三代理完整交付 | Mobile App, Web App, Desktop |
| `creator_full_lifecycle` | 从想法到产品孵化 | 全平台 |
| `web_design_system` | Web设计系统生成 | Web |
| `responsive_preview` | 响应式预览生成 | Responsive |
| `get_platform_guidelines` | 平台设计规范 | 全平台 |

---

## 📁 项目结构说明

安装后的包结构：

```
node_modules/leafer-x-design-system/
├── index.js              # 主入口
├── cli.js                # CLI工具
├── mcp-server-v3.js      # MCP服务器v3.1
├── mcp-http-server.js    # HTTP服务包装器
├── ai-ui-generator.js    # AI UI生成器
├── ai-model-config.js    # AI模型配置
├── leafer-renderer-v2.js # Leafer渲染器
├── render-design-system-v3.js # 设计系统渲染
├── leafer-design-system-pro.js # 高级设计系统
├── leafer-ai-layout-plugin-v2.js # AI布局插件
├── font-config.js        # 字体配置
├── browser-bridge.js     # 浏览器桥接
├── README.md             # 说明文档
├── WORKFLOW_DIAGRAM.md   # 工作流程图
├── MCP_WORKFLOW.md       # MCP工作流程
├── assets/               # 资源文件
├── examples/             # 示例代码
└── templates/            # 模板文件
```

---

## ⚙️ 环境变量配置

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

# MCP服务端口
MCP_PORT=3001
```

---

## 🐛 故障排除

### 问题 1：命令未找到

```bash
# 检查是否全局安装
npm list -g leafer-x-design-system

# 如果没有，重新全局安装
npm install -g leafer-x-design-system

# 或检查 npm 全局安装路径是否在 PATH 中
npm config get prefix
```

### 问题 2：端口被占用

```bash
# 使用其他端口
leafer-design serve 3002
```

### 问题 3：字体渲染问题

```bash
# Windows/macOS 通常无需额外配置
# Linux 需要安装中文字体
sudo apt-get install fonts-wqy-zenhei fonts-wqy-microhei
```

### 问题 4：MCP 连接失败

```bash
# 检查服务是否运行
curl http://localhost:3001/health

# 重启服务
leafer-design serve
```

---

## 💡 最佳实践

1. **全局安装用于快速原型设计**
   ```bash
   npm install -g leafer-x-design-system
   leafer-design serve
   ```

2. **本地安装用于项目集成**
   ```bash
   npm install leafer-x-design-system
   ```

3. **在 Trae 中使用 MCP 获得最佳体验**
   - 配置 `.trae/mcp.json`
   - 直接在 AI 对话中调用设计工具

4. **跨项目共享服务**
   - 在一个终端启动服务
   - 多个项目通过 HTTP API 调用

---

## 📚 相关文档

- [README.md](./README.md) - 项目说明
- [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md) - 工作流程图
- [MCP_WORKFLOW.md](./MCP_WORKFLOW.md) - MCP工作流程
- [GitHub 仓库](https://github.com/q86830-hue/leafer-x-design-system)
- [NPM 包页](https://www.npmjs.com/package/leafer-x-design-system)
