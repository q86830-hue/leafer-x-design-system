/**
 * leafer-x-design-system
 * 
 * LeaferJS 设计系统生成器插件
 * 基于 LeaferJS 的高保真 UI 设计系统生成器
 * 
 * @name leafer-x-design-system
 * @version 2.0.0
 * @author Leafer Design System Team
 * @license MIT
 * @description 基于 LeaferJS 的高保真 UI 设计系统生成器，支持响应式设计、暗黑模式、丰富的组件库
 * 
 * 命名规范: leafer-x-插件名
 * 全局变量名: LeaferX.DesignSystem
 */

const { DesignSystemProGenerator, ThemeConfig, AdvancedComponentGenerator, ResponsiveTemplateGenerator } = require('./leafer-design-system-pro');
const { LeaferRendererV2: LeaferRenderer } = require('./leafer-renderer-v2');

/**
 * LeaferX 设计系统插件
 */
class LeaferXDesignSystem {
  constructor() {
    this.name = 'DesignSystem';
    this.version = '2.0.0';
    this.description = '高保真 UI 设计系统生成器';
  }

  /**
   * 创建设计系统生成器
   * @param {Object} options - 配置选项
   * @returns {DesignSystemProGenerator}
   */
  createGenerator(options = {}) {
    return new DesignSystemProGenerator(options);
  }

  /**
   * 创建渲染器
   * @param {Object} options - 渲染器配置
   * @returns {LeaferRenderer}
   */
  createRenderer(options = {}) {
    return new LeaferRenderer(options);
  }

  /**
   * 快速生成设计系统
   * @param {Object} options - 生成选项
   * @param {string} outputDir - 输出目录
   * @returns {Object} 生成的设计系统
   */
  generate(options = {}, outputDir = './my-design-system') {
    const generator = this.createGenerator(options);
    return generator.export(outputDir);
  }

  /**
   * 渲染模板为图片
   * @param {Object} template - 模板数据
   * @param {Object} options - 渲染选项
   * @returns {Promise<Object>} 渲染结果
   */
  async render(template, options = {}) {
    const renderer = this.createRenderer({
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
  async renderBatch(templates, options = {}) {
    const renderer = this.createRenderer({
      outputDir: options.outputDir || './output'
    });

    const results = [];
    for (const template of templates) {
      try {
        const result = await this.render(template, options);
        results.push({ success: true, template: template.name || 'unnamed', result });
      } catch (error) {
        results.push({ success: false, template: template.name || 'unnamed', error: error.message });
      }
    }

    return results;
  }

  /**
   * 获取插件信息
   * @returns {Object}
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      author: 'Leafer Design System Team',
      license: 'MIT',
      homepage: 'https://github.com/yourusername/leafer-x-design-system'
    };
  }
}

// 注册到 LeaferX 命名空间
if (typeof window !== 'undefined') {
  window.LeaferX = window.LeaferX || {};
  window.LeaferX.DesignSystem = LeaferXDesignSystem;
}

// 导出模块
module.exports = LeaferXDesignSystem;

// 同时导出所有子模块
module.exports.DesignSystemProGenerator = DesignSystemProGenerator;
module.exports.ThemeConfig = ThemeConfig;
module.exports.AdvancedComponentGenerator = AdvancedComponentGenerator;
module.exports.ResponsiveTemplateGenerator = ResponsiveTemplateGenerator;
module.exports.LeaferRenderer = LeaferRenderer;

// 默认导出
module.exports.default = LeaferXDesignSystem;
