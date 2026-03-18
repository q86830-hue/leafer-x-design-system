/**
 * LeaferJS UI 渲染模块 V2 - 基于深度学习的优化版本
 * 
 * 基于 @leafer-ui/node 的高性能 UI 渲染引擎
 * 全面支持 LeaferJS 的所有核心功能
 * 
 * 新增功能：
 * - 完整的样式系统（渐变、阴影、内阴影）
 * - 高级定位（origin, around, zIndex）
 * - 描边样式（strokeAlign, strokeCap, strokeJoin, dashPattern）
 * - 遮罩和擦除功能
 * - 混合模式
 * - 更好的错误处理
 */

// 从当前项目的 node_modules 加载依赖
const { 
  Leafer, Rect, Ellipse, Line, Polygon, Star, Path, Text, Image, 
  Group, Box, Frame, Pen, useCanvas 
} = require('@leafer-ui/node');
const skia = require('skia-canvas');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 初始化 Canvas 环境
console.log('[LeaferRenderer V2] Initializing canvas environment...');
try {
  useCanvas('skia', skia);
  console.log('[LeaferRenderer V2] ✅ Canvas environment initialized');
} catch (error) {
  console.error('[LeaferRenderer V2] ❌ Failed to initialize canvas:', error);
  throw error;
}

// 加载中文字体 - 使用跨平台字体配置
const { FontLibrary } = skia;
const fontConfig = require('./font-config');

console.log('[LeaferRenderer V2] Loading fonts...');
console.log(`[LeaferRenderer V2] Platform: ${fontConfig.getPlatform()}`);

let loadedFonts = [];

try {
  // 使用跨平台字体配置加载字体
  loadedFonts = fontConfig.loadFonts(FontLibrary);
  
  if (loadedFonts.length === 0) {
    console.warn('[LeaferRenderer V2] ⚠️ No fonts loaded, using fallback');
    loadedFonts = ['Arial'];
  }
  
  global.CHINESE_FONT_FAMILIES = loadedFonts;
  console.log(`[LeaferRenderer V2] ✅ Total fonts loaded: ${loadedFonts.length}`);
} catch (error) {
  console.warn('[LeaferRenderer V2] ⚠️ Font loading failed:', error.message);
  global.CHINESE_FONT_FAMILIES = ['Arial'];
}

class LeaferRendererV2 {
  constructor(options = {}) {
    console.log('[LeaferRenderer V2] Initializing...');
    this.options = {
      pixelRatio: options.pixelRatio || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      maxCacheSize: options.maxCacheSize || 100,
      ...options,
    };
    this.renderCache = new Map();
    this.outputDir = options.outputDir || path.join(__dirname, 'output');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    this.stats = {
      totalRenders: 0,
      cachedRenders: 0,
      errors: 0
    };
    
    console.log('[LeaferRenderer V2] ✅ Initialized successfully');
    console.log(`[LeaferRenderer V2] 📁 Output directory: ${this.outputDir}`);
    console.log(`[LeaferRenderer V2] 🔤 Available fonts: ${global.CHINESE_FONT_FAMILIES.join(', ')}`);
  }

  /**
   * 渲染 UI 元素 - V2 版本
   */
  async render(config) {
    const startTime = Date.now();
    console.log('[LeaferRenderer V2] 🎨 Starting render...');
    
    let { elements, width, height, options = {} } = config;
    
    const pixelRatio = options.pixelRatio || this.options.pixelRatio;
    const backgroundColor = options.backgroundColor || this.options.backgroundColor;
    
    // 标准化元素格式
    elements = this.normalizeElements(elements);
    
    // 检查缓存
    const cacheKey = this.generateCacheKey({ elements, width, height, options });
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[LeaferRenderer V2] 💾 Cache hit!');
      this.stats.cachedRenders++;
      return {
        url: cached.url,
        base64: cached.base64,
        width,
        height,
        format: options.format || 'png',
        pixelRatio,
        cacheKey,
        cached: true,
        renderTime: Date.now() - startTime
      };
    }

    let leafer = null;
    try {
      // 创建 Leafer 引擎
      leafer = new Leafer({
        width,
        height,
        pixelRatio,
        fill: backgroundColor,
      });

      // 等待引擎准备就绪
      await this.waitReady(leafer);

      // 渲染所有元素
      console.log(`[LeaferRenderer V2] 📦 Rendering ${elements.length} elements...`);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        try {
          const leaferElement = this.createElement(element);
          if (leaferElement) {
            leafer.add(leaferElement);
          }
        } catch (elementError) {
          console.error(`[LeaferRenderer V2] ❌ Error creating element ${i}:`, elementError.message);
        }
      }

      // 等待渲染完成
      await this.waitForRender(leafer);

