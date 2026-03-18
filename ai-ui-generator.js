/**
 * AI UI 生成器 - 多模型支持版本
 * 集成国内外主流 AI 模型 API
 * 
 * 支持的模型:
 * 国内: 文心一言、通义千问、智谱AI、讯飞星火、DeepSeek、Kimi、MiniMax
 * 国外: OpenAI、Claude、Gemini、OpenRouter、Cohere、Mistral
 */

const { BrowserBridge } = require('./browser-bridge');
const { LeaferRendererV2 } = require('./leafer-renderer-v2');
const { 
  getModelConfig, 
  getConfigByModelId, 
  getRecommendedModels,
  validateApiKey 
} = require('./ai-model-config');

class AIUIGenerator {
  constructor(options = {}) {
    this.browser = new BrowserBridge(options.browser);
    this.leafer = new LeaferRendererV2(options.leafer);
    
    // 模型配置
    this.aiProvider = options.aiProvider || process.env.DEFAULT_AI_PROVIDER || 'openrouter';
    this.model = options.model || process.env.DEFAULT_MODEL || 'openrouter/healer-alpha';
    this.apiKey = options.apiKey || this.getApiKeyFromEnv(this.aiProvider);
    
    // 获取模型配置
    this.modelConfig = getConfigByModelId(this.model) || getModelConfig(this.aiProvider);
    if (this.modelConfig) {
      this.baseURL = options.baseURL || this.modelConfig.baseURL;
    }
    
    console.log(`[AIUIGenerator] 使用模型: ${this.model} (${this.aiProvider})`);
  }

  /**
   * 从环境变量获取 API 密钥
   */
  getApiKeyFromEnv(provider) {
    const envMap = {
      'openrouter': 'OPENROUTER_API_KEY',
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'google': 'GOOGLE_API_KEY',
      'qwen': 'QWEN_API_KEY',
      'deepseek': 'DEEPSEEK_API_KEY',
      'kimi': 'KIMI_API_KEY',
      'chatglm': 'CHATGLM_API_KEY',
      'ernie': 'BAIDU_API_KEY',
      'spark': 'SPARK_API_KEY',
      'minimax': 'MINIMAX_API_KEY',
      'cohere': 'COHERE_API_KEY',
      'mistral': 'MISTRAL_API_KEY'
    };
    
    const envKey = envMap[provider];
    return envKey ? process.env[envKey] : null;
  }

  /**
   * 初始化服务
   */
  async init() {
    console.log('[AIUIGenerator] 初始化...');
    await this.browser.launch();
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
    console.log(`[AIUIGenerator] 使用提供商: ${this.aiProvider}, 模型: ${this.model}`);
    
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

    // 根据提供商调用对应的 API
    let uiDescription;
    try {
      uiDescription = await this.callAIAPI(userPrompt, systemPrompt);
    } catch (error) {
      console.warn(`[AIUIGenerator] ${this.aiProvider} API 调用失败，使用备用方案:`, error.message);
      uiDescription = await this.mockAIGeneration(userPrompt, systemPrompt);
    }
    
    console.log('[AIUIGenerator] ✅ UI 描述生成完成');
    return uiDescription;
  }

  /**
   * 统一调用 AI API
   */
  async callAIAPI(userPrompt, systemPrompt) {
    switch (this.aiProvider) {
      case 'openrouter':
        return await this.callOpenRouterAPI(userPrompt, systemPrompt);
      case 'openai':
        return await this.callOpenAIAPI(userPrompt, systemPrompt);
      case 'anthropic':
        return await this.callClaudeAPI(userPrompt, systemPrompt);
      case 'qwen':
        return await this.callQwenAPI(userPrompt, systemPrompt);
      case 'deepseek':
        return await this.callDeepSeekAPI(userPrompt, systemPrompt);
      case 'kimi':
        return await this.callKimiAPI(userPrompt, systemPrompt);
      case 'chatglm':
        return await this.callChatGLMAPI(userPrompt, systemPrompt);
      case 'gemini':
        return await this.callGeminiAPI(userPrompt, systemPrompt);
      default:
        // 默认使用 OpenRouter 格式
        return await this.callOpenRouterAPI(userPrompt, systemPrompt);
    }
  }

