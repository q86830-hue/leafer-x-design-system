/**
 * LeaferJS UI 渲染模块 (Node.js 版本) - 修复版
 * 基于 @leafer-ui/node 的高性能 UI 渲染引擎
 */

// 从当前项目的 node_modules 加载依赖
const { Leafer, Rect, Ellipse, Line, Polygon, Star, Path, Text, Image, Group, useCanvas } = require('@leafer-ui/node');
const skia = require('skia-canvas');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 初始化 Canvas 环境
console.log('[LeaferRenderer] Initializing canvas environment...');
try {
  useCanvas('skia', skia);
  console.log('[LeaferRenderer] Canvas environment initialized successfully');
} catch (error) {
  console.error('[LeaferRenderer] Failed to initialize canvas:', error);
  throw error;
}

// 加载中文字体 - 使用跨平台字体配置
const { FontLibrary } = skia;
const fontConfig = require('./font-config');

console.log('[LeaferRenderer] Loading fonts...');
console.log(`[LeaferRenderer] Platform: ${fontConfig.getPlatform()}`);

try {
  // 使用跨平台字体配置加载字体
  const loadedFonts = fontConfig.loadFonts(FontLibrary);
  
  if (loadedFonts.length === 0) {
    console.warn('[LeaferRenderer] ⚠️ No fonts loaded, using fallback');
    global.CHINESE_FONT_FAMILIES = ['Arial'];
  } else {
    global.CHINESE_FONT_FAMILIES = loadedFonts;
    console.log(`[LeaferRenderer] ✅ Total fonts loaded: ${loadedFonts.length}`);
  }
} catch (error) {
  console.warn('[LeaferRenderer] ⚠️ Font loading failed:', error.message);
  global.CHINESE_FONT_FAMILIES = ['Arial'];
}

class LeaferRenderer {
  constructor(options = {}) {
    console.log('[LeaferRenderer] Initializing with options:', JSON.stringify(options, null, 2));
    this.options = {
      pixelRatio: options.pixelRatio || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      ...options,
    };
    this.renderCache = new Map();
    this.maxCacheSize = options.maxCacheSize || 100;
    this.outputDir = options.outputDir || path.join(__dirname, 'output');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    console.log('[LeaferRenderer] Initialized successfully');
  }

  /**
   * 渲染 UI 元素 - 修复版
   */
  async render(config) {
    console.log('[LeaferRenderer] Starting render with config:', {
      width: config.width,
      height: config.height,
      elementCount: config.elements?.length,
    });

    let { elements, width, height, options = {} } = config;
    
    const pixelRatio = options.pixelRatio || this.options.pixelRatio;
    const backgroundColor = options.backgroundColor || this.options.backgroundColor;
    
    // 转换元素格式
    elements = elements.map(el => {
      if (el.style && typeof el.style === 'object') {
        const { style, ...rest } = el;
        return { ...rest, ...style };
      }
      return el;
    });

    // 检查缓存
    const cacheKey = this.generateCacheKey(config);
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[LeaferRenderer] Cache hit for key:', cacheKey);
      return {
        url: cached,
        width,
        height,
        format: options.format || 'png',
        pixelRatio,
        cacheKey,
        cached: true,
      };
    }

    let leafer = null;
    try {
      // 创建 Leafer 引擎
      console.log('[LeaferRenderer] Creating Leafer instance...');
      leafer = new Leafer({
        width,
        height,
        pixelRatio,
        fill: backgroundColor,
      });
      console.log('[LeaferRenderer] Leafer instance created');

      // 等待引擎准备就绪
      console.log('[LeaferRenderer] Waiting for Leafer ready...');
      await this.waitReady(leafer);
      console.log('[LeaferRenderer] Leafer is ready');

      // 渲染所有元素
      console.log('[LeaferRenderer] Rendering elements:', elements.length);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        console.log(`[LeaferRenderer] Creating element ${i + 1}/${elements.length}: type=${element.type}`);
        try {
          const leaferElement = this.createElement(element);
          if (leaferElement) {
            console.log(`[LeaferRenderer] Adding element ${i + 1} to leafer`);
            leafer.add(leaferElement);
            console.log(`[LeaferRenderer] Element ${i + 1} added successfully`);
          } else {
            console.warn(`[LeaferRenderer] Element ${i + 1} creation returned null`);
          }
        } catch (elementError) {
          console.error(`[LeaferRenderer] Error creating element ${i + 1}:`, elementError);
        }
      }

