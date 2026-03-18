/**
 * AI UI 生成器 - 阶段3实现
 * 集成图形模型 API、无头浏览器和 Leafer Design System
 * 
 * 使用 Shannon 六把钥匙方法论:
 * 1. 简化: 核心功能是 AI 生成 UI 描述
 * 2. 重述: 作为智能设计助手
 * 3. 泛化: 通用的 AI 驱动设计流程
 * 4. 分解: AI调用→描述生成→渲染→输出
 * 5. 繁衍: 从高质量UI需求倒推AI提示词
 * 6. 类比: 类似 Figma AI 或 Canva Magic Design
 */

const { BrowserBridge } = require('./browser-bridge');
const { LeaferRendererV2 } = require('./leafer-renderer-v2');

class AIUIGenerator {
  constructor(options = {}) {
    this.browser = new BrowserBridge(options.browser);
    this.leafer = new LeaferRendererV2(options.leafer);
    this.aiProvider = options.aiProvider || 'claude'; // 或 'openai'
    this.apiKey = options.apiKey;
  }

  /**
   * 初始化服务
   */
  async init() {
    console.log('[AIUIGenerator] 初始化...');
    await this.browser.launch();
    await this.leafer.init();
    console.log('[AIUIGenerator] ✅ 初始化完成');
  }

  /**
   * 使用 AI 生成 UI 描述
   * 
   * @param {string} prompt - 用户需求描述
   * @param {Object} options - 配置选项
   * @returns {Object} UI 描述对象
   */
  async generateUIDescription(prompt, options = {}) {
    console.log('[AIUIGenerator] 生成 UI 描述...');
    
    const systemPrompt = `你是一个专业的 UI/UX 设计师。根据用户的需求，生成结构化的 UI 设计描述。
    
请输出 JSON 格式的 UI 描述，包含以下字段:
- type: 页面类型 (landing-page, dashboard, form, etc.)
- layout: 布局类型 (grid, flex, absolute)
- theme: 主题配置 (colors, fonts)
- components: 组件数组，每个组件包含:
  - type: 组件类型 (header, hero, features, footer, etc.)
  - props: 组件属性
  - children: 子组件

示例输出:
{
  "type": "landing-page",
  "layout": "grid",
  "theme": {
    "primaryColor": "#667eea",
    "secondaryColor": "#764ba2",
    "fontFamily": "Microsoft YaHei"
  },
  "components": [
    {
      "type": "header",
      "props": { "title": "产品名称", "navItems": ["首页", "功能", "价格"] }
    },
    {
      "type": "hero",
      "props": { "headline": "主标题", "subheadline": "副标题", "ctaText": "立即开始" }
    }
  ]
}`;

    const userPrompt = `用户需求: ${prompt}

风格要求: ${options.style || '现代简洁'}
主色调: ${options.primaryColor || '#667eea'}
辅助色: ${options.secondaryColor || '#764ba2'}

请生成详细的 UI 设计描述。`;

    // 这里调用实际的 AI API
    // 暂时使用模拟数据演示
    const uiDescription = await this.mockAIGeneration(userPrompt, systemPrompt);
    
    console.log('[AIUIGenerator] ✅ UI 描述生成完成');
    return uiDescription;
  }

  /**
   * 模拟 AI 生成（实际项目中替换为真实 API 调用）
   */
  async mockAIGeneration(userPrompt, systemPrompt) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 根据用户输入生成不同的 UI 描述
    if (userPrompt.includes('电商') || userPrompt.includes('商品')) {
      return {
        type: 'ecommerce-product-page',
        layout: 'grid',
        theme: {
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          backgroundColor: '#f8f9fa',
          fontFamily: 'Microsoft YaHei'
        },
        components: [
          {
            type: 'header',
            props: {
              logo: '商城Logo',
              navItems: ['首页', '分类', '购物车', '我的'],
              height: 60
            }
          },
          {
            type: 'product-gallery',
            props: {
              mainImage: '主图',
              thumbnails: 4,
              width: 500,
              height: 500
            }
          },
          {
            type: 'product-info',
            props: {
              title: '高品质商品',
              price: '¥299',
              originalPrice: '¥399',
              rating: 4.8,
              reviews: 128,
              description: '这是一个非常棒的商品...'
            }
          },
          {
            type: 'action-bar',
            props: {
              buttons: [
                { text: '立即购买', type: 'primary', color: '#ff6b6b' },
                { text: '加入购物车', type: 'secondary', color: '#4ecdc4' }
              ]
            }
          }
        ]
      };
    }
    
