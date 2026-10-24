import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_TARGET = process.env.API_TARGET ?? 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    proxy: { '/api': { target: API_TARGET, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } },
  },
  preview: { proxy: { '/api': { target: API_TARGET, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } } },
})
