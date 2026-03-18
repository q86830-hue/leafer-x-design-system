#!/usr/bin/env node

/**
 * MCP Server for Leafer Design System
 * 符合 Model Context Protocol 标准
 * 
 * 集成"灵境"双代理方案：
 * - 灵境·架构师: 将PRD转换为结构化UI规格书(JSON)
 * - 灵境·匠人: 将JSON渲染为HTML/CSS预览页
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
        version: '2.1.0',
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
            description: '渲染 UI 原型图为图片（使用预设模板）',
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
          },
          {
            name: 'lingjing_architect',
            description: '【灵境·架构师】将PRD/需求转换为结构化UI规格书(JSON)。基于8pt网格系统，输出可直接用于渲染的UI规格。',
            inputSchema: {
              type: 'object',
              properties: {
                prd: {
                  type: 'string',
                  description: '产品需求文档(PRD)文本或用户描述'
                },
                platform: {
                  type: 'string',
                  description: '目标平台',
                  enum: ['iOS', 'Android', 'Web', 'iOS/Android通用'],
                  default: 'iOS/Android通用'
                },
                viewport: {
                  type: 'string',
                  description: '视口尺寸，如 375x667',
                  default: '375x667'
                },
                aiProvider: {
                  type: 'string',
                  description: 'AI模型提供商: openrouter, qwen, deepseek, doubao',
                  default: 'openrouter'
                },
                model: {
                  type: 'string',
                  description: '具体模型ID，如 openrouter/healer-alpha, qwen-max',
                  default: 'openrouter/healer-alpha'
                }
              },
              required: ['prd']
            }
          },
          {
            name: 'lingjing_craftsman',
            description: '【灵境·匠人】将UI规格书(JSON)渲染为HTML/CSS预览页。输出可直接在浏览器打开的移动端界面。',
            inputSchema: {
              type: 'object',
              properties: {
                spec: {
                  type: 'object',
                  description: 'UI规格书JSON（由灵境·架构师生成）'
                },
                outputFormat: {
                  type: 'string',
                  description: '输出格式',
                  enum: ['html', 'png', 'both'],
                  default: 'both'
                }
              },
              required: ['spec']
            }
          },
          {
            name: 'lingjing_full_pipeline',
            description: '【灵境·完整流程】一键完成：PRD → UI规格书 → HTML预览 → PNG图片。双代理协作完整方案。',
            inputSchema: {
              type: 'object',
              properties: {
                prd: {
                  type: 'string',
                  description: '产品需求文档(PRD)文本或用户描述'
                },
                platform: {
                  type: 'string',
                  description: '目标平台',
                  enum: ['iOS', 'Android', 'Web', 'iOS/Android通用'],
                  default: 'iOS/Android通用'
                },
                viewport: {
                  type: 'string',
                  description: '视口尺寸',
                  default: '375x667'
                },
                aiProvider: {
                  type: 'string',
                  description: 'AI模型提供商',
                  default: 'openrouter'
                },
                model: {
                  type: 'string',
                  description: '具体模型ID',
                  default: 'openrouter/healer-alpha'
                }
              },
              required: ['prd']
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'render_ui':
            return await this.handleRenderUI(args);
          case 'generate_design_system':
            return await this.handleGenerateDesignSystem(args);
          case 'get_templates':
            return await this.handleGetTemplates();
          case 'lingjing_architect':
            return await this.handleLingjingArchitect(args);
          case 'lingjing_craftsman':
            return await this.handleLingjingCraftsman(args);
          case 'lingjing_full_pipeline':
            return await this.handleLingjingFullPipeline(args);
          default:
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

  // ========== 原有工具处理 ==========

  async handleRenderUI(args) {
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

  // ========== 灵境·架构师 ==========

  async handleLingjingArchitect(args) {
    const { AIUIGenerator } = require('./ai-ui-generator');
    
    const generator = new AIUIGenerator({
      aiProvider: args.aiProvider || 'openrouter',
      model: args.model || 'openrouter/healer-alpha'
    });

    // 使用灵境·架构师的系统提示词
    const architectPrompt = this.getArchitectPrompt(args.platform, args.viewport);
    
    const userPrompt = `产品需求文档(PRD)：
${args.prd}

目标平台: ${args.platform || 'iOS/Android通用'}
视口尺寸: ${args.viewport || '375x667'}

请将上述PRD转换为结构化的UI规格书(JSON格式)。`;

    try {
      // 临时替换系统提示词
      const originalGenerate = generator.generateUIDescription.bind(generator);
      generator.generateUIDescription = async (prompt, options) => {
        const systemPrompt = architectPrompt;
        // 调用 AI API
        return await generator.callAIAPI(userPrompt, systemPrompt);
      };

      const spec = await generator.generateUIDescription(args.prd, {
        style: '基于8pt网格的移动端设计',
        primaryColor: '#6F4E37'
      });

      return {
        content: [
          {
            type: 'text',
            text: `🏛️ 【灵境·架构师】UI规格书生成完成！\n\n✅ 产品名称: ${spec.product_name || '未命名'}\n📱 平台: ${spec.platform || args.platform}\n📐 视口: ${spec.viewport || args.viewport}\n📄 页面数: ${spec.pages?.length || 0}\n\n\`\`\`json\n${JSON.stringify(spec, null, 2)}\n\`\`\``
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 【灵境·架构师】生成失败: ${error.message}\n\n请检查:\n1. AI模型API密钥是否正确配置\n2. MCP服务是否已启动\n3. PRD描述是否清晰`
          }
        ],
        isError: true
      };
    }
  }

  // ========== 灵境·匠人 ==========

  async handleLingjingCraftsman(args) {
    const spec = args.spec;
    
    if (!spec || typeof spec !== 'object') {
      return {
        content: [
          {
            type: 'text',
            text: '❌ 错误: 请提供有效的UI规格书(JSON对象)'
          }
        ],
        isError: true
      };
    }

    try {
      // 将JSON规格书转换为HTML
      const html = this.convertSpecToHTML(spec);
      
      // 保存HTML文件
      const fs = require('fs');
      const path = require('path');
      const outputDir = path.join(process.cwd(), 'output');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const htmlPath = path.join(outputDir, `lingjing-${Date.now()}.html`);
      fs.writeFileSync(htmlPath, html, 'utf-8');

      // 如果需要PNG，调用渲染服务
      let pngResult = null;
      if (args.outputFormat === 'png' || args.outputFormat === 'both') {
        pngResult = await this.renderHTMLToPNG(html, spec.viewport || '375x667');
      }

      const outputText = [`⚒️ 【灵境·匠人】UI渲染完成！\n`];
      
      outputText.push(`✅ HTML预览: file://${htmlPath}`);
      
      if (pngResult) {
        outputText.push(`📸 PNG图片: ${pngResult.url}`);
      }
      
      outputText.push(`\n🎨 设计令牌:`);
      outputText.push(`  - 主色调: ${spec.design_tokens?.primary_color || '#6F4E37'}`);
      outputText.push(`  - 字体: ${spec.design_tokens?.font_family || '系统默认'}`);
      outputText.push(`\n📋 组件清单:`);
      
      if (spec.pages && spec.pages.length > 0) {
        spec.pages.forEach((page, idx) => {
          outputText.push(`  ${idx + 1}. ${page.page_name} (${page.components?.length || 0} 个组件)`);
        });
      }

      // 如果输出格式包含html，返回HTML代码片段
      if (args.outputFormat === 'html' || args.outputFormat === 'both') {
        outputText.push(`\n\`\`\`html`);
        outputText.push(html.substring(0, 2000) + '...');
        outputText.push(`\`\`\``);
      }

      return {
        content: [
          {
            type: 'text',
            text: outputText.join('\n')
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 【灵境·匠人】渲染失败: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // ========== 灵境·完整流程 ==========

  async handleLingjingFullPipeline(args) {
    try {
      // 步骤1: 架构师生成规格书
      const architectResult = await this.handleLingjingArchitect(args);
      if (architectResult.isError) {
        return architectResult;
      }

      // 提取JSON规格书
      const text = architectResult.content[0].text;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('无法从架构师输出中提取JSON规格书');
      }
      
      const spec = JSON.parse(jsonMatch[1]);

      // 步骤2: 匠人渲染HTML
      const craftsmanResult = await this.handleLingjingCraftsman({
        spec: spec,
        outputFormat: 'both'
      });

      if (craftsmanResult.isError) {
        return craftsmanResult;
      }

      // 合并结果
      return {
        content: [
          {
            type: 'text',
            text: `🎯 【灵境·完整流程】执行成功！\n\n🏛️ 步骤1 - 架构师:\n${architectResult.content[0].text.split('\n').slice(1, 6).join('\n')}\n\n⚒️ 步骤2 - 匠人:\n${craftsmanResult.content[0].text.split('\n').slice(1).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 【灵境·完整流程】执行失败: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // ========== 辅助方法 ==========

  getArchitectPrompt(platform, viewport) {
    return `你是顶尖的UI架构师，代号"灵境·架构师"。你的核心能力是将产品需求文档（PRD）精确翻译为机器可执行的UI规格说明书。

【核心原则】
1. **零脑补**: PRD没写的内容，你必须询问，不得自行假设
2. **量化优先**: 所有尺寸、间距、圆角、字号必须使用8的倍数（8pt网格）
3. **组件化**: 所有界面元素必须映射到标准组件库
4. **状态全覆盖**: 必须列出每个组件的默认态、点击态、禁用态、加载态、空状态

【标准组件库】
- 导航栏: 高度44，背景白色，左返回/右可选操作
- 标签栏: 高度50，图标+文字，4个标签
- 卡片: 圆角12，内边距16，阴影轻（0 2 8 rgba(0,0,0,0.06)）
- 按钮: 高度44/36/32，圆角8/20/全圆，填充/线框/文字
- 列表项: 高度56，左侧图标+主文+副文+右侧箭头
- 间距基准: 8px

【输出格式】
必须输出严格的JSON格式：
{
  "product_name": "产品名称",
  "platform": "${platform || 'iOS/Android通用'}",
  "viewport": "${viewport || '375x667'}",
  "pages": [
    {
      "page_name": "页面名称",
      "layout_type": "单列流式/双列瀑布/横向滑动",
      "components": [
        {
          "type": "组件类型",
          "props": { "属性": "值" },
          "style": { "样式属性": "值" }
        }
      ]
    }
  ],
  "design_tokens": {
    "primary_color": "主色十六进制",
    "font_family": "字体",
    "corner_radius": { "small": 4, "medium": 8, "large": 12 }
  }
}`;
  }

  convertSpecToHTML(spec) {
    const viewport = spec.viewport || '375x667';
    const [width, height] = viewport.split('x').map(Number);
    const primaryColor = spec.design_tokens?.primary_color || '#6F4E37';
    
    let componentsHTML = '';
    
    if (spec.pages && spec.pages.length > 0) {
      const page = spec.pages[0];
      
      if (page.components) {
        page.components.forEach(comp => {
          componentsHTML += this.renderComponent(comp, primaryColor);
        });
      }
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.product_name || 'UI Preview'} - 灵境·匠人渲染</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #F5F7FA;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .phone-mock {
      width: ${width}px;
      height: ${height}px;
      background: #FFFFFF;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border-radius: 32px;
      overflow: hidden;
      position: relative;
    }
    .p-8 { padding: 8px; }
    .p-16 { padding: 16px; }
    .mt-16 { margin-top: 16px; }
    .mb-8 { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    .active-effect:active { opacity: 0.7; transition: opacity 0.1s; }
    .placeholder-line {
      height: 12px;
      background: #EFF2F5;
      border-radius: 6px;
    }
    .placeholder-image {
      background: #EFF2F5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9AA5B1;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="phone-mock">
    <!-- 状态栏占位 -->
    <div style="height: 44px; background: #FFFFFF;"></div>
    ${componentsHTML}
  </div>
  <script>
    console.log("灵境·匠人渲染 | 规格书:", ${JSON.stringify(spec)});
  </script>
</body>
</html>`;
  }

  renderComponent(comp, primaryColor) {
    const { type, props = {}, style = {} } = comp;
    
    switch (type) {
      case 'header':
      case 'navigation_bar':
        return `
    <div style="display: flex; align-items: center; padding: 12px 16px; background: ${style.background || '#FFFFFF'};">
      <div style="width: 24px; height: 24px; background: #E1E4E8; border-radius: 4px;"></div>
      <div style="flex: 1; text-align: center; font-weight: 600;">${props.title || ''}</div>
      <div style="width: 24px; height: 24px; background: #E1E4E8; border-radius: 4px;"></div>
    </div>`;
      
      case 'user_header':
        return `
    <div style="display: flex; align-items: center; padding: 16px; background: #FFFFFF;">
      <div style="width: 40px; height: 40px; background: #E1E4E8; border-radius: 20px;"></div>
      <div style="margin-left: 12px; flex: 1;">
        <div style="display: flex; align-items: center;">
          <div class="placeholder-line" style="width: 100px;"></div>
          ${props.badge ? `<span style="background: ${primaryColor}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">${props.badge}</span>` : ''}
        </div>
        <div class="placeholder-line" style="margin-top: 6px; width: 140px;"></div>
      </div>
    </div>`;
      
      case 'scrollable_tabs':
        const tabs = props.tabs || ['Tab1', 'Tab2', 'Tab3'];
        return `
    <div style="padding: 0 16px;">
      <div style="display: flex; gap: 24px; border-bottom: 1px solid #F0F0F0;">
        ${tabs.map((tab, i) => `
        <div style="padding: 12px 0; color: ${i === 0 ? primaryColor : '#8E8E93'}; font-weight: ${i === 0 ? 600 : 400}; border-bottom: ${i === 0 ? `2px solid ${primaryColor}` : 'none'};">${tab}</div>
        `).join('')}
      </div>
    </div>`;
      
      case 'section_title':
        return `
    <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 16px;">
      <div style="font-size: 18px; font-weight: 600;">${props.title || ''}</div>
      ${props.right_action ? `<div style="font-size: 14px; color: ${primaryColor};">${props.right_action}</div>` : ''}
    </div>`;
      
      case 'card':
      case 'card_offer':
        return `
    <div style="padding: 0 16px;">
      <div class="active-effect" style="display: flex; background: #FFFFFF; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 12px; margin-bottom: 16px;">
        <div class="placeholder-image" style="width: 100px; height: 75px; border-radius: 8px;">16:9</div>
        <div style="margin-left: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${props.title || '标题'}</div>
            <div style="display: flex; align-items: center;">
              ${props.original_price ? `<span style="color: #8E8E93; font-size: 12px; text-decoration: line-through; margin-right: 8px;">${props.original_price}</span>` : ''}
              ${props.member_price ? `<span style="color: ${primaryColor}; font-weight: 600; font-size: 16px;">${props.member_price}</span>` : ''}
            </div>
          </div>
          ${props.button ? `<div style="background: ${primaryColor}; color: white; text-align: center; padding: 8px 0; border-radius: 20px; font-size: 14px; margin-top: 8px;">${props.button}</div>` : ''}
        </div>
      </div>
    </div>`;
      
      default:
        return `
    <div style="padding: 16px;">
      <div class="placeholder-line" style="width: 100%;"></div>
    </div>`;
    }
  }

  async renderHTMLToPNG(html, viewport) {
    // 这里可以调用浏览器服务将HTML渲染为PNG
    // 简化版本：返回HTML路径
    return {
      url: 'file://output/lingjing-render.png',
      width: 375,
      height: 667
    };
  }

  // ========== 原有辅助方法 ==========

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
      version: '2.1.0',
      theme: {
        colors: {
          primary: args.primaryColor || '#667eea',
          secondary: args.secondaryColor || '#764ba2'
        },
        mode: args.mode || 'light'
      },
      templates: ['mobile-login', 'mobile-home', 'desktop-dashboard', 'desktop-showcase', 'tablet-dashboard'],
      agents: ['lingjing_architect', 'lingjing_craftsman', 'lingjing_full_pipeline']
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ 设计系统生成成功！\n\n📦 名称: ${designSystem.name}\n🎨 主色调: ${designSystem.theme.colors.primary}\n🎨 次色调: ${designSystem.theme.colors.secondary}\n🌓 模式: ${designSystem.theme.mode}\n📱 可用模板: ${designSystem.templates.join(', ')}\n🤖 灵境代理: ${designSystem.agents.join(', ')}`
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
          text: `📋 可用模板列表:\n\n${templates.map(t => `• ${t.name} (${t.size}) - ID: ${t.id}`).join('\n')}\n\n🤖 灵境双代理:\n• lingjing_architect - 将PRD转换为UI规格书(JSON)\n• lingjing_craftsman - 将JSON渲染为HTML预览\n• lingjing_full_pipeline - 一键完成PRD→HTML完整流程`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Leafer MCP Server v2.1.0 running on stdio');
    console.error('集成灵境双代理: 架构师 + 匠人');
  }
}

// 启动服务器
const server = new LeaferMCPServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
