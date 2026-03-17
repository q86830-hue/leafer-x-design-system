#!/usr/bin/env node

/**
 * MCP Server for Leafer Design System
 * 符合 Model Context Protocol 标准
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const http = require('http');

class LeaferMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'leafer-design-system',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // 错误处理
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };
  }

  setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'render_ui',
            description: '渲染 UI 原型图为图片',
            inputSchema: {
              type: 'object',
              properties: {
                width: {
                  type: 'number',
                  description: '画布宽度（像素）',
                  default: 800
                },
                height: {
                  type: 'number',
                  description: '画布高度（像素）',
                  default: 600
                },
                template: {
                  type: 'string',
                  description: '模板类型：mobile-login, mobile-home, desktop-dashboard, desktop-showcase, tablet-dashboard',
                  enum: ['mobile-login', 'mobile-home', 'desktop-dashboard', 'desktop-showcase', 'tablet-dashboard']
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色',
                  default: '#ffffff'
                }
              }
            }
          },
          {
            name: 'generate_design_system',
            description: '生成完整的设计系统配置',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: '设计系统名称',
                  default: 'My Design System'
                },
                primaryColor: {
                  type: 'string',
                  description: '主色调（十六进制）',
                  default: '#667eea'
                },
                secondaryColor: {
                  type: 'string',
                  description: '次色调（十六进制）',
                  default: '#764ba2'
                },
                mode: {
                  type: 'string',
                  description: '主题模式',
                  enum: ['light', 'dark'],
                  default: 'light'
                }
              }
            }
          },
          {
            name: 'get_templates',
            description: '获取所有可用模板列表',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'render_ui') {
          return await this.handleRenderUI(args);
        } else if (name === 'generate_design_system') {
          return await this.handleGenerateDesignSystem(args);
        } else if (name === 'get_templates') {
          return await this.handleGetTemplates();
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleRenderUI(args) {
    // 这里调用本地 HTTP 服务
    const templateData = this.getTemplateData(args.template || 'mobile-login');
    
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        width: args.width || templateData.width,
        height: args.height || templateData.height,
        elements: templateData.elements,
        options: {
          format: 'png',
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: args.backgroundColor || templateData.backgroundColor || '#ffffff'
        }
      });

      const options = {
        hostname: 'localhost',
        port: 3456,
        path: '/api/v1/ui/render',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.success) {
              resolve({
                content: [
                  {
                    type: 'text',
                    text: `✅ UI 渲染成功！\n\n📁 图片路径: ${result.data.url}\n📐 尺寸: ${result.data.width}x${result.data.height}\n⏱️ 渲染时间: ${result.data.renderTime}ms\n\n图片已保存到本地 output 目录。`
                  }
                ]
              });
            } else {
              reject(new Error(result.error || 'Render failed'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`无法连接到渲染服务: ${err.message}. 请确保 MCP 服务已启动 (node start-mcp-service-v2.js)`));
      });

      req.write(postData);
      req.end();
    });
  }

  getTemplateData(templateName) {
    const templates = {
      'mobile-login': {
        width: 375,
        height: 812,
        backgroundColor: '#ffffff',
        elements: [
          {
            type: 'box',
            x: 0, y: 0, width: 375, height: 812,
            fill: '#ffffff'
          },
          {
            type: 'text',
            x: 187, y: 120,
            text: '欢迎回来',
            fill: '#111827',
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center'
          }
        ]
      },
      'desktop-dashboard': {
        width: 1200,
        height: 800,
        backgroundColor: '#f3f4f6',
        elements: [
          {
            type: 'box',
            x: 0, y: 0, width: 1200, height: 800,
            fill: '#f3f4f6'
          }
        ]
      }
    };

    return templates[templateName] || templates['mobile-login'];
  }

  async handleGenerateDesignSystem(args) {
    const designSystem = {
      name: args.name || 'My Design System',
      version: '2.0.0',
      theme: {
        colors: {
          primary: args.primaryColor || '#667eea',
          secondary: args.secondaryColor || '#764ba2'
        },
        mode: args.mode || 'light'
      },
      templates: ['mobile-login', 'mobile-home', 'desktop-dashboard', 'desktop-showcase', 'tablet-dashboard']
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ 设计系统生成成功！\n\n📦 名称: ${designSystem.name}\n🎨 主色调: ${designSystem.theme.colors.primary}\n🎨 次色调: ${designSystem.theme.colors.secondary}\n🌓 模式: ${designSystem.theme.mode}\n📱 可用模板: ${designSystem.templates.join(', ')}`
        }
      ]
    };
  }

  async handleGetTemplates() {
    const templates = [
      { id: 'mobile-login', name: '移动端登录页', size: '375x812' },
      { id: 'mobile-home', name: '移动端首页', size: '375x812' },
      { id: 'desktop-dashboard', name: '桌面仪表盘', size: '1200x800' },
      { id: 'desktop-showcase', name: '组件展示', size: '1200x1600' },
      { id: 'tablet-dashboard', name: '平板仪表盘', size: '1024x768' }
    ];

    return {
      content: [
        {
          type: 'text',
          text: `📋 可用模板列表:\n\n${templates.map(t => `• ${t.name} (${t.size}) - ID: ${t.id}`).join('\n')}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // 只输出到 stderr，stdout 用于 MCP 通信
    console.error('Leafer MCP Server running on stdio');
  }
}

// 启动服务器
const server = new LeaferMCPServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
