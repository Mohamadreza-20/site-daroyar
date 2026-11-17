import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fontPreloadPlugin } from './plugins/fontPreload.ts'
import { routePreloadPlugin } from './plugins/routePreload.ts'
import { seoPlugin } from './plugins/seo.ts'

const proxy = (target: string) => ({
  '/api': { target, changeOrigin: true, rewrite: (path: string) => path.replace(/^\/api/, '') },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_TARGET ?? 'http://localhost:3001'

  return {
    plugins: [
      react(),
      tailwindcss(),
      fontPreloadPlugin(),
      routePreloadPlugin(),
      seoPlugin({ siteUrl: env.VITE_SITE_URL ?? 'https://example.com' }),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { port: 5173, open: false, proxy: proxy(target) },
    preview: { proxy: proxy(target) },
    build: {
      target: 'es2023',
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 450,
    },
  }
})