  /**
   * 调用 OpenRouter API
   */
  async callOpenRouterAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 OpenRouter API...');
    return this.callGenericOpenAICompatibleAPI(
      'openrouter.ai',
      '/api/v1/chat/completions',
      userPrompt,
      systemPrompt,
      {
        'HTTP-Referer': 'https://github.com/q86830-hue/leafer-x-design-system',
        'X-Title': 'Leafer Design System'
      }
    );
  }

  /**
   * 调用 OpenAI API
   */
  async callOpenAIAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 OpenAI API...');
    return this.callGenericOpenAICompatibleAPI(
      'api.openai.com',
      '/v1/chat/completions',
      userPrompt,
      systemPrompt
    );
  }

  /**
   * 调用 DeepSeek API
   */
  async callDeepSeekAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 DeepSeek API...');
    return this.callGenericOpenAICompatibleAPI(
      'api.deepseek.com',
      '/v1/chat/completions',
      userPrompt,
      systemPrompt
    );
  }

  /**
   * 调用 Kimi API
   */
  async callKimiAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 Kimi API...');
    return this.callGenericOpenAICompatibleAPI(
      'api.moonshot.cn',
      '/v1/chat/completions',
      userPrompt,
      systemPrompt
    );
  }

  /**
   * 调用 ChatGLM API
   */
  async callChatGLMAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 ChatGLM API...');
    return this.callGenericOpenAICompatibleAPI(
      'open.bigmodel.cn',
      '/api/paas/v4/chat/completions',
      userPrompt,
      systemPrompt
    );
  }

  /**
   * 通用 OpenAI 兼容格式 API 调用
   */
  async callGenericOpenAICompatibleAPI(hostname, path, userPrompt, systemPrompt, extraHeaders = {}) {
    const https = require('https');
    
    const postData = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...extraHeaders
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error.message || JSON.stringify(response.error)));
              return;
            }
            
            const content = response.choices[0].message.content;
            console.log('[AIUIGenerator] ✅ API 调用成功');
            
            // 解析 JSON 响应
            try {
              const uiDescription = JSON.parse(content);
              resolve(uiDescription);
            } catch (e) {
              // 如果返回的不是纯 JSON，尝试提取 JSON 部分
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                resolve(JSON.parse(jsonMatch[0]));
              } else {
                reject(new Error('无法解析 API 响应'));
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('[AIUIGenerator] API 调用失败:', err.message);
        reject(err);
      });
      
      req.write(postData);
      req.end();
    });
  }

  /**
   * 调用通义千问 API
   */
  async callQwenAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用通义千问 API...');
    const https = require('https');
    
    const postData = JSON.stringify({
      model: this.model,
      input: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000,
        result_format: 'message'
      }
    });
    
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.code) {
              reject(new Error(response.message || 'API 调用失败'));
              return;
            }
            
            const content = response.output.choices[0].message.content;
            console.log('[AIUIGenerator] ✅ 通义千问 API 调用成功');
            
            try {
              const uiDescription = JSON.parse(content);
              resolve(uiDescription);
            } catch (e) {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                resolve(JSON.parse(jsonMatch[0]));
              } else {
                reject(new Error('无法解析 API 响应'));
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * 调用 Claude API
   */
  async callClaudeAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 Claude API...');
    const https = require('https');
    
    const postData = JSON.stringify({
      model: this.model,
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });
    
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error.message));
              return;
            }
            
            const content = response.content[0].text;
            console.log('[AIUIGenerator] ✅ Claude API 调用成功');
            
            try {
              const uiDescription = JSON.parse(content);
              resolve(uiDescription);
            } catch (e) {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                resolve(JSON.parse(jsonMatch[0]));
              } else {
                reject(new Error('无法解析 API 响应'));
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * 调用 Gemini API
   */
  async callGeminiAPI(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 调用 Gemini API...');
    const https = require('https');
    
    const postData = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt + '\n\n' + userPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    });
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error.message));
              return;
            }
            
            const content = response.candidates[0].content.parts[0].text;
            console.log('[AIUIGenerator] ✅ Gemini API 调用成功');
            
            try {
              const uiDescription = JSON.parse(content);
              resolve(uiDescription);
            } catch (e) {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                resolve(JSON.parse(jsonMatch[0]));
              } else {
                reject(new Error('无法解析 API 响应'));
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * 模拟 AI 生成（备用方案）
   */
  async mockAIGeneration(userPrompt, systemPrompt) {
    console.log('[AIUIGenerator] 使用模拟数据...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 根据用户输入生成不同的 UI 描述
    if (userPrompt.includes('电商') || userPrompt.includes('商品')) {
      return this.generateEcommerceMock();
    }
    
    if (userPrompt.includes('仪表板') || userPrompt.includes('dashboard')) {
      return this.generateDashboardMock();
    }
    
    if (userPrompt.includes('Strat Studio') || userPrompt.includes('设计工作室')) {
      return this.generateStratStudioMock();
    }
    
    // 默认落地页
    return this.generateLandingPageMock();
  }

  generateEcommerceMock() {
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

  generateDashboardMock() {
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
              { title: '收入', value: '¥89,234', change: '+8%' },
              { title: '订单', value: '1,234', change: '+15%' }
            ]
          }
        },
        {
          type: 'chart',
          props: {
            type: 'line',
            title: '趋势图'
          }
        }
      ]
    };
  }

  generateStratStudioMock() {
    return {
      type: 'landing-page',
      layout: 'grid',
      theme: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#3b82f6',
        backgroundColor: '#0a0a0a',
        fontFamily: 'Microsoft YaHei'
      },
      components: [
        {
          type: 'hero',
          props: {
            headline: 'Strat Studio - Premium Web Design',
            subheadline: 'Design studio for AI, SaaS & Tech',
            description: 'Meet your new AI Design Agency',
            ctaText: 'Schedule a Free Call'
          }
        },
        {
          type: 'portfolio',
          props: {
            title: 'Portfolio - Works that build trust',
            works: ['AI SaaS', 'SaaS Template', 'Portfolio', 'Dashboard', 'Technology', 'Agency']
          }
        },
        {
          type: 'benefits',
          props: {
            title: 'Speed, Simplicity',
            items: ['Swift replies', 'Careful edits', 'Adaptable support']
          }
        },
        {
          type: 'footer',
          props: {
            copyright: '© 2024 Strat Studio. All rights reserved.'
          }
        }
      ]
    };
  }

  generateLandingPageMock() {
    return {
      type: 'landing-page',
      layout: 'grid',
      theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        backgroundColor: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      },
      components: [
        {
          type: 'header',
          props: {
            logo: 'Logo',
            navItems: ['首页', '功能', '价格', '关于'],
            ctaText: '开始使用'
          }
        },
        {
          type: 'hero',
          props: {
            headline: '打造卓越的数字体验',
            subheadline: '我们帮助您构建令人惊艳的产品',
            ctaText: '立即开始',
            secondaryCtaText: '了解更多'
          }
        },
        {
          type: 'features',
          props: {
            title: '核心功能',
            items: [
              { title: '快速开发', description: '高效的工作流程' },
              { title: '精美设计', description: '专业的视觉体验' },
              { title: '可靠稳定', description: '企业级质量保证' }
            ]
          }
        },
        {
          type: 'footer',
          props: {
            copyright: '© 2024 All rights reserved.'
          }
        }
      ]
    };
  }

  /**
   * 切换模型
   */
  switchModel(provider, model) {
    console.log(`[AIUIGenerator] 切换模型: ${provider} / ${model}`);
    
    this.aiProvider = provider;
    this.model = model;
    this.apiKey = this.getApiKeyFromEnv(provider);
    
    this.modelConfig = getConfigByModelId(model) || getModelConfig(provider);
    if (this.modelConfig) {
      this.baseURL = this.modelConfig.baseURL;
    }
    
    console.log(`[AIUIGenerator] 已切换到: ${model}`);
  }

  /**
   * 获取当前模型信息
   */
  getCurrentModel() {
    return {
      provider: this.aiProvider,
      model: this.model,
      config: this.modelConfig
    };
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const errors = [];
    
    if (!this.apiKey) {
      errors.push(`缺少 API 密钥: ${this.aiProvider}`);
    } else if (!validateApiKey(this.aiProvider, this.apiKey)) {
      errors.push(`API 密钥格式可能不正确: ${this.aiProvider}`);
    }
    
    if (!this.modelConfig) {
      errors.push(`未知的模型配置: ${this.model}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = { AIUIGenerator };