    if (userPrompt.includes('仪表板') || userPrompt.includes('dashboard')) {
      return {
        type: 'dashboard',
        layout: 'grid',
        theme: {
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          backgroundColor: '#1a202c',
          fontFamily: 'Microsoft YaHei'
        },
        components: [
          {
            type: 'sidebar',
            props: {
              menuItems: ['概览', '分析', '用户', '设置'],
              width: 240
            }
          },
          {
            type: 'stats-cards',
            props: {
              cards: [
                { title: '总用户', value: '12,345', change: '+12%' },
                { title: '收入', value: '¥89,234', change: '+23%' },
                { title: '订单', value: '1,234', change: '+5%' },
                { title: '转化率', value: '3.2%', change: '-2%' }
              ]
            }
          },
          {
            type: 'chart',
            props: {
              type: 'line',
              title: '趋势图',
              height: 300
            }
          },
          {
            type: 'data-table',
            props: {
              title: '最近订单',
              columns: ['订单号', '客户', '金额', '状态'],
              rows: 5
            }
          }
        ]
      };
    }
    
    // 默认落地页
    return {
      type: 'landing-page',
      layout: 'flex',
      theme: {
        primaryColor: options.primaryColor || '#667eea',
        secondaryColor: options.secondaryColor || '#764ba2',
        backgroundColor: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      },
      components: [
        {
          type: 'header',
          props: {
            logo: 'Logo',
            navItems: ['首页', '功能', '价格', '关于'],
            height: 80
          }
        },
        {
          type: 'hero',
          props: {
            headline: '欢迎来到我们的产品',
            subheadline: '这是最好的解决方案',
            ctaText: '立即开始',
            ctaColor: options.primaryColor || '#667eea',
            height: 500
          }
        },
        {
          type: 'features',
          props: {
            title: '核心功能',
            features: [
              { icon: '🚀', title: '快速', description: '极速体验' },
              { icon: '🔒', title: '安全', description: '企业级安全' },
              { icon: '💡', title: '智能', description: 'AI 驱动' }
            ]
          }
        },
        {
          type: 'footer',
          props: {
            copyright: '© 2024 公司名称',
            links: ['隐私政策', '服务条款', '联系我们']
          }
        }
      ]
    };
  }

  /**
   * 将 UI 描述转换为 HTML
   */
  convertToHTML(uiDescription) {
    const { theme, components } = uiDescription;
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${theme.fontFamily}, Arial, sans-serif;
      background-color: ${theme.backgroundColor};
      color: #333;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
  </style>
</head>
<body>
`;

    components.forEach(comp => {
      html += this.renderComponent(comp, theme);
    });

    html += `
</body>
</html>
`;

    return html;
  }

  /**
   * 渲染单个组件为 HTML
   */
  renderComponent(component, theme) {
    const { type, props } = component;
    
    switch (type) {
      case 'header':
        return `
  <header style="background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px 0;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 24px; font-weight: bold; color: ${theme.primaryColor};">${props.logo}</div>
      <nav style="display: flex; gap: 30px;">
        ${props.navItems.map(item => `<a href="#" style="text-decoration: none; color: #666;">${item}</a>`).join('')}
      </nav>
    </div>
  </header>
`;

      case 'hero':
        return `
  <section style="background: linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%); 
                  color: white; padding: 100px 0; text-align: center;">
    <div class="container">
      <h1 style="font-size: 48px; margin-bottom: 20px;">${props.headline}</h1>
      <p style="font-size: 24px; margin-bottom: 40px; opacity: 0.9;">${props.subheadline}</p>
      <button style="background: white; color: ${props.ctaColor}; padding: 15px 40px; 
                     border: none; border-radius: 30px; font-size: 18px; cursor: pointer;">
        ${props.ctaText}
      </button>
    </div>
  </section>
`;

      case 'features':
        return `
  <section style="padding: 80px 0;">
    <div class="container">
      <h2 style="text-align: center; font-size: 36px; margin-bottom: 60px;">${props.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
        ${props.features.map(f => `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">${f.icon}</div>
            <h3 style="font-size: 24px; margin-bottom: 10px;">${f.title}</h3>
            <p style="color: #666;">${f.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;

      case 'footer':
        return `
  <footer style="background: #2d3748; color: white; padding: 40px 0; text-align: center;">
    <div class="container">
      <p style="margin-bottom: 20px;">${props.copyright}</p>
      <div style="display: flex; justify-content: center; gap: 30px;">
        ${props.links.map(link => `<a href="#" style="color: #a0aec0; text-decoration: none;">${link}</a>`).join('')}
      </div>
    </div>
  </footer>
`;

      default:
        return '';
    }
  }

  /**
   * 生成完整 UI
   * 
   * @param {string} prompt - 用户需求
   * @param {Object} options - 配置
   * @returns {Object} 包含浏览器预览和 Leafer 高保真图
   */
  async generate(prompt, options = {}) {
    console.log('[AIUIGenerator] 开始生成 UI...');
    console.log(`[AIUIGenerator] 需求: ${prompt}`);
    
    // 1. AI 生成 UI 描述
    const uiDescription = await this.generateUIDescription(prompt, options);
    
    // 2. 生成 HTML
    const html = this.convertToHTML(uiDescription);
    
    // 3. 浏览器截图预览
    console.log('[AIUIGenerator] 生成浏览器预览...');
    const browserScreenshot = await this.browser.screenshot(html, {
      width: options.width || 1200,
      height: options.height || 800,
      format: 'png'
    });
    
    // 4. Leafer 生成高保真图
    console.log('[AIUIGenerator] 生成高保真图...');
    const leaferElements = this.convertToLeaferElements(uiDescription);
    const highFidelityResult = await this.leafer.render({
      width: options.width || 1200,
      height: options.height || 800,
      elements: leaferElements
    });
    
    console.log('[AIUIGenerator] ✅ UI 生成完成');
    
    return {
      uiDescription,
      html,
      browserPreview: browserScreenshot,
      highFidelityImage: highFidelityResult,
      files: {
        html: `ui-${Date.now()}.html`,
        browser: `browser-preview-${Date.now()}.png`,
        leafer: highFidelityResult.filename
      }
    };
  }

  /**
   * 将 UI 描述转换为 Leafer 元素
   */
  convertToLeaferElements(uiDescription) {
    const { theme, components } = uiDescription;
    const elements = [];
    let yOffset = 0;

    // 背景
    elements.push({
      type: 'box',
      x: 0,
      y: 0,
      width: 1200,
      height: 800,
      fill: theme.backgroundColor
    });

    components.forEach(comp => {
      switch (comp.type) {
        case 'header':
          elements.push({
            type: 'box',
            x: 0,
            y: yOffset,
            width: 1200,
            height: comp.props.height || 80,
            fill: '#ffffff',
            shadow: { x: 0, y: 2, blur: 4, color: '#00000010' }
          });
          elements.push({
            type: 'text',
            x: 40,
            y: yOffset + 45,
            text: comp.props.logo,
            fill: theme.primaryColor,
            fontSize: 24,
            fontWeight: 'bold'
          });
          yOffset += comp.props.height || 80;
          break;

        case 'hero':
          elements.push({
            type: 'box',
            x: 0,
            y: yOffset,
            width: 1200,
            height: comp.props.height || 400,
            fill: { type: 'linear', from: [0, 0], to: [1200, 0], colors: [theme.primaryColor, theme.secondaryColor] }
          });
          elements.push({
            type: 'text',
            x: 600,
            y: yOffset + 150,
            text: comp.props.headline,
            fill: '#ffffff',
            fontSize: 48,
            fontWeight: 'bold',
            textAlign: 'center'
          });
          elements.push({
            type: 'text',
            x: 600,
            y: yOffset + 220,
            text: comp.props.subheadline,
            fill: '#ffffff',
            fontSize: 24,
            textAlign: 'center'
          });
          yOffset += comp.props.height || 400;
          break;

        // 其他组件类型...
      }
    });

    return elements;
  }

  /**
   * 关闭服务
   */
  async close() {
    await this.browser.close();
    console.log('[AIUIGenerator] 服务已关闭');
  }
}

module.exports = { AIUIGenerator };

// 测试代码
if (require.main === module) {
  const generator = new AIUIGenerator();
  
  (async () => {
    try {
      await generator.init();
      
      // 测试生成
      const result = await generator.generate('创建一个现代化的 SaaS 产品落地页', {
        style: '现代简洁',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2'
      });
      
      console.log('生成结果:', {
        files: result.files,
        preview: result.browserPreview.substring(0, 100) + '...'
      });
      
      await generator.close();
    } catch (err) {
      console.error('错误:', err);
      process.exit(1);
    }
  })();
}
