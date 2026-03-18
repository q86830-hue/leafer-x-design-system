/**
 * 跨平台字体配置
 * 支持 Windows、macOS、Linux
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 获取当前操作系统类型
 * @returns {string} 'win32' | 'darwin' | 'linux'
 */
function getPlatform() {
  return process.platform;
}

/**
 * 获取系统字体路径配置
 * @returns {Object} 字体配置对象
 */
function getSystemFontPaths() {
  const platform = getPlatform();
  
  const fontConfigs = {
    win32: {
      paths: [
        'C:/Windows/Fonts/simhei.ttf',
        'C:/Windows/Fonts/simsunb.ttf',
        'C:/Windows/Fonts/simsun.ttc',
        'C:/Windows/Fonts/msyh.ttc',
        'C:/Windows/Fonts/msyhbd.ttc',
        'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/arialbd.ttf',
      ],
      families: {
        'simhei.ttf': 'SimHei',
        'simsunb.ttf': 'SimSun',
        'simsun.ttc': 'SimSun',
        'msyh.ttc': 'Microsoft YaHei',
        'msyhbd.ttc': 'Microsoft YaHei Bold',
        'arial.ttf': 'Arial',
        'arialbd.ttf': 'Arial Bold',
      }
    },
    darwin: {
      paths: [
        '/System/Library/Fonts/PingFang.ttc',
        '/System/Library/Fonts/STHeiti Light.ttc',
        '/System/Library/Fonts/STHeiti Medium.ttc',
        '/Library/Fonts/Arial Unicode.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Times.ttc',
      ],
      families: {
        'PingFang.ttc': 'PingFang SC',
        'STHeiti Light.ttc': 'STHeiti',
        'STHeiti Medium.ttc': 'STHeiti',
        'Arial Unicode.ttf': 'Arial Unicode MS',
        'Helvetica.ttc': 'Helvetica',
        'Times.ttc': 'Times',
      }
    },
    linux: {
      paths: [
        '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
        '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
      ],
      families: {
        'wqy-zenhei.ttc': 'WenQuanYi Zen Hei',
        'wqy-microhei.ttc': 'WenQuanYi Micro Hei',
        'DejaVuSans.ttf': 'DejaVu Sans',
        'DejaVuSans-Bold.ttf': 'DejaVu Sans Bold',
        'LiberationSans-Regular.ttf': 'Liberation Sans',
        'NotoSansCJK-Regular.ttc': 'Noto Sans CJK SC',
      }
    }
  };
  
  return fontConfigs[platform] || fontConfigs.linux;
}

/**
 * 扫描额外的字体目录
 * @returns {Array} 找到的字体文件列表
 */
function scanAdditionalFontPaths() {
  const platform = getPlatform();
  const additionalPaths = [];
  
  if (platform === 'darwin') {
    // macOS 用户字体目录
    const userFontDir = path.join(os.homedir(), 'Library/Fonts');
    if (fs.existsSync(userFontDir)) {
      try {
        const files = fs.readdirSync(userFontDir);
        files.forEach(file => {
          if (/\.(ttf|ttc|otf)$/i.test(file)) {
            additionalPaths.push(path.join(userFontDir, file));
          }
        });
      } catch (e) {
        console.warn('[FontConfig] 无法读取用户字体目录:', e.message);
      }
    }
  } else if (platform === 'linux') {
    // Linux 用户字体目录
    const userFontDir = path.join(os.homedir(), '.fonts');
    if (fs.existsSync(userFontDir)) {
      try {
        const files = fs.readdirSync(userFontDir);
        files.forEach(file => {
          if (/\.(ttf|ttc|otf)$/i.test(file)) {
            additionalPaths.push(path.join(userFontDir, file));
          }
        });
      } catch (e) {
        console.warn('[FontConfig] 无法读取用户字体目录:', e.message);
      }
    }
    
    // Linux local 字体目录
    const localFontDir = path.join(os.homedir(), '.local/share/fonts');
    if (fs.existsSync(localFontDir)) {
      try {
        const files = fs.readdirSync(localFontDir);
        files.forEach(file => {
          if (/\.(ttf|ttc|otf)$/i.test(file)) {
            additionalPaths.push(path.join(localFontDir, file));
          }
        });
      } catch (e) {
        console.warn('[FontConfig] 无法读取 local 字体目录:', e.message);
      }
    }
  }
  
  return additionalPaths;
}

