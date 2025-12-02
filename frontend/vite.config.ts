import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 针对/api开头的请求进行代理
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path // 保留/api前缀
      },
      // 针对/ai开头的请求进行代理（如AI聊天接口）
      '/ai': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path // 保留/ai前缀
      }
    }
  },
  build: {
    // ����charset����ȷ���������ΪUTF-8����
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reservationCalendarPage: path.resolve(__dirname, 'src/features/page_web_reservation/App.tsx'),
        tabWorkItemPage: path.resolve(__dirname, 'src/features/tab_work_item/App.tsx')
      },
      output: {
        // charset属性已被移除，使用默认的charset处理方式
        entryFileNames: chunkInfo => {
          // Ϊ��ͬ��������ɲ�ͬ���ļ���
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
