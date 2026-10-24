import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { paginate, publicUser, requireAdmin, requireUser, setTotalCount } from '../lib/context.js'
import { fail, handle } from '../lib/errors.js'
import { matchesQuery } from '../lib/normalize.js'
import { calcTotals } from '../lib/pricing.js'
import { MAX_QTY, couponSchema, orderSchema, parse, statusSchema } from '../lib/schemas.js'

const TRANSITIONS = {
  processing: ['packed', 'canceled'],
  packed: ['shipped', 'canceled'],
  shipped: ['delivered'],
  delivered: [],
  canceled: [],
}
const STATUS_LABELS = {
  processing: 'در حال پردازش',
  packed: 'آماده ارسال',
  shipped: 'ارسال شده',
  delivered: 'تحویل شد',
  canceled: 'لغو شد',
}
const CUSTOMER_CANCELABLE = ['processing']

const makeOrderId = () => `DR-${randomBytes(4).toString('hex').toUpperCase()}`

export function orderRoutes(db) {
  const router = Router()
  const orders = () => db.get('orders')
  const products = () => db.get('products')

  const findCoupon = (code) =>
    db
      .get('coupons')
      .value()
      .find(
        (coupon) =>
          coupon.active &&
          coupon.code ===
            String(code ?? '')
              .trim()
              .toUpperCase(),
      )

  const restock = (order) => {
    order.items.forEach((item) => {
      const product = products().find({ id: item.productId })
      if (product.value()) product.assign({ stock: product.value().stock + item.qty }).write()
    })
  }

  const changeStatus = (order, status) => {
    const updated = orders()
      .find({ id: order.id })
      .assign({
        status,
        updatedAt: new Date().toISOString(),
        history: [...order.history, { status, at: new Date().toISOString() }],
      })
      .write()
    if (status === 'canceled') restock(order)
    return updated
  }

  const visibleTo = (user, order) => user.role === 'admin' || order.userId === user.id

  router.post(
    '/coupons/validate',
    handle((req, res) => {
      const { code } = parse(couponSchema, req.body)
      const coupon = findCoupon(code)
      if (!coupon) fail(404, 'کد تخفیف معتبر نیست')
      res.json({ code: coupon.code, percent: coupon.percent, label: coupon.label })
    }),
  )

  router.post(
    '/orders',
    handle((req, res) => {
      const user = requireUser(req)
      const input = parse(orderSchema, req.body)

      const merged = new Map()
      input.items.forEach(({ productId, qty }) => merged.set(productId, (merged.get(productId) ?? 0) + qty))

      const over = [...merged.entries()].find(([, qty]) => qty > MAX_QTY)
      if (over) fail(422, `حداکثر تعداد هر محصول در یک سفارش ${MAX_QTY} عدد است`)

      const changes = []
      const lines = []
      merged.forEach((qty, productId) => {
        const product = products().find({ id: productId }).value()
        if (!product) {
          changes.push({ productId, type: 'removed' })
        } else if (product.stock < qty) {
          changes.push({
            productId,
            title: product.title,
            type: product.stock > 0 ? 'stock' : 'soldout',
            available: product.stock,
          })
        } else {
          lines.push({ product, qty })
        }
      })
      if (changes.length) {
        fail(409, 'موجودی یا وضعیت برخی کالاها تغییر کرده است؛ سبد خرید را بررسی کنید.', {
          code: 'CART_CHANGED',
          changes,
        })
      }

      const shippingMethod = db.get('shippingMethods').find({ id: input.shippingMethodId }).value()
      if (!shippingMethod) fail(422, 'روش ارسال نامعتبر است', { errors: { shippingMethodId: 'روش ارسال نامعتبر است' } })

      const coupon = input.couponCode ? findCoupon(input.couponCode) : null
      if (input.couponCode && !coupon) fail(422, 'کد تخفیف معتبر نیست', { code: 'INVALID_COUPON' })

      const totals = calcTotals(
        lines.map(({ product, qty }) => ({ price: product.price, basePrice: product.basePrice, qty })),
        coupon,
        shippingMethod,
      )
      if (input.expectedTotal != null && input.expectedTotal !== totals.total) {
        fail(409, 'قیمت کالاها یا هزینهٔ ارسال تغییر کرده است؛ مبلغ جدید را بررسی کنید.', {
          code: 'PRICE_CHANGED',
          totals,
        })
      }

      lines.forEach(({ product, qty }) =>
        products()
          .find({ id: product.id })
          .assign({ stock: product.stock - qty })
          .write(),
      )

      let id = makeOrderId()
      while (orders().find({ id }).value()) id = makeOrderId()
      const now = new Date().toISOString()
      const order = {
        id,
        userId: user.id,
        status: 'processing',
        createdAt: now,
        updatedAt: now,
        history: [{ status: 'processing', at: now }],
        items: lines.map(({ product, qty }) => ({
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          category: product.category,
          price: product.price,
          basePrice: product.basePrice,
          qty,
        })),
        totals,
        coupon: coupon ? { code: coupon.code, percent: coupon.percent } : null,
        shippingMethod: { id: shippingMethod.id, label: shippingMethod.label, cost: shippingMethod.cost },
        payment: input.payment,
        shipping: input.shipping,
        customer: input.shipping.fullName,
      }
      orders().push(order).write()
      res.status(201).json(order)
    }),
  )

  router.get(
    '/orders',
    handle((req, res) => {
      const user = requireUser(req)
      const { status, q, userId } = req.query
      const customers = new Map(
        db
          .get('users')
          .value()
          .map((u) => [u.id, u]),
      )
      let list = orders()
        .value()
        .filter((order) => visibleTo(user, order))
      if (user.role === 'admin' && userId) list = list.filter((order) => String(order.userId) === String(userId))
      if (status) list = list.filter((order) => order.status === status)
      if (q) {
        list = list.filter((order) =>
          matchesQuery(
            `${order.id} ${order.customer} ${order.shipping.city} ${customers.get(order.userId)?.username ?? ''}`,
            q,
          ),
        )
      }
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const page = paginate(list, req.query, 10)
      setTotalCount(res, page.total)
      res.json(page.items)
    }),
  )

  router.get(
    '/orders/:id',
    handle((req, res) => {
      const user = requireUser(req)
      const order = orders().find({ id: req.params.id }).value()
      if (!order || !visibleTo(user, order)) fail(404, 'سفارش مورد نظر پیدا نشد')
      const owner = db.get('users').find({ id: order.userId }).value()
      res.json(user.role === 'admin' ? { ...order, user: publicUser(owner) } : order)
    }),
  )

  router.patch(
    '/orders/:id/status',
    handle((req, res) => {
      requireAdmin(req)
      const order = orders().find({ id: req.params.id }).value()
      if (!order) fail(404, 'سفارش مورد نظر پیدا نشد')
      const { status } = parse(statusSchema, req.body)
      if (!TRANSITIONS[order.status].includes(status)) {
        fail(409, `تغییر وضعیت از «${STATUS_LABELS[order.status]}» به «${STATUS_LABELS[status]}» مجاز نیست`, {
          code: 'INVALID_TRANSITION',
          allowed: TRANSITIONS[order.status],
        })
      }
      res.json(changeStatus(order, status))
    }),
  )

  router.post(
    '/orders/:id/cancel',
    handle((req, res) => {
      const user = requireUser(req)
      const order = orders().find({ id: req.params.id }).value()
      if (!order || !visibleTo(user, order)) fail(404, 'سفارش مورد نظر پیدا نشد')
      if (!CUSTOMER_CANCELABLE.includes(order.status))
        fail(409, 'لغو سفارش فقط در مرحلهٔ «در حال پردازش» امکان‌پذیر است')
      res.json(changeStatus(order, 'canceled'))
    }),
  )

  return router
}