/**
 * 获取可用的字体列表
 * @returns {Array} 可用字体配置数组
 */
function getAvailableFonts() {
  const config = getSystemFontPaths();
  const availableFonts = [];
  
  // 检查系统字体
  config.paths.forEach(fontPath => {
    if (fs.existsSync(fontPath)) {
      const basename = path.basename(fontPath);
      const family = config.families[basename] || path.basename(basename, path.extname(basename));
      availableFonts.push({
        file: fontPath,
        family: family,
        source: 'system'
      });
    }
  });
  
  // 检查额外字体
  const additionalFonts = scanAdditionalFontPaths();
  additionalFonts.forEach(fontPath => {
    const basename = path.basename(fontPath);
    const family = path.basename(basename, path.extname(basename));
    availableFonts.push({
      file: fontPath,
      family: family,
      source: 'user'
    });
  });
  
  return availableFonts;
}

/**
 * 获取推荐的中文字体
 * @returns {Array} 推荐字体列表
 */
function getRecommendedChineseFonts() {
  const platform = getPlatform();
  const allFonts = getAvailableFonts();
  
  // 按优先级排序的字体名称
  const priorityFonts = {
    win32: ['Microsoft YaHei', 'SimHei', 'SimSun', 'Arial'],
    darwin: ['PingFang SC', 'STHeiti', 'Arial Unicode MS', 'Helvetica'],
    linux: ['Noto Sans CJK SC', 'WenQuanYi Zen Hei', 'WenQuanYi Micro Hei', 'DejaVu Sans']
  };
  
  const priorities = priorityFonts[platform] || priorityFonts.linux;
  const recommended = [];
  
  priorities.forEach(family => {
    const font = allFonts.find(f => f.family === family);
    if (font) {
      recommended.push(font);
    }
  });
  
  return recommended.length > 0 ? recommended : allFonts.slice(0, 3);
}

/**
 * 加载字体到 FontLibrary
 * @param {Object} FontLibrary - skia-canvas 的 FontLibrary
 * @returns {Array} 成功加载的字体列表
 */
function loadFonts(FontLibrary) {
  const fonts = getAvailableFonts();
  const loadedFonts = [];
  
  console.log(`[FontConfig] 找到 ${fonts.length} 个字体文件`);
  
  fonts.forEach(font => {
    try {
      FontLibrary.use(font.family, [font.file]);
      loadedFonts.push(font.family);
      console.log(`[FontConfig] ✅ 已加载字体: ${font.family} (${font.source})`);
    } catch (error) {
      console.warn(`[FontConfig] ⚠️ 加载字体失败 ${font.family}:`, error.message);
    }
  });
  
  return loadedFonts;
}

/**
 * 获取字体配置信息（用于调试）
 * @returns {Object} 配置信息
 */
function getFontConfigInfo() {
  return {
    platform: getPlatform(),
    platformName: getPlatform() === 'win32' ? 'Windows' : 
                  getPlatform() === 'darwin' ? 'macOS' : 'Linux',
    availableFonts: getAvailableFonts(),
    recommendedFonts: getRecommendedChineseFonts(),
    totalFonts: getAvailableFonts().length
  };
}

module.exports = {
  getPlatform,
  getSystemFontPaths,
  getAvailableFonts,
  getRecommendedChineseFonts,
  loadFonts,
  getFontConfigInfo,
  scanAdditionalFontPaths
};