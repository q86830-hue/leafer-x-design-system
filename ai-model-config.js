/**
 * AI 模型配置管理器
 * 
 * 本系统使用 AI 模型生成 UI 设计描述（JSON格式），然后通过 LeaferJS 渲染成图像。
 * 
 * 支持的模型类型：
 * 1. 大语言模型（LLM）- 用于生成 UI 描述的文本/JSON
 *    - 国内: 文心一言、通义千问、智谱AI、讯飞星火、DeepSeek、Kimi、MiniMax、豆包
 *    - 国外: OpenAI GPT、Claude、Gemini、OpenRouter 等
 * 
 * 2. 图像生成模型 - 如需直接生成图片，可考虑以下服务：
 *    - OpenAI DALL-E 3
 *    - 百度文心一格
 *    - 阿里通义万相
 *    - 字节豆包·生图
 *    - Stability AI
 * 
 * 注意：本系统主要使用 LLM 生成结构化 UI 描述，再通过 LeaferJS 渲染。
 */

// ==================== 大语言模型（用于生成 UI 描述）====================

// 国内 LLM 配置
const DOMESTIC_LLM_MODELS = {
  // 百度文心一言
  'ernie': {
    name: '百度文心一言',
    provider: 'baidu',
    type: 'llm',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
    models: {
      'ernie-4.0': 'completions_pro',
      'ernie-3.5': 'completions',
      'ernie-speed': 'ernie_speed',
      'ernie-lite': 'ernie-lite-8k'
    },
    authType: 'oauth',
    docs: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html'
  },

  // 阿里通义千问
  'qwen': {
    name: '阿里通义千问',
    provider: 'aliyun',
    type: 'llm',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    models: {
      'qwen-max': 'qwen-max',
      'qwen-plus': 'qwen-plus',
      'qwen-turbo': 'qwen-turbo',
      'qwen-72b': 'qwen-72b-chat',
      'qwen-14b': 'qwen-14b-chat'
    },
    authType: 'apikey',
    docs: 'https://help.aliyun.com/zh/dashscope/'
  },

  // 智谱 AI (ChatGLM)
  'chatglm': {
    name: '智谱 AI',
    provider: 'zhipu',
    type: 'llm',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: {
      'glm-4': 'glm-4',
      'glm-4v': 'glm-4v',
      'glm-3-turbo': 'glm-3-turbo',
      'chatglm-turbo': 'chatglm-turbo'
    },
    authType: 'apikey',
    docs: 'https://open.bigmodel.cn/dev/api'
  },

  // 讯飞星火
  'spark': {
    name: '讯飞星火',
    provider: 'xfyun',
    type: 'llm',
    baseURL: 'wss://spark-api.xf-yun.com/v3.5/chat',
    models: {
      'spark-3.5': 'generalv3.5',
      'spark-3.0': 'generalv3',
      'spark-2.0': 'generalv2',
      'spark-1.5': 'general'
    },
    authType: 'signature',
    docs: 'https://www.xfyun.cn/doc/spark/Web.html'
  },

  // DeepSeek
  'deepseek': {
    name: 'DeepSeek',
    provider: 'deepseek',
    type: 'llm',
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    models: {
      'deepseek-chat': 'deepseek-chat',
      'deepseek-coder': 'deepseek-coder',
      'deepseek-67b': 'deepseek-67b-chat'
    },
    authType: 'apikey',
    docs: 'https://platform.deepseek.com/docs'
  },

  // 月之暗面 (Kimi)
  'kimi': {
    name: 'Kimi',
    provider: 'moonshot',
    type: 'llm',
    baseURL: 'https://api.moonshot.cn/v1/chat/completions',
    models: {
      'kimi-latest': 'kimi-latest',
      'kimi-128k': 'kimi-128k',
      'kimi-32k': 'kimi-32k',
      'kimi-8k': 'kimi-8k'
    },
    authType: 'apikey',
    docs: 'https://platform.moonshot.cn/docs'
  },

  // MiniMax
  'minimax': {
    name: 'MiniMax',
    provider: 'minimax',
    type: 'llm',
    baseURL: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    models: {
      'abab6.5': 'abab6.5-chat',
      'abab6': 'abab6-chat',
      'abab5.5': 'abab5.5-chat'
    },
    authType: 'apikey',
    docs: 'https://platform.minimaxi.com/document/ChatCompletion'
  },

  // 字节跳动 - 豆包
  'doubao': {
    name: '字节豆包',
    provider: 'volcengine',
    type: 'llm',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: {
      'doubao-pro': 'doubao-pro-32k',
      'doubao-lite': 'doubao-lite-32k',
      'doubao-vision': 'doubao-vision-lite'
    },
    authType: 'apikey',
    docs: 'https://www.volcengine.com/product/doubao'
  },

  // 零一万物
  'yi': {
    name: '零一万物 Yi',
    provider: 'lingyi',
    type: 'llm',
    baseURL: 'https://api.lingyiwanwu.com/v1/chat/completions',
    models: {
      'yi-large': 'yi-large',
      'yi-medium': 'yi-medium',
      'yi-vision': 'yi-vision'
    },
    authType: 'apikey',
    docs: 'https://platform.lingyiwanwu.com/docs'
  },

  // 百川智能
  'baichuan': {
    name: '百川智能',
    provider: 'baichuan',
    type: 'llm',
    baseURL: 'https://api.baichuan-ai.com/v1/chat/completions',
    models: {
      'baichuan-4': 'Baichuan4',
      'baichuan-3': 'Baichuan3-Turbo',
      'baichuan-2': 'Baichuan2-Turbo'
    },
    authType: 'apikey',
    docs: 'https://platform.baichuan-ai.com/docs'
  }
};

