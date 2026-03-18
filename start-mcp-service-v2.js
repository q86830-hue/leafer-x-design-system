/**
 * MCP 服务 V2 - 使用优化后的 LeaferRendererV2
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 使用本地输出目录
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 导入 V2 渲染器
const { LeaferRendererV2 } = require('./leafer-renderer-v2');

class MCPServerV2 {
  constructor() {
    this.port = process.env.MCP_PORT || 3456;
    this.renderer = new LeaferRendererV2({
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      maxCacheSize: 100,
      outputDir: outputDir
    });
  }

  async handleRequest(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = req.url;
    const method = req.method;

    try {
      // 健康检查
      if (url === '/health' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'healthy',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          stats: this.renderer.getStats(),
          outputDir: outputDir,
          features: [
            'rect', 'ellipse', 'circle', 'line', 'polygon', 'star', 
            'path', 'pen', 'text', 'image', 'group', 'box', 'frame'
          ]
        }));
        return;
      }

      // UI 渲染端点
      if (url === '/api/v1/ui/render' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { width, height, elements, options = {} } = JSON.parse(body);
            
            if (!width || !height || !elements) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Width, height, and elements are required' }));
              return;
            }

            const result = await this.renderer.render({
              width,
              height,
              elements,
              options: {
                format: options.format || 'png',
                quality: options.quality || 0.92,
                pixelRatio: options.pixelRatio || 2,
                backgroundColor: options.backgroundColor || '#ffffff'
              }
            });

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              requestId: uuidv4(),
              data: result,
              meta: {
                generatedAt: new Date().toISOString(),
                dimensions: { width, height }
              }
            }));
          } catch (error) {
            console.error('[MCP V2] Render error:', error);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ 
              success: false,
              error: error.message,
              stack: error.stack
            }));
          }
        });
        return;
      }

      // 批量渲染端点
      if (url === '/api/v1/ui/batch-render' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { configs, options = {} } = JSON.parse(body);
            
            if (!Array.isArray(configs)) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'configs must be an array' }));
              return;
            }

            const results = await this.renderer.batchRender(configs, options);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              requestId: uuidv4(),
              data: results,
              meta: {
                generatedAt: new Date().toISOString(),
                count: configs.length
              }
            }));
          } catch (error) {
            console.error('[MCP V2] Batch render error:', error);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }

      // 清空缓存
      if (url === '/api/v1/cache/clear' && method === 'POST') {
        this.renderer.clearCache();
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Cache cleared' }));
        return;
      }

      // 获取统计信息
      if (url === '/api/v1/stats' && method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: this.renderer.getStats()
        }));
        return;
      }

      // 获取生成的图片
      if (url.startsWith('/output/') && method === 'GET') {
        const filename = path.basename(url);
        const filePath = path.join(outputDir, filename);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          const contentType = ext === '.png' ? 'image/png' : 
                             ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                             ext === '.webp' ? 'image/webp' : 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.writeHead(200);
          fs.createReadStream(filePath).pipe(res);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'File not found' }));
        }
        return;
      }

      // 404
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      console.error('[MCP V2] Server error:', error);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  start() {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    
    // 处理端口冲突，自动尝试下一个端口
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ 端口 ${this.port} 被占用，尝试端口 ${this.port + 1}...`);
        this.port++;
        server.listen(this.port);
      } else {
        console.error('❌ 服务器错误:', err.message);
        process.exit(1);
      }
    });
    
    server.listen(this.port, () => {
      console.log('🚀 MCP Server V2 running on port', this.port);
      console.log('📁 Output directory:', outputDir);
      console.log('🎯 Health check: http://localhost:' + this.port + '/health');
      console.log('✨ LeaferRenderer V2 with full feature support');
      console.log('');
      console.log('API Endpoints:');
      console.log('  POST /api/v1/ui/render       - Render UI elements');
      console.log('  POST /api/v1/ui/batch-render - Batch render multiple UIs');
      console.log('  POST /api/v1/cache/clear     - Clear render cache');
      console.log('  GET  /api/v1/stats           - Get renderer statistics');
      console.log('  GET  /output/:filename       - Get generated image');
    });
  }
}

// 启动服务器
const server = new MCPServerV2();
server.start();