      // 关键修复：等待渲染完成
      console.log('[LeaferRenderer] Waiting for render to complete...');
      await this.waitForRender(leafer);
      console.log('[LeaferRenderer] Render completed');

      // 导出图片
      const format = options.format || 'png';
      console.log('[LeaferRenderer] Exporting image in format:', format);
      
      // 获取 Leafer 的 canvas 对象
      const leaferCanvas = leafer.canvas;
      console.log('[LeaferRenderer] Leafer canvas exists:', !!leaferCanvas);
      
      let imageBuffer;
      if (leaferCanvas && leaferCanvas.view) {
        console.log('[LeaferRenderer] Canvas size:', leaferCanvas.view.width, 'x', leaferCanvas.view.height);
        
        // 关键修复：确保渲染完成后再导出
        try {
          imageBuffer = await leaferCanvas.view.toBuffer(`image/${format}`);
          console.log('[LeaferRenderer] Image buffer created, size:', imageBuffer?.length);
        } catch (bufferError) {
          console.error('[LeaferRenderer] toBuffer failed:', bufferError);
          throw bufferError;
        }
      } else {
        throw new Error('Export failed: canvas not available');
      }
      
      // 保存图片
      const filename = `ui-${uuidv4()}.${format}`;
      const filePath = path.join(this.outputDir, filename);
      console.log('[LeaferRenderer] Saving image to:', filePath);
      fs.writeFileSync(filePath, imageBuffer);
      console.log('[LeaferRenderer] Image saved successfully');
      
      // 缓存结果
      const base64Data = imageBuffer.toString('base64');
      this.setCache(cacheKey, base64Data);