// 国外 LLM 配置
const INTERNATIONAL_LLM_MODELS = {
  // OpenAI
  'openai': {
    name: 'OpenAI',
    provider: 'openai',
    type: 'llm',
    baseURL: 'https://api.openai.com/v1/chat/completions',
    models: {
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'gpt-4': 'gpt-4',
      'gpt-3.5-turbo': 'gpt-3.5-turbo'
    },
    authType: 'apikey',
    docs: 'https://platform.openai.com/docs'
  },

  // Anthropic Claude
  'claude': {
    name: 'Anthropic Claude',
    provider: 'anthropic',
    type: 'llm',
    baseURL: 'https://api.anthropic.com/v1/messages',
    models: {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
      'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022'
    },
    authType: 'apikey',
    docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api'
  },

  // Google Gemini
  'gemini': {
    name: 'Google Gemini',
    provider: 'google',
    type: 'llm',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.0-pro': 'gemini-1.0-pro',
      'gemini-ultra': 'gemini-ultra'
    },
    authType: 'apikey',
    docs: 'https://ai.google.dev/docs'
  },

  // OpenRouter
  'openrouter': {
    name: 'OpenRouter',
    provider: 'openrouter',
    type: 'llm',
    baseURL: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      'healer-alpha': 'openrouter/healer-alpha',
      'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'gpt-4o': 'openai/gpt-4o',
      'gemini-pro': 'google/gemini-pro',
      'llama-3-70b': 'meta-llama/llama-3-70b-instruct',
      'mixtral-8x22b': 'mistralai/mixtral-8x22b-instruct'
    },
    authType: 'apikey',
    docs: 'https://openrouter.ai/docs'
  },

  // Cohere
  'cohere': {
    name: 'Cohere',
    provider: 'cohere',
    type: 'llm',
    baseURL: 'https://api.cohere.ai/v1/chat',
    models: {
      'command-r-plus': 'command-r-plus',
      'command-r': 'command-r',
      'command': 'command',
      'command-light': 'command-light'
    },
    authType: 'apikey',
    docs: 'https://docs.cohere.com/'
  },

  // Mistral
  'mistral': {
    name: 'Mistral AI',
    provider: 'mistral',
    type: 'llm',
    baseURL: 'https://api.mistral.ai/v1/chat/completions',
    models: {
      'mistral-large': 'mistral-large-latest',
      'mistral-medium': 'mistral-medium-latest',
      'mistral-small': 'mistral-small-latest',
      'mixtral-8x22b': 'open-mixtral-8x22b'
    },
    authType: 'apikey',
    docs: 'https://docs.mistral.ai/'
  }
};

// ==================== 图像生成模型（用于直接生成图片）====================

const IMAGE_GENERATION_MODELS = {
  // OpenAI DALL-E
  'dalle': {
    name: 'OpenAI DALL-E',
    provider: 'openai',
    type: 'image',
    baseURL: 'https://api.openai.com/v1/images/generations',
    models: {
      'dall-e-3': 'dall-e-3',
      'dall-e-2': 'dall-e-2'
    },
    authType: 'apikey',
    docs: 'https://platform.openai.com/docs/guides/images'
  },

  // 百度文心一格
  'ernie-image': {
    name: '百度文心一格',
    provider: 'baidu',
    type: 'image',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ernievilg/v1/txt2img',
    models: {
      'ernie-vilg': 'ernie-vilg'
    },
    authType: 'oauth',
    docs: 'https://ai.baidu.com/tech/creativity/ernie_vilg'
  },

  // 阿里通义万相
  'wanxiang': {
    name: '阿里通义万相',
    provider: 'aliyun',
    type: 'image',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    models: {
      'wanxiang-v1': 'wanx-v1',
      'wanxiang-plus': 'wanx-plus'
    },
    authType: 'apikey',
    docs: 'https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-wanxiang'
  },

  // 字节豆包·生图
  'doubao-image': {
    name: '字节豆包·生图',
    provider: 'volcengine',
    type: 'image',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
    models: {
      'doubao-image': 'doubao-image'
    },
    authType: 'apikey',
    docs: 'https://www.volcengine.com/product/doubao'
  },

  // Stability AI
  'stability': {
    name: 'Stability AI',
    provider: 'stability',
    type: 'image',
    baseURL: 'https://api.stability.ai/v1/generation',
    models: {
      'stable-diffusion-xl': 'stable-diffusion-xl-1024-v1-0',
      'stable-diffusion-3': 'stable-diffusion-v3-medium'
    },
    authType: 'apikey',
    docs: 'https://platform.stability.ai/docs/getting-started'
  }
};

