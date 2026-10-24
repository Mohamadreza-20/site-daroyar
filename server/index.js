import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import jsonServer from 'json-server'
import { attachUser } from './lib/context.js'
import { errorMiddleware } from './lib/errors.js'
import { syncAllRatings } from './lib/rating.js'
import { buildSearchPattern } from './lib/normalize.js'
import { accountRoutes } from './routes/account.js'
import { authRoutes } from './routes/auth.js'
import { catalogRoutes } from './routes/catalog.js'
import { orderRoutes } from './routes/orders.js'
import { reviewRoutes } from './routes/reviews.js'

const root = dirname(fileURLToPath(import.meta.url))
const seedFile = join(root, 'db.json')
const dataDir = join(root, '.data')
const dbFile = join(dataDir, 'db.json')
const PORT = Number(process.env.PORT) || 3001
const DELAY = Number(process.env.API_DELAY ?? 120)

if (process.argv.includes('--reset') || !existsSync(dbFile)) {
  mkdirSync(dataDir, { recursive: true })
  copyFileSync(seedFile, dbFile)
}

const server = jsonServer.create()
const router = jsonServer.router(dbFile)
const { db } = router

syncAllRatings(db)

const PUBLIC_READ = new Set(['products', 'categories', 'reviews', 'articles', 'shippingMethods'])

server.use(
  jsonServer.defaults({ static: join(root, 'public'), logger: process.env.NODE_ENV !== 'test', bodyParser: true }),
)
const MAX_PAGE_SIZE = 100
server.use((req, _res, next) => {
  if (req.query._limit !== undefined) {
    const limit = Math.floor(Number(req.query._limit))
    const safe = String(Number.isFinite(limit) && limit > 0 ? Math.min(limit, MAX_PAGE_SIZE) : 10)
    const url = new URL(req.url, 'http://local')
    url.searchParams.set('_limit', safe)
    req.url = `${url.pathname}${url.search}`
    req.query._limit = safe
  }
  next()
})

server.use((_req, _res, next) => (DELAY > 0 ? setTimeout(next, DELAY) : next()))
server.use(attachUser(db))

server.use(authRoutes(db))
server.use(catalogRoutes(db))
server.use(orderRoutes(db))
server.use(reviewRoutes(db))
server.use(accountRoutes(db))

server.use((req, res, next) => {
  const resource = req.path.split('/')[1]
  if (req.method !== 'GET' || !PUBLIC_READ.has(resource)) {
    return res.status(404).json({ message: 'مسیر درخواستی پیدا نشد' })
  }
  if (resource === 'products' && typeof req.query.q === 'string') {
    const url = new URL(req.url, 'http://local')
    const pattern = buildSearchPattern(url.searchParams.get('q') ?? '')
    url.searchParams.delete('q')
    if (pattern) url.searchParams.set('searchText_like', pattern)
    req.url = `${url.pathname}${url.search}`
    const query = {}
    url.searchParams.forEach((value, key) => {
      query[key] = key in query ? [].concat(query[key], value) : value
    })
    req.query = query
  }
  return next()
})

server.use(router)
server.use(errorMiddleware)

server.listen(PORT, () => {
  console.log(`API آماده است: http://localhost:${PORT}  (داده‌ها: ${dbFile})`)
})
