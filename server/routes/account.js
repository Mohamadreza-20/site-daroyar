import { Router } from 'express'
import { paginate, publicUser, requireAdmin, requireUser, setTotalCount } from '../lib/context.js'
import { fail, handle } from '../lib/errors.js'
import { matchesQuery } from '../lib/normalize.js'
import { contactSchema, newsletterSchema, parse, replySchema } from '../lib/schemas.js'

export function accountRoutes(db) {
  const router = Router()

  const requireCustomer = (req) => {
    const user = requireUser(req)
    if (user.role === 'admin') fail(403, 'لیست علاقه‌مندی برای مدیر در دسترس نیست.', { code: 'FORBIDDEN' })
    return user
  }
  const listFor = (user) => {
    const lists = db.get('wishlists')
    return lists.find({ userId: user.id }).value() ?? lists.insert({ userId: user.id, productIds: [] }).write()
  }
  const saveIds = (list, productIds) => {
    db.get('wishlists').find({ id: list.id }).assign({ productIds }).write()
    return { productIds }
  }

  router.get(
    '/wishlist',
    handle((req, res) => res.json({ productIds: listFor(requireCustomer(req)).productIds })),
  )

  router.put(
    '/wishlist/:productId',
    handle((req, res) => {
      const list = listFor(requireCustomer(req))
      const id = Number(req.params.productId)
      if (!db.get('products').find({ id }).value()) fail(404, 'محصول مورد نظر پیدا نشد')
      res.json(saveIds(list, [...new Set([...list.productIds, id])]))
    }),
  )

  router.delete(
    '/wishlist/:productId',
    handle((req, res) => {
      const list = listFor(requireCustomer(req))
      const id = Number(req.params.productId)
      res.json(
        saveIds(
          list,
          list.productIds.filter((item) => item !== id),
        ),
      )
    }),
  )

  const messages = () => db.get('messages')
  const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt)

  router.post(
    '/messages',
    handle((req, res) => {
      const values = parse(contactSchema, req.body)
      res.status(201).json(
        messages()
          .insert({
            ...values,
            userId: req.user?.id ?? null,
            status: 'pending',
            reply: null,
            repliedAt: null,
            createdAt: new Date().toISOString(),
          })
          .write(),
      )
    }),
  )

  router.get(
    '/messages/mine',
    handle((req, res) => {
      const user = requireUser(req)
      res.json(
        messages()
          .value()
          .filter((message) => message.userId === user.id)
          .sort(byNewest),
      )
    }),
  )

  router.get(
    '/messages',
    handle((req, res) => {
      requireAdmin(req)
      const { status } = req.query
      let list = messages().value()
      if (status) list = list.filter((message) => message.status === status)
      const page = paginate([...list].sort(byNewest), req.query, 10)
      setTotalCount(res, page.total)
      res.json(page.items)
    }),
  )

  router.post(
    '/messages/:id/reply',
    handle((req, res) => {
      requireAdmin(req)
      const message = messages()
        .find({ id: Number(req.params.id) })
        .value()
      if (!message) fail(404, 'پیام مورد نظر پیدا نشد')
      const { reply } = parse(replySchema, req.body)
      res.json(
        messages()
          .find({ id: message.id })
          .assign({ reply, status: 'answered', repliedAt: new Date().toISOString() })
          .write(),
      )
    }),
  )

  router.post(
    '/subscribers',
    handle((req, res) => {
      const { email } = parse(newsletterSchema, req.body)
      const existing = db.get('subscribers').find({ email }).value()
      if (existing) return res.json({ ...existing, already: true })
      return res.status(201).json(db.get('subscribers').insert({ email, createdAt: new Date().toISOString() }).write())
    }),
  )

  router.get(
    '/users',
    handle((req, res) => {
      requireAdmin(req)
      const { q, role } = req.query
      let list = db.get('users').value()
      if (role) list = list.filter((user) => user.role === role)
      if (q)
        list = list.filter((user) =>
          matchesQuery(`${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.phone}`, q),
        )
      const page = paginate(list, req.query, 10)
      setTotalCount(res, page.total)
      res.json(page.items.map(publicUser))
    }),
  )

  router.get(
    '/stats',
    handle((req, res) => {
      requireAdmin(req)
      const products = db.get('products').value()
      const orders = db.get('orders').value()
      const sold = orders.filter((order) => order.status !== 'canceled')
      const byStatus = {}
      orders.forEach((order) => {
        byStatus[order.status] = (byStatus[order.status] ?? 0) + 1
      })
      res.json({
        products: products.length,
        lowStock: products.filter((product) => product.stock > 0 && product.stock < 10).length,
        outOfStock: products.filter((product) => product.stock === 0).length,
        users: db.get('users').size().value(),
        orders: orders.length,
        revenue: sold.reduce((sum, order) => sum + order.totals.total, 0),
        byStatus,
        byCategory: db
          .get('categories')
          .value()
          .map((category) => ({
            slug: category.slug,
            label: category.label,
            count: products.filter((product) => product.category === category.slug).length,
          })),
        recentOrders: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      })
    }),
  )

  return router
}
