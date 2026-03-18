#!/usr/bin/env node

/**
 * MCP HTTP Server Wrapper
 * 将MCP v3服务器包装为HTTP服务，支持全局CLI调用
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.MCP_PORT || 3001;

// 启动MCP服务器的HTTP包装
class MCPHTTPServer {
  constructor() {
    this.port = PORT;
  }

  async start() {
    const server = http.createServer((req, res) => {
      // 设置CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // 健康检查
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          version: '3.1.0',
          server: 'leafer-design-system',
          timestamp: new Date().toISOString()
        }));
        return;
      }

      // 工具列表
      if (req.url === '/tools' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          tools: [
            { name: 'lingjing_architect', description: 'PRD→UI规格书JSON', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'Responsive'] },
            { name: 'lingjing_craftsman', description: 'JSON→HTML/PNG渲染', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'Responsive'] },
            { name: 'lingjing_pipeline', description: '完整流程: PRD→预览', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'Responsive'] },
            { name: 'pixelhand_icon_designer', description: '图标集设计', platforms: ['All'] },
            { name: 'lingjing_team_fullapp', description: '三代理完整交付', platforms: ['Mobile App', 'Web App', 'Desktop', 'Responsive Website', 'Full Stack'] },
            { name: 'creator_full_lifecycle', description: '从想法到产品孵化', platforms: ['All'] },
            { name: 'web_design_system', description: 'Web设计系统生成', platforms: ['Web'] },
            { name: 'responsive_preview', description: '响应式预览生成', platforms: ['Responsive'] },
            { name: 'get_platform_guidelines', description: '平台设计规范', platforms: ['All'] }
          ]
        }));
        return;
      }

      // 默认响应
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: '🎨 Leafer Design System MCP Server v3.1',
        endpoints: {
          'GET /health': '健康检查',
          'GET /tools': '可用工具列表'
        },
        note: 'MCP v3使用Stdio传输，请通过Trae IDE或MCP客户端调用',
        documentation: 'https://github.com/q86830-hue/leafer-x-design-system/blob/main/MCP_WORKFLOW.md'
      }));
    });

    server.listen(this.port, () => {
      console.log(`
🚀 MCP HTTP服务已启动
═══════════════════════════════════════
📡 服务地址: http://localhost:${this.port}
📋 健康检查: http://localhost:${this.port}/health
🔧 工具列表: http://localhost:${this.port}/tools
📖 使用文档: https://github.com/q86830-hue/leafer-x-design-system
═══════════════════════════════════════

💡 提示: MCP v3.1使用Stdio传输协议
   推荐通过Trae IDE的MCP配置使用本服务
   或直接使用: npx leafer-x-design-system
`);
    });

    // 同时启动MCP Stdio服务器
    this.startMCPStdioServer();
  }

  startMCPStdioServer() {
    // MCP服务器通过stdio运行，由Trae等IDE直接调用
    console.log('🔄 MCP Stdio服务器模式已就绪（等待Trae连接）...');
    
    // 加载并运行MCP v3服务器
    require('./mcp-server-v3');
  }
}

// 如果是直接运行此文件
if (require.main === module) {
  const httpServer = new MCPHTTPServer();
  httpServer.start().catch(console.error);
}

module.exports = { MCPHTTPServer };
