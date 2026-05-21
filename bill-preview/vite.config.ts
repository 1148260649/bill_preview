import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'window.layui': 'window.layui',
  },
  server: {
    port: 5173,
    https: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    allowedHosts: ['.monkeycode-ai.online'],
  },
})
