/**
 * 无头浏览器桥接模块
 * 连接 Chrome Headless 和 Leafer Design System
 * 
 * 使用 Shannon 六把钥匙方法论实现:
 * 1. 简化: 核心功能是浏览器截图
 * 2. 重述: 作为渲染服务的补充
 * 3. 泛化: 通用的浏览器控制接口
 * 4. 分解: 启动→截图→关闭
 * 5. 繁衍: 从截图需求倒推功能
 * 6. 类比: 类似 Puppeteer 的简化版
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BrowserBridge {
  constructor(options = {}) {
    this.chromePath = options.chromePath || 
      'G:\\dnzs\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
    this.debugPort = options.debugPort || 9222;
    this.browserProcess = null;
    this.wsEndpoint = null;
  }

  /**
   * 启动无头浏览器
   */
  async launch() {
    console.log('[BrowserBridge] 启动 Chrome Headless...');
    
    return new Promise((resolve, reject) => {
      const args = [
        `--remote-debugging-port=${this.debugPort}`,
        '--headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ];

      this.browserProcess = spawn(this.chromePath, args, {
        detached: false
      });

      this.browserProcess.on('error', (err) => {
        console.error('[BrowserBridge] 启动失败:', err.message);
        reject(err);
      });

      // 等待调试端口就绪
      setTimeout(async () => {
        try {
          const version = await this.getVersion();
          console.log('[BrowserBridge] ✅ Chrome 已启动');
          console.log(`[BrowserBridge] 调试端口: ${this.debugPort}`);
          console.log(`[BrowserBridge] 版本: ${version.Browser}`);
          resolve();
        } catch (err) {
          reject(new Error('无法连接到 Chrome 调试端口'));
        }
      }, 2000);
    });
  }

  /**
   * 获取 Chrome 版本信息
   */
  async getVersion() {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${this.debugPort}/json/version`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * 获取可用页面列表
   */
  async getPages() {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${this.debugPort}/json/list`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * 创建新页面
   */
  async newPage() {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${this.debugPort}/json/new`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const page = JSON.parse(data);
            console.log('[BrowserBridge] 创建页面:', page.id);
            resolve(page);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * 截图
   */
  async screenshot(urlOrHtml, options = {}) {
    const page = await this.newPage();
    const width = options.width || 1200;
    const height = options.height || 800;

    try {
      // 设置视口大小
      await this.sendCommand(page.id, 'Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false
      });

      // 导航到页面或设置 HTML
      if (urlOrHtml.startsWith('http')) {
        await this.sendCommand(page.id, 'Page.navigate', { url: urlOrHtml });
      } else {
        // 设置 HTML 内容
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(urlOrHtml);
        await this.sendCommand(page.id, 'Page.navigate', { url: dataUrl });
      }

      // 等待页面加载
      await this.waitForPageLoad(page.id);

      // 截图
      const screenshot = await this.sendCommand(page.id, 'Page.captureScreenshot', {
        format: options.format || 'png',
        quality: options.quality || 100,
        fromSurface: true
      });

      console.log('[BrowserBridge] ✅ 截图成功');
      return screenshot.data; // base64

    } finally {
      // 关闭页面
      await this.closePage(page.id);
    }
  }

  /**
   * 发送 CDP 命令
   */
  async sendCommand(pageId, method, params = {}) {
    const WebSocket = require('ws');
    
    return new Promise(async (resolve, reject) => {
      try {
        const pages = await this.getPages();
        const page = pages.find(p => p.id === pageId);
        
        if (!page) {
          reject(new Error(`页面 ${pageId} 不存在`));
          return;
        }

        const ws = new WebSocket(page.webSocketDebuggerUrl);
        const id = Math.random().toString(36).substr(2, 9);

        ws.on('open', () => {
          ws.send(JSON.stringify({ id, method, params }));
        });

        ws.on('message', (data) => {
          const response = JSON.parse(data);
          if (response.id === id) {
            ws.close();
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        });

        ws.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad(pageId) {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000); // 简单实现，实际应监听 Page.loadEventFired
    });
  }

  /**
   * 关闭页面
   */
  async closePage(pageId) {
    const http = require('http');
    return new Promise((resolve) => {
      http.get(`http://localhost:${this.debugPort}/json/close/${pageId}`, () => {
        console.log('[BrowserBridge] 关闭页面:', pageId);
        resolve();
      }).on('error', resolve);
    });
  }

  /**
   * 关闭浏览器
   */
  async close() {
    if (this.browserProcess) {
      this.browserProcess.kill();
      console.log('[BrowserBridge] Chrome 已关闭');
    }
  }
}

module.exports = { BrowserBridge };

// 测试代码
if (require.main === module) {
  const bridge = new BrowserBridge();
  
  (async () => {
    try {
      await bridge.launch();
      
      // 测试截图
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 40px; 
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            h1 { font-size: 48px; margin-bottom: 20px; }
            p { font-size: 24px; }
          </style>
        </head>
        <body>
          <h1>Browser Bridge 测试</h1>
          <p>阶段2: 无头浏览器集成 ✓</p>
        </body>
        </html>
      `;
      
      const screenshot = await bridge.screenshot(html, {
        width: 1200,
        height: 600,
        format: 'png'
      });
      
      // 保存截图
      const outputPath = path.join(__dirname, 'output', 'browser-test.png');
      fs.writeFileSync(outputPath, screenshot, 'base64');
      console.log('截图已保存:', outputPath);
      
      await bridge.close();
    } catch (err) {
      console.error('错误:', err.message);
      process.exit(1);
    }
  })();
}