// 所有 LLM 模型配置
const ALL_LLM_MODELS = {
  ...DOMESTIC_LLM_MODELS,
  ...INTERNATIONAL_LLM_MODELS
};

// 所有模型配置（LLM + 图像生成）
const ALL_MODELS = {
  ...ALL_LLM_MODELS,
  ...IMAGE_GENERATION_MODELS
};

// ==================== 工具函数 ====================

/**
 * 获取模型配置
 * @param {string} provider - 提供商名称
 * @returns {Object|null}
 */
function getModelConfig(provider) {
  return ALL_MODELS[provider] || null;
}

/**
 * 获取所有国内 LLM 模型
 * @returns {Object}
 */
function getDomesticModels() {
  return DOMESTIC_LLM_MODELS;
}

/**
 * 获取所有国外 LLM 模型
 * @returns {Object}
 */
function getInternationalModels() {
  return INTERNATIONAL_LLM_MODELS;
}

/**
 * 获取所有图像生成模型
 * @returns {Object}
 */
function getImageGenerationModels() {
  return IMAGE_GENERATION_MODELS;
}

/**
 * 获取所有可用模型列表
 * @param {string} type - 模型类型 ('llm' | 'image' | 'all')
 * @returns {Array}
 */
function getAllModelList(type = 'all') {
  let models = {};
  
  switch (type) {
    case 'llm':
      models = ALL_LLM_MODELS;
      break;
    case 'image':
      models = IMAGE_GENERATION_MODELS;
      break;
    default:
      models = ALL_MODELS;
  }
  
  const list = [];
  Object.entries(models).forEach(([key, config]) => {
    Object.entries(config.models).forEach(([modelKey, modelId]) => {
      list.push({
        provider: key,
        providerName: config.name,
        model: modelKey,
        modelId: modelId,
        type: config.type,
        region: DOMESTIC_LLM_MODELS[key] ? 'domestic' : (INTERNATIONAL_LLM_MODELS[key] ? 'international' : 'other'),
        baseURL: config.baseURL,
        authType: config.authType
      });
    });
  });
  
  return list;
}

/**
 * 根据模型ID获取配置
 * @param {string} modelId - 模型ID
 * @returns {Object|null}
 */
function getConfigByModelId(modelId) {
  for (const [provider, config] of Object.entries(ALL_MODELS)) {
    for (const [key, id] of Object.entries(config.models)) {
      if (id === modelId || key === modelId) {
        return {
          provider,
          providerName: config.name,
          model: key,
          modelId: id,
          type: config.type,
          baseURL: config.baseURL,
          authType: config.authType,
          region: DOMESTIC_LLM_MODELS[provider] ? 'domestic' : (INTERNATIONAL_LLM_MODELS[provider] ? 'international' : 'other')
        };
      }
    }
  }
  return null;
}

/**
 * 获取推荐模型（根据场景）
 * @param {string} scenario - 使用场景
 * @returns {Array}
 */
