import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path // 保留/api前缀，因为后端API确实需要这个前缀
      }
    },
    // 解决前端服务器响应中文乱码问题
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  },
  build: {
    // 添加charset配置确保构建输出为UTF-8编码
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reservationCalendarPage: path.resolve(__dirname, 'src/features/page_web_reservation/App.tsx'),
        tabWorkItemPage: path.resolve(__dirname, 'src/features/tab_work_item/App.tsx')
      },
      output: {
        charset: true, // 确保输出文件包含charset标记
        entryFileNames: chunkInfo => {
          // 为不同的入口生成不同的文件名
          if (chunkInfo.name === 'reservationCalendarPage') {
            return 'reservationCalendarPage.js'
          } else if (chunkInfo.name === 'tabWorkItemPage') {
            return 'tab-web.js'
          }
          return 'main.js'
        }
      }
    }
  }
})
