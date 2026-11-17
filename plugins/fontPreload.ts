import type { Plugin } from 'vite'

const FONT = /vazirmatn-arabic-wght-normal.*\.woff2$/

export function fontPreloadPlugin(): Plugin {
  return {
    name: 'font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((name) => FONT.test(name))
        return files.map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: true },
          injectTo: 'head-prepend' as const,
        }))
      },
    },
  }
}
