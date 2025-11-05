import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path // 保留/api前缀，因为后端API确实需要这个前缀
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reservationCalendarPage: path.resolve(__dirname, 'src/features/page_web_reservation/App.tsx'),
        tabWorkItemPage: path.resolve(__dirname, 'src/features/tab_work_item/App.tsx')
      },
      output: {
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