      const result = {
        url: `/output/${filename}`,
        base64: `data:image/${format};base64,${base64Data}`,
        width,
        height,
        format,
        pixelRatio,
        cacheKey,
        cached: false,
      };
      console.log('[LeaferRenderer] Render completed successfully');
      return result;
    } catch (error) {
      console.error('[LeaferRenderer] Render error:', error);
      console.error('[LeaferRenderer] Stack trace:', error.stack);
      throw error;
    } finally {
      // 销毁引擎释放资源
      if (leafer) {
        console.log('[LeaferRenderer] Destroying leafer instance...');
        try {
          leafer.destroy();
          console.log('[LeaferRenderer] Leafer destroyed');
        } catch (destroyError) {
          console.error('[LeaferRenderer] Error destroying leafer:', destroyError);
        }
      }
    }
  }

  /**
   * 等待引擎准备就绪
   */
  waitReady(leafer) {
    return new Promise((resolve) => {
      if (leafer.ready) {
        console.log('[LeaferRenderer] Leafer already ready');
        resolve();
      } else {
        console.log('[LeaferRenderer] Waiting for ready event...');
        leafer.once('ready', () => {
          console.log('[LeaferRenderer] Ready event received');
          resolve();
        });
        setTimeout(() => {
          console.log('[LeaferRenderer] Ready timeout, proceeding anyway');
          resolve();
        }, 2000);
      }
    });
  }

  /**
   * 关键修复：等待渲染完成
   */
  waitForRender(leafer) {
    return new Promise((resolve) => {
      if (leafer.viewReady) {
        console.log('[LeaferRenderer] View already ready');
        setTimeout(resolve, 100);
      } else {
        console.log('[LeaferRenderer] Waiting for view.ready event...');
        leafer.once('view.ready', () => {
          console.log('[LeaferRenderer] View ready event received');
          setTimeout(resolve, 100);
        });
        setTimeout(() => {
          console.log('[LeaferRenderer] View ready timeout, proceeding anyway');
          resolve();
        }, 3000);
      }
    });
  }

  /**
   * 创建 Leafer 元素
   */
  createElement(config) {
    const { type, ...props } = config;
    console.log(`[LeaferRenderer] createElement called for type: ${type}`);

    try {
      switch (type) {
        case 'rect':
          return this.createRect(props);
        case 'ellipse':
        case 'circle':
          return this.createEllipse(props);
        case 'line':
          return this.createLine(props);
        case 'polygon':
          return this.createPolygon(props);
        case 'star':
          return this.createStar(props);
        case 'text':
          return this.createText(props);
        case 'image':
          return this.createImage(props);
        default:
          console.warn(`[LeaferRenderer] Unknown element type: ${type}`);
          return null;
      }
    } catch (error) {
      console.error(`[LeaferRenderer] Error in createElement for type ${type}:`, error);
      throw error;
    }
  }

  /**
   * 创建矩形
   */
  createRect(props) {
    console.log('[LeaferRenderer] Creating rect:', { x: props.x, y: props.y, width: props.width, height: props.height, fill: props.fill });
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      fill,
      stroke,
      strokeWidth = 1,
      cornerRadius = 0,
      opacity = 1,
      shadow,
    } = props;

    const rectConfig = {
      x,
      y,
      width,
      height,
      fill: this.parseFill(fill),
      stroke,
      strokeWidth,
      cornerRadius,
      opacity,
    };

    const rect = new Rect(rectConfig);

    if (shadow) {
      rect.shadow = this.parseShadow(shadow);
    }

    return rect;
  }

  /**
   * 创建椭圆/圆形
   */
  createEllipse(props) {
    console.log('[LeaferRenderer] Creating ellipse:', { x: props.x, y: props.y, width: props.width, height: props.height });
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      fill,
      stroke,
      strokeWidth = 1,
      startAngle,
      endAngle,
      innerRadius,
      opacity = 1,
    } = props;

    const config = {
      x,
      y,
      width,
      height,
      fill: this.parseFill(fill),
      stroke,
      strokeWidth,
      opacity,
    };

    if (startAngle !== undefined) config.startAngle = startAngle;
    if (endAngle !== undefined) config.endAngle = endAngle;
    if (innerRadius !== undefined) config.innerRadius = innerRadius;

    return new Ellipse(config);
  }

  /**
   * 创建线条
   */
  createLine(props) {
    console.log('[LeaferRenderer] Creating line');
    const {
      x = 0,
      y = 0,
      width,
      points,
      toPoint,
      rotation = 0,
      stroke = '#000000',
      strokeWidth = 1,
      dashPattern,
      curve,
      cornerRadius,
      closed = false,
      opacity = 1,
    } = props;

    const config = {
      x,
      y,
      stroke,
      strokeWidth,
      rotation,
      closed,
      opacity,
    };

    if (width !== undefined) config.width = width;
    if (points !== undefined) config.points = points;
    if (toPoint !== undefined) config.toPoint = toPoint;
    if (dashPattern !== undefined) config.dashPattern = dashPattern;
    if (curve !== undefined) config.curve = curve;
    if (cornerRadius !== undefined) config.cornerRadius = cornerRadius;

    return new Line(config);
  }

  /**
   * 创建多边形
   */
  createPolygon(props) {
    console.log('[LeaferRenderer] Creating polygon');
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      sides = 6,
      fill,
      stroke,
      strokeWidth = 1,
      cornerRadius = 0,
      opacity = 1,
    } = props;

    return new Polygon({
      x,
      y,
      width,
      height,
      sides,
      fill: this.parseFill(fill),
      stroke,
      strokeWidth,
      cornerRadius,
      opacity,
    });
  }

  /**
   * 创建星形
   */
  createStar(props) {
    console.log('[LeaferRenderer] Creating star');
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      corners = 5,
      innerRadius = 0.5,
      fill,
      stroke,
      strokeWidth = 1,
      cornerRadius = 0,
      opacity = 1,
    } = props;

    return new Star({
      x,
      y,
      width,
      height,
      corners,
      innerRadius,
      fill: this.parseFill(fill),
      stroke,
      strokeWidth,
      cornerRadius,
      opacity,
    });
  }

  /**
   * 创建文本
   */
  createText(props) {
    console.log('[LeaferRenderer] Creating text:', { text: props.text, x: props.x, y: props.y });
    const {
      x = 0,
      y = 0,
      text = '',
      fill = '#000000',
      fontSize = 16,
      fontFamily,
      fontWeight = 'normal',
      textAlign = 'left',
      lineHeight,
      opacity = 1,
    } = props;

    const chineseFonts = global.CHINESE_FONT_FAMILIES || ['Arial'];
    const finalFontFamily = fontFamily || chineseFonts[0];
    
    const config = {
      x,
      y,
      text: String(text),
      fill,
      fontSize,
      fontFamily: finalFontFamily,
      fontWeight,
      textAlign,
      lineHeight,
      opacity,
    };

    return new Text(config);
  }

  /**
   * 创建图片
   */
  createImage(props) {
    console.log('[LeaferRenderer] Creating image');
    const {
      x = 0,
      y = 0,
      width,
      height,
      url,
      src,
      opacity = 1,
      cornerRadius = 0,
    } = props;

    const imageUrl = url || src;
    if (!imageUrl) {
      console.warn('[LeaferRenderer] No image URL provided');
      return null;
    }

    const config = {
      x,
      y,
      url: imageUrl,
      opacity,
      cornerRadius,
    };
    
    if (width !== undefined) config.width = width;
    if (height !== undefined) config.height = height;
    
    return new Image(config);
  }

  /**
   * 解析填充样式
   */
  parseFill(fill) {
    if (!fill) return undefined;
    
    if (typeof fill === 'string') {
      return fill;
    }

    if (typeof fill === 'object') {
      const { type, ...props } = fill;
      
      switch (type) {
        case 'linear':
          return {
            type: 'linear',
            from: props.from || 'top',
            to: props.to || 'bottom',
            stops: props.stops || ['#000000', '#ffffff'],
          };
        case 'radial':
          return {
            type: 'radial',
            from: props.from || 'center',
            to: props.to || 'bottom',
            stops: props.stops || ['#000000', '#ffffff'],
          };
        default:
          return fill;
      }
    }

    return fill;
  }

  /**
   * 解析阴影
   */
  parseShadow(shadow) {
    if (!shadow) return undefined;
    
    return {
      x: shadow.x || 0,
      y: shadow.y || 0,
      blur: shadow.blur || 0,
      color: shadow.color || '#000000',
    };
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(config) {
    const { elements, width, height, options } = config;
    const str = JSON.stringify({ elements, width, height, options });
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * 设置缓存
   */
  setCache(key, value) {
    if (this.renderCache.size >= this.maxCacheSize) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }
    this.renderCache.set(key, value);
  }

  /**
   * 获取缓存
   */
  getCache(key) {
    const value = this.renderCache.get(key);
    if (value) {
      this.renderCache.delete(key);
      this.renderCache.set(key, value);
    }
    return value || null;
  }

  /**
   * 批量渲染
   */
  async batchRender(configs, options = {}) {
    const { concurrency = 5 } = options;
    const results = [];

    for (let i = 0; i < configs.length; i += concurrency) {
      const batch = configs.slice(i, i + concurrency);
      const promises = batch.map(async (config) => {
        try {
          const result = await this.render(config);
          return { success: true, data: result };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }
}

module.exports = LeaferRenderer;
