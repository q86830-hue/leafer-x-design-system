#!/usr/bin/env node

/**
 * Leafer Design System - CLI 工具
 * 
 * 使用方法:
 *   leafer-design generate    - 生成设计系统
 *   leafer-design render      - 渲染模板
 *   leafer-design serve       - 启动 MCP 服务
 *   leafer-design help        - 显示帮助
 */

const fs = require('fs');
const path = require('path');
const { generateDesignSystem, renderTemplate } = require('./index');

const command = process.argv[2];
const args = process.argv.slice(3);

function showHelp() {
  console.log(`
🎨 Leafer Design System CLI

使用方法:
  leafer-design <command> [options]

命令:
  generate [name] [primaryColor] [secondaryColor]
    生成设计系统
    示例: leafer-design generate "My App" "#667eea" "#764ba2"

  render <template-file>
    渲染模板为图片
    示例: leafer-design render ./templates/login.json

  serve [port]
    启动 MCP 服务
    示例: leafer-design serve 3001

  help
    显示此帮助信息

选项:
  --output, -o    指定输出目录
  --mode, -m      主题模式 (light/dark)
  --format, -f    输出格式 (png/jpg)
`);
}

async function generateCommand() {
  const name = args[0] || 'My Design System';
  const primaryColor = args[1] || '#667eea';
  const secondaryColor = args[2] || '#764ba2';
  const outputDir = args.find((arg, i) => arg === '--output' || arg === '-o') 
    ? args[args.indexOf(args.find(arg => arg === '--output' || arg === '-o')) + 1]
    : './my-design-system';
  const mode = args.find((arg, i) => arg === '--mode' || arg === '-m')
    ? args[args.indexOf(args.find(arg => arg === '--mode' || arg === '-m')) + 1]
    : 'light';

  console.log(`\n🎨 生成设计系统: ${name}`);
  console.log(`   主色调: ${primaryColor}`);
  console.log(`   次色调: ${secondaryColor}`);
  console.log(`   主题模式: ${mode}\n`);

  try {
    const designSystem = generateDesignSystem({
      name,
      primaryColor,
      secondaryColor,
      mode
    }, outputDir);

    console.log(`\n✅ 设计系统生成成功!`);
    console.log(`📁 输出目录: ${path.resolve(outputDir)}`);
    console.log(`📦 包含 ${Object.keys(designSystem.templates).length} 个设备类型的模板`);
  } catch (error) {
    console.error(`\n❌ 生成失败: ${error.message}`);
    process.exit(1);
  }
}

async function renderCommand() {
  const templateFile = args[0];
  
  if (!templateFile) {
    console.error('❌ 请指定模板文件路径');
    console.log('   示例: leafer-design render ./templates/login.json');
    process.exit(1);
  }

  if (!fs.existsSync(templateFile)) {
    console.error(`❌ 模板文件不存在: ${templateFile}`);
    process.exit(1);
  }

  const outputDir = args.find((arg, i) => arg === '--output' || arg === '-o')
    ? args[args.indexOf(args.find(arg => arg === '--output' || arg === '-o')) + 1]
    : './output';
  
  const format = args.find((arg, i) => arg === '--format' || arg === '-f')
    ? args[args.indexOf(args.find(arg => arg === '--format' || arg === '-f')) + 1]
    : 'png';

  console.log(`\n🖼️  渲染模板: ${templateFile}`);
  console.log(`   输出格式: ${format}\n`);

  try {
    const template = JSON.parse(fs.readFileSync(templateFile, 'utf-8'));
    const result = await renderTemplate(template, {
      outputDir,
      format
    });

    console.log(`\n✅ 渲染成功!`);
    console.log(`📁 图片路径: ${result.url}`);
    console.log(`⏱️  渲染时间: ${result.renderTime}ms`);
  } catch (error) {
    console.error(`\n❌ 渲染失败: ${error.message}`);
    process.exit(1);
  }
}

function serveCommand() {
  const port = args[0] || 3001;
  console.log(`\n🚀 启动 MCP 服务...`);
  console.log(`   端口: ${port}\n`);
  
  // 设置端口环境变量并启动HTTP+MCP服务
  process.env.MCP_PORT = port;
  require('./mcp-http-server');
}

// 主程序
async function main() {
  switch (command) {
    case 'generate':
    case 'g':
      await generateCommand();
      break;
    case 'render':
    case 'r':
      await renderCommand();
      break;
    case 'serve':
    case 's':
      serveCommand();
      break;
    case 'help':
    case 'h':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log('🎨 Leafer Design System v2.0.0\n');
      showHelp();
  }
}

main().catch(error => {
  console.error('❌ 错误:', error.message);
  process.exit(1);
});
