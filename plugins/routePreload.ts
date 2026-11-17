import type { Plugin } from 'vite'

interface ChunkInfo {
  fileName: string
  imports: string[]
  facadeModuleId?: string | null
  isEntry?: boolean
}

const ROUTES: Record<string, string> = {
  '/shop': 'ShopPage.tsx',
  '/product': 'ProductPage.tsx',
}

function collect(bundle: Record<string, ChunkInfo>, start: string, seen = new Set<string>()): Set<string> {
  if (seen.has(start)) return seen
  seen.add(start)
  for (const next of bundle[start]?.imports ?? []) collect(bundle, next, seen)
  return seen
}

export function routePreloadPlugin(): Plugin {
  return {
    name: 'route-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const bundle = (ctx.bundle ?? {}) as unknown as Record<string, ChunkInfo>
        const entry = Object.values(bundle).find((chunk) => chunk.isEntry)
        const loaded = entry ? collect(bundle, entry.fileName) : new Set<string>()
        const map: Record<string, string[]> = {}
        for (const [route, page] of Object.entries(ROUTES)) {
          const chunk = Object.values(bundle).find((item) => item.facadeModuleId?.endsWith(page))
          if (chunk)
            map[route] = [...collect(bundle, chunk.fileName)]
              .filter((file) => !loaded.has(file))
              .map((file) => `/${file}`)
        }
        const script = `(function(){var r=${JSON.stringify(map)},p=location.pathname;for(var k in r){if(p===k||p.indexOf(k+'/')===0){r[k].forEach(function(h){var l=document.createElement('link');l.rel='modulepreload';l.href=h;document.head.appendChild(l)})}}})()`
        return [{ tag: 'script', children: script, injectTo: 'head-prepend' as const }]
      },
    },
  }
}