      // 导出图片
      const format = options.format || 'png';
      const imageBuffer = await this.exportImage(leafer, format);
      
      // 保存图片
      const filename = `ui-${uuidv4()}.${format}`;
      const filePath = path.join(this.outputDir, filename);
      fs.writeFileSync(filePath, imageBuffer);
      
      // 生成 base64
      const base64Data = imageBuffer.toString('base64');
      const result = {
        url: `/output/${filename}`,
        base64: `data:image/${format};base64,${base64Data}`,
        width,
        height,
        format,
        pixelRatio,
        cacheKey,
        cached: false,
        renderTime: Date.now() - startTime
      };
      
      // 缓存结果
      this.setCache(cacheKey, result);
      this.stats.totalRenders++;
      
      console.log(`[LeaferRenderer V2] ✅ Render completed in ${result.renderTime}ms`);
      return result;
      
    } catch (error) {
      this.stats.errors++;
      console.error('[LeaferRenderer V2] ❌ Render error:', error);
      throw error;
    } finally {
      if (leafer) {
        try {
          leafer.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
      }
    }
  }

  /**
   * 标准化元素格式
   */
  normalizeElements(elements) {
    return elements.map(el => {
      // 处理 style 对象
      if (el.style && typeof el.style === 'object') {
        const { style, ...rest } = el;
        return { ...rest, ...style };
      }
      return el;
    });
  }

  /**
   * 等待引擎准备就绪
   */
  waitReady(leafer) {
    return new Promise((resolve) => {
      if (leafer.ready) {
        resolve();
      } else {
        leafer.once('ready', resolve);
        setTimeout(resolve, 2000);
      }
    });
  }

  /**
   * 等待渲染完成
   */
  waitForRender(leafer) {
    return new Promise((resolve) => {
      if (leafer.viewReady) {
        setTimeout(resolve, 100);
      } else {
        leafer.once('view.ready', () => setTimeout(resolve, 100));
        setTimeout(resolve, 3000);
      }
    });
  }

  /**
   * 导出图片
   */
  async exportImage(leafer, format) {
    const leaferCanvas = leafer.canvas;
    if (!leaferCanvas || !leaferCanvas.view) {
      throw new Error('Canvas not available');
    }
    return await leaferCanvas.view.toBuffer(`image/${format}`);
  }

  /**
   * 创建元素 - 支持所有 LeaferJS 元素类型
   */
  createElement(config) {
    const { type, tag, ...props } = config;
    const elementType = type || tag;
    
    if (!elementType) {
      console.warn('[LeaferRenderer V2] ⚠️ Element missing type/tag');
      return null;
    }

    try {
      switch (elementType.toLowerCase()) {
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
        case 'path':
          return this.createPath(props);
        case 'pen':
          return this.createPen(props);
        case 'text':
          return this.createText(props);
        case 'image':
          return this.createImage(props);
        case 'group':
          return this.createGroup(props);
        case 'box':
          return this.createBox(props);
        case 'frame':
          return this.createFrame(props);
        default:
          console.warn(`[LeaferRenderer V2] ⚠️ Unknown element type: ${elementType}`);
          return null;
      }
    } catch (error) {
      console.error(`[LeaferRenderer V2] ❌ Error creating ${elementType}:`, error.message);
      return null;
    }
  }

  /**
   * 创建矩形 - 完整样式支持
   */
  createRect(props) {
    const config = this.buildBaseConfig(props);
    
    // 矩形特有属性
    if (props.cornerRadius !== undefined) {
      config.cornerRadius = props.cornerRadius;
    }
    
    return new Rect(config);
  }

  /**
   * 创建椭圆/圆形 - 支持扇形、圆环
   */
  createEllipse(props) {
    const config = this.buildBaseConfig(props);
    
    // 椭圆特有属性
    if (props.startAngle !== undefined) config.startAngle = props.startAngle;
    if (props.endAngle !== undefined) config.endAngle = props.endAngle;
    if (props.innerRadius !== undefined) config.innerRadius = props.innerRadius;
    
    return new Ellipse(config);
  }

  /**
   * 创建线条 - 支持虚线、曲线
   */
  createLine(props) {
    const config = this.buildStrokeConfig(props);
    
    // 线条特有属性
    if (props.points !== undefined) config.points = props.points;
    if (props.toPoint !== undefined) config.toPoint = props.toPoint;
    if (props.curve !== undefined) config.curve = props.curve;
    if (props.closed !== undefined) config.closed = props.closed;
    
    return new Line(config);
  }

  /**
   * 创建多边形
   */
  createPolygon(props) {
    const config = this.buildBaseConfig(props);
    
    if (props.sides !== undefined) config.sides = props.sides;
    
    return new Polygon(config);
  }

  /**
   * 创建星形
   */
  createStar(props) {
    const config = this.buildBaseConfig(props);
    
    if (props.corners !== undefined) config.corners = props.corners;
    if (props.innerRadius !== undefined) config.innerRadius = props.innerRadius;
    
    return new Star(config);
  }

  /**
   * 创建路径
   */
  createPath(props) {
    const config = this.buildBaseConfig(props);
    
    if (props.path) {
      config.path = props.path;
    }
    
    return new Path(config);
  }

  /**
   * 创建画笔
   */
  createPen(props) {
    const pen = new Pen();
    
    if (props.commands && Array.isArray(props.commands)) {
      for (const cmd of props.commands) {
        this.executePenCommand(pen, cmd);
      }
    }
    
    return pen;
  }

  /**
   * 执行画笔命令
   */
  executePenCommand(pen, cmd) {
    if (!cmd.method) return;
    
    switch (cmd.method) {
      case 'setStyle':
        pen.setStyle(cmd.style || {});
        break;
      case 'moveTo':
        pen.moveTo(cmd.x, cmd.y);
        break;
      case 'lineTo':
        pen.lineTo(cmd.x, cmd.y);
        break;
      case 'arc':
        pen.arc(cmd.x, cmd.y, cmd.radius, cmd.startAngle, cmd.endAngle);
        break;
      case 'roundRect':
        pen.roundRect(cmd.x, cmd.y, cmd.width, cmd.height, cmd.radius);
        break;
      case 'ellipse':
        pen.ellipse(cmd.x, cmd.y, cmd.radiusX, cmd.radiusY);
        break;
      case 'closePath':
        pen.closePath();
        break;
    }
  }

  /**
   * 创建文本 - 完整字体支持
   */
  createText(props) {
    const config = {
      x: props.x || 0,
      y: props.y || 0,
      text: String(props.text || ''),
      fill: props.fill || '#000000',
      fontSize: props.fontSize || 16,
      fontWeight: props.fontWeight || 'normal',
      textAlign: props.textAlign || 'left',
      opacity: props.opacity !== undefined ? props.opacity : 1,
    };
    
    // 字体处理
    const fontFamily = props.fontFamily || global.CHINESE_FONT_FAMILIES[0];
    config.fontFamily = fontFamily;
    
    if (props.lineHeight !== undefined) config.lineHeight = props.lineHeight;
    if (props.letterSpacing !== undefined) config.letterSpacing = props.letterSpacing;
    
    return new Text(config);
  }

  /**
   * 创建图片
   */
  createImage(props) {
    const url = props.url || props.src;
    if (!url) {
      console.warn('[LeaferRenderer V2] ⚠️ Image element missing url/src, skipping');
      return null;
    }
    
    const config = {
      x: props.x || 0,
      y: props.y || 0,
      url: url,
      opacity: props.opacity !== undefined ? props.opacity : 1,
    };
    
    if (props.width !== undefined) config.width = props.width;
    if (props.height !== undefined) config.height = props.height;
    if (props.cornerRadius !== undefined) config.cornerRadius = props.cornerRadius;
    
    return new Image(config);
  }

  /**
   * 创建组
   */
  createGroup(props) {
    const config = {
      x: props.x || 0,
      y: props.y || 0,
    };
    
    if (props.opacity !== undefined) config.opacity = props.opacity;
    
    const group = new Group(config);
    
    // 添加子元素
    if (props.children && Array.isArray(props.children)) {
      for (const childConfig of props.children) {
        const child = this.createElement(childConfig);
        if (child) {
          group.add(child);
        }
      }
    }
    
    return group;
  }

  /**
   * 创建盒子（带样式的组）
   */
  createBox(props) {
    const config = this.buildBaseConfig(props);
    
    const box = new Box(config);
    
    // 添加子元素
    if (props.children && Array.isArray(props.children)) {
      for (const childConfig of props.children) {
        const child = this.createElement(childConfig);
        if (child) {
          box.add(child);
        }
      }
    }
    
    return box;
  }

  /**
   * 创建画板
   */
  createFrame(props) {
    const config = {
      width: props.width || 100,
      height: props.height || 100,
    };
    
    if (props.x !== undefined) config.x = props.x;
    if (props.y !== undefined) config.y = props.y;
    if (props.fill !== undefined) config.fill = props.fill;
    
    const frame = new Frame(config);
    
    // 添加子元素
    if (props.children && Array.isArray(props.children)) {
      for (const childConfig of props.children) {
        const child = this.createElement(childConfig);
        if (child) {
          frame.add(child);
        }
      }
    }
    
    return frame;
  }

  /**
   * 构建基础配置 - 包含所有通用样式
   */
  buildBaseConfig(props) {
    const config = {
      x: props.x || 0,
      y: props.y || 0,
      width: props.width !== undefined ? props.width : 100,
      height: props.height !== undefined ? props.height : 100,
    };
    
    // 填充
    if (props.fill !== undefined) {
      config.fill = this.parseFill(props.fill);
    }
    
    // 描边
    if (props.stroke !== undefined) {
      config.stroke = this.parseFill(props.stroke);
    }
    if (props.strokeWidth !== undefined) config.strokeWidth = props.strokeWidth;
    if (props.strokeAlign !== undefined) config.strokeAlign = props.strokeAlign;
    if (props.strokeCap !== undefined) config.strokeCap = props.strokeCap;
    if (props.strokeJoin !== undefined) config.strokeJoin = props.strokeJoin;
    if (props.dashPattern !== undefined) config.dashPattern = props.dashPattern;
    if (props.dashOffset !== undefined) config.dashOffset = props.dashOffset;
    
    // 阴影
    if (props.shadow !== undefined) {
      config.shadow = this.parseShadow(props.shadow);
    }
    if (props.innerShadow !== undefined) {
      config.innerShadow = this.parseShadow(props.innerShadow);
    }
    
    // 变换
    if (props.rotation !== undefined) config.rotation = props.rotation;
    if (props.scaleX !== undefined) config.scaleX = props.scaleX;
    if (props.scaleY !== undefined) config.scaleY = props.scaleY;
    if (props.scale !== undefined) config.scale = props.scale;
    if (props.skewX !== undefined) config.skewX = props.skewX;
    if (props.skewY !== undefined) config.skewY = props.skewY;
    
    // 定位
    if (props.origin !== undefined) config.origin = props.origin;
    if (props.around !== undefined) config.around = props.around;
    if (props.zIndex !== undefined) config.zIndex = props.zIndex;
    
    // 可见性
    if (props.opacity !== undefined) config.opacity = props.opacity;
    if (props.visible !== undefined) config.visible = props.visible;
    
    // 遮罩和擦除
    if (props.mask !== undefined) config.mask = props.mask;
    if (props.eraser !== undefined) config.eraser = props.eraser;
    
    // 混合模式
    if (props.blendMode !== undefined) config.blendMode = props.blendMode;
    
    return config;
  }

  /**
   * 构建描边专用配置
   */
  buildStrokeConfig(props) {
    const config = {
      x: props.x || 0,
      y: props.y || 0,
    };
    
    if (props.width !== undefined) config.width = props.width;
    if (props.height !== undefined) config.height = props.height;
    
    // 描边样式
    if (props.stroke !== undefined) config.stroke = this.parseFill(props.stroke);
    if (props.strokeWidth !== undefined) config.strokeWidth = props.strokeWidth;
    if (props.strokeAlign !== undefined) config.strokeAlign = props.strokeAlign;
    if (props.strokeCap !== undefined) config.strokeCap = props.strokeCap;
    if (props.strokeJoin !== undefined) config.strokeJoin = props.strokeJoin;
    if (props.strokeScaleFixed !== undefined) config.strokeScaleFixed = props.strokeScaleFixed;
    if (props.dashPattern !== undefined) config.dashPattern = props.dashPattern;
    if (props.dashOffset !== undefined) config.dashOffset = props.dashOffset;
    
    // 变换
    if (props.rotation !== undefined) config.rotation = props.rotation;
    if (props.opacity !== undefined) config.opacity = props.opacity;
    
    return config;
  }

  /**
   * 解析填充样式 - 支持渐变
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
        case 'image':
        case 'pattern': {
          const imageUrl = props.url || props.src;
          if (!imageUrl) {
            console.warn('[LeaferRenderer V2] ⚠️ Image fill missing url/src');
            return undefined;
          }
          return {
            type: 'image',
            url: imageUrl,
            mode: props.mode || 'repeat',
          };
        }
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
    
    if (Array.isArray(shadow)) {
      return shadow.map(s => ({
        x: s.x || 0,
        y: s.y || 0,
        blur: s.blur || 0,
        color: s.color || '#000000',
      }));
    }
    
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
    const str = JSON.stringify(config);
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * 设置缓存
   */
  setCache(key, value) {
    if (this.renderCache.size >= this.options.maxCacheSize) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }
    this.renderCache.set(key, value);
  }

  /**
   * 获取缓存
   */
  getCache(key) {
    return this.renderCache.get(key) || null;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.renderCache.size,
      cacheHitRate: this.stats.totalRenders > 0 
        ? (this.stats.cachedRenders / this.stats.totalRenders * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 批量渲染
   */
  async batchRender(configs, options = {}) {
    const { concurrency = 3 } = options;
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

  /**
   * 清空缓存
   */
  clearCache() {
    this.renderCache.clear();
    console.log('[LeaferRenderer V2] 🗑️ Cache cleared');
  }
}

module.exports = { LeaferRendererV2 };
