import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import fs from 'fs';

// 检查证书文件是否存在，如果存在则启用 HTTPS
const enableHttps = () => {
  try {
    // 只在开发模式下检查证书文件
    if (process.env.NODE_ENV === 'development') {
      const keyPath = '/home/lw/projects/SSL/nginx/wzbc-edu-cn-1024225915_key.key';
      const certPath = '/home/lw/projects/SSL/nginx/wzbc-edu-cn-1024225915_chain.pem';
      
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
      }
    }
    return false;
  } catch (error) {
    console.warn('无法读取证书文件:', error.message);
    return false;
  }
};

const httpsConfig = enableHttps();

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
    miaodaDevPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(httpsConfig ? { https: httpsConfig } : {}),
    // 关键配置：允许代理
    hmr: {
      protocol: httpsConfig ? 'wss' : 'ws',
      host: 'aigc.wzbc.edu.cn',
      clientPort: 443
    },
    // 允许所有主机
    allowedHosts: [
      '.wzbc.edu.cn',
      'aigc.wzbc.edu.cn',
      'localhost',
      '127.0.0.1',
      '10.145.251.29'
    ],
    // 代理配置
    proxy: {
      '/api': {
        target: 'https://api.wzbc.edu.cn',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 确保资源路径正确
    assetsDir: 'assets',
  },
  // 基础路径（重要！）
  base: '/',
  // 预览配置
  preview: {
    port: 5173,
    host: '0.0.0.0',
    ...(httpsConfig ? { https: httpsConfig } : {}),
  }
});