/**
 * Leafer Design System - 主入口文件
 * 
 * 提供设计系统生成和渲染功能
 */

const { DesignSystemProGenerator, ThemeConfig, AdvancedComponentGenerator, ResponsiveTemplateGenerator } = require('./leafer-design-system-pro');
const { LeaferRendererV2: LeaferRenderer } = require('./leafer-renderer-v2');

/**
 * 创建设计系统生成器
 * @param {Object} options - 配置选项
 * @param {string} options.name - 设计系统名称
 * @param {string} options.primaryColor - 主色调
 * @param {string} options.secondaryColor - 次色调
 * @param {string} options.mode - 主题模式 (light/dark)
 * @returns {DesignSystemProGenerator}
 */
function createGenerator(options = {}) {
  return new DesignSystemProGenerator(options);
}

/**
 * 创建渲染器
 * @param {Object} options - 渲染器配置
 * @returns {LeaferRenderer}
 */
function createRenderer(options = {}) {
  return new LeaferRenderer(options);
}

/**
 * 快速生成设计系统
 * @param {Object} options - 生成选项
 * @param {string} outputDir - 输出目录
 * @returns {Object} 生成的设计系统
 */
function generateDesignSystem(options = {}, outputDir = './my-design-system') {
  const generator = createGenerator(options);
  return generator.export(outputDir);
}

/**
 * 渲染模板为图片
 * @param {Object} template - 模板数据
 * @param {Object} options - 渲染选项
 * @returns {Promise<Object>} 渲染结果
 */
async function renderTemplate(template, options = {}) {
  const renderer = createRenderer({
    outputDir: options.outputDir || './output'
  });
  
  return await renderer.render({
    width: template.width,
    height: template.height,
    elements: template.elements,
    options: {
      format: options.format || 'png',
      quality: options.quality || 0.95,
      pixelRatio: options.pixelRatio || 2,
      backgroundColor: template.backgroundColor || '#ffffff'
    }
  });
}

/**
 * 批量渲染模板
 * @param {Array<Object>} templates - 模板数组
 * @param {Object} options - 渲染选项
 * @returns {Promise<Array<Object>>} 渲染结果数组
 */
async function renderTemplates(templates, options = {}) {
  const renderer = createRenderer({
    outputDir: options.outputDir || './output'
  });
  
  const results = [];
  for (const template of templates) {
    try {
      const result = await renderTemplate(template, options);
      results.push({ success: true, template: template.name || 'unnamed', result });
    } catch (error) {
      results.push({ success: false, template: template.name || 'unnamed', error: error.message });
    }
  }
  
  return results;
}

// 导出所有模块
module.exports = {
  // 核心类
  DesignSystemProGenerator,
  ThemeConfig,
  AdvancedComponentGenerator,
  ResponsiveTemplateGenerator,
  LeaferRenderer,
  
  // 便捷函数
  createGenerator,
  createRenderer,
  generateDesignSystem,
  renderTemplate,
  renderTemplates
};