function getRecommendedModels(scenario = 'general') {
  const recommendations = {
    // UI 描述生成（本系统主要功能）
    'ui-generation': [
      { provider: 'openrouter', model: 'healer-alpha', reason: 'UI设计专用', type: 'llm' },
      { provider: 'claude', model: 'claude-3.5-sonnet', reason: 'JSON输出能力强', type: 'llm' },
      { provider: 'qwen', model: 'qwen-max', reason: '中文理解优秀', type: 'llm' },
      { provider: 'doubao', model: 'doubao-pro', reason: '字节出品，中文优化', type: 'llm' },
      { provider: 'deepseek', model: 'deepseek-chat', reason: '性价比高', type: 'llm' }
    ],
    // 代码生成
    'code-generation': [
      { provider: 'claude', model: 'claude-3.5-sonnet', reason: '代码能力出色', type: 'llm' },
      { provider: 'openai', model: 'gpt-4o', reason: '综合能力强', type: 'llm' },
      { provider: 'deepseek', model: 'deepseek-coder', reason: '专为代码优化', type: 'llm' }
    ],
    // 中文内容
    'chinese-content': [
      { provider: 'qwen', model: 'qwen-max', reason: '阿里出品，中文原生', type: 'llm' },
      { provider: 'doubao', model: 'doubao-pro', reason: '字节出品，中文优秀', type: 'llm' },
      { provider: 'kimi', model: 'kimi-latest', reason: '长文本处理强', type: 'llm' },
      { provider: 'chatglm', model: 'glm-4', reason: '清华出品，中文理解好', type: 'llm' }
    ],
    // 图像生成
    'image-generation': [
      { provider: 'dalle', model: 'dall-e-3', reason: 'OpenAI出品，质量高', type: 'image' },
      { provider: 'wanxiang', model: 'wanxiang-v1', reason: '阿里出品，中文理解好', type: 'image' },
      { provider: 'doubao-image', model: 'doubao-image', reason: '字节出品，速度快', type: 'image' },
      { provider: 'stability', model: 'stable-diffusion-xl', reason: '开源生态丰富', type: 'image' }
    ],
    // 通用场景
    'general': [
      { provider: 'openrouter', model: 'healer-alpha', reason: 'UI设计专用', type: 'llm' },
      { provider: 'qwen', model: 'qwen-max', reason: '中文友好', type: 'llm' },
      { provider: 'doubao', model: 'doubao-pro', reason: '字节出品', type: 'llm' },
      { provider: 'claude', model: 'claude-3.5-sonnet', reason: '综合能力最强', type: 'llm' }
    ]
  };
  
  return recommendations[scenario] || recommendations['general'];
}

/**
 * 创建环境变量配置模板
 * @returns {string}
 */
function generateEnvTemplate() {
  return `# AI 模型 API 密钥配置
# ==================== 国内大语言模型 ====================
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key
QWEN_API_KEY=your_qwen_api_key
CHATGLM_API_KEY=your_chatglm_api_key
SPARK_APP_ID=your_spark_app_id
SPARK_API_KEY=your_spark_api_key
SPARK_API_SECRET=your_spark_api_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
MINIMAX_API_KEY=your_minimax_api_key
DOUBAO_API_KEY=your_doubao_api_key
YI_API_KEY=your_yi_api_key
BAICHUAN_API_KEY=your_baichuan_api_key

# ==================== 国外大语言模型 ====================
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
COHERE_API_KEY=your_cohere_api_key
MISTRAL_API_KEY=your_mistral_api_key

# ==================== 图像生成模型 ====================
# OpenAI DALL-E
DALLE_API_KEY=your_dalle_api_key

# 阿里通义万相
WANXIANG_API_KEY=your_wanxiang_api_key

# 字节豆包生图
DOUBAO_IMAGE_API_KEY=your_doubao_image_api_key

# Stability AI
STABILITY_API_KEY=your_stability_api_key

# ==================== 默认配置 ====================
DEFAULT_AI_PROVIDER=openrouter
DEFAULT_MODEL=openrouter/healer-alpha
`;
}

/**
 * 验证 API 密钥格式
 * @param {string} provider - 提供商
 * @param {string} apiKey - API 密钥
 * @returns {boolean}
 */
function validateApiKey(provider, apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // 简单的格式验证
  const patterns = {
    'openai': /^sk-[a-zA-Z0-9]{32,}$/,
    'anthropic': /^sk-ant-[a-zA-Z0-9_-]{32,}$/,
    'google': /^AIza[0-9A-Za-z_-]{35}$/,
    'openrouter': /^sk-or-[a-zA-Z0-9]{32,}$/,
    'qwen': /^sk-[a-z0-9]{32,}$/,
    'deepseek': /^sk-[a-z0-9]{32,}$/,
    'kimi': /^sk-[a-zA-Z0-9]{32,}$/,
    'doubao': /^[a-zA-Z0-9-]{20,}$/
  };
  
  const pattern = patterns[provider];
  if (pattern) {
    return pattern.test(apiKey);
  }
  
  // 默认验证：至少 10 个字符
  return apiKey.length >= 10;
}

module.exports = {
  // 模型配置
  DOMESTIC_LLM_MODELS,
  INTERNATIONAL_LLM_MODELS,
  IMAGE_GENERATION_MODELS,
  ALL_LLM_MODELS,
  ALL_MODELS,
  
  // 工具函数
  getModelConfig,
  getDomesticModels,
  getInternationalModels,
  getImageGenerationModels,
  getAllModelList,
  getConfigByModelId,
  getRecommendedModels,
  generateEnvTemplate,
  validateApiKey
};
