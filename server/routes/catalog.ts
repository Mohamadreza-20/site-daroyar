import { Router } from 'express'
import type { Db, ProductRow } from '../types.ts'
import { requireAdmin } from '../lib/context.js'
import { fail, handle } from '../lib/errors.js'
import { buildSearchText } from '../lib/normalize.js'
import { priceAfterDiscount } from '../lib/pricing.js'
import { categorySchema, parse, productSchema, stockSchema } from '../lib/schemas.js'

const skuOf = (id: number) => `DR-${String(id).padStart(4, '0')}`

interface ProductValues {
  title: string
  brand: string
  category: string
  basePrice: number
  discount: number
  stock: number
  thumbnail: string
  description: string
  tags?: string[]
}

function productFields(values: ProductValues) {
  return {
    title: values.title,
    brand: values.brand,
    category: values.category,
    description: values.description,
    basePrice: values.basePrice,
    discount: values.discount,
    price: priceAfterDiscount(values.basePrice, values.discount),
    stock: values.stock,
    thumbnail: values.thumbnail,
    searchText: buildSearchText(values.title, values.brand, values.tags ?? []),
  }
}

export function catalogRoutes(db: Db) {
  const router = Router()
  const products = () => db.get('products')
  const categories = () => db.get('categories')

  const requireCategory = (slug: string) => {
    if (!categories().find({ slug }).value())
      fail(422, 'دستهٔ انتخاب‌شده وجود ندارد', { errors: { category: 'دستهٔ انتخاب‌شده وجود ندارد' } })
  }
  const findProduct = (id: string | undefined): ProductRow => {
    const product = products()
      .find({ id: Number(id) })
      .value()
    if (!product) fail(404, 'محصول مورد نظر پیدا نشد')
    return product
  }

  router.get(
    '/products/:id',
    handle((req, res) => res.json(findProduct(req.params.id))),
  )

  router.post(
    '/products',
    handle((req, res) => {
      requireAdmin(req)
      const values = parse(productSchema, req.body)
      requireCategory(values.category)
      const created = products()
        .insert({
          ...productFields(values),
          images: [values.thumbnail],
          tags: [],
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        })
        .write()
      products()
        .find({ id: created.id })
        .assign({ sku: skuOf(created.id) })
        .write()
      res.status(201).json(products().find({ id: created.id }).value())
    }),
  )

  router.patch(
    '/products/:id',
    handle((req, res) => {
      requireAdmin(req)
      const current = findProduct(req.params.id)
      const values = parse(productSchema, { ...current, ...req.body })
      requireCategory(values.category)
      const images = [
        values.thumbnail,
        ...(current.images ?? []).filter((src) => src !== values.thumbnail && src !== current.thumbnail),
      ]
      const updated = products()
        .find({ id: current.id })
        .assign({ ...productFields({ ...values, tags: current.tags }), images })
        .write()
      res.json(updated)
    }),
  )

  router.patch(
    '/products/:id/stock',
    handle((req, res) => {
      requireAdmin(req)
      const current = findProduct(req.params.id)
      const { stock } = parse(stockSchema, req.body)
      res.json(products().find({ id: current.id }).assign({ stock }).write())
    }),
  )

  router.delete(
    '/products/:id',
    handle((req, res) => {
      requireAdmin(req)
      const current = findProduct(req.params.id)
      products().remove({ id: current.id }).write()
      db.get('reviews').remove({ productId: current.id }).write()
      db.get('wishlists')
        .value()
        .forEach((list) => {
          if (list.productIds.includes(current.id)) {
            db.get('wishlists')
              .find({ id: list.id })
              .assign({ productIds: list.productIds.filter((id) => id !== current.id) })
              .write()
          }
        })
      res.status(204).end()
    }),
  )

  router.post(
    '/categories',
    handle((req, res) => {
      requireAdmin(req)
      const values = parse(categorySchema, req.body)
      if (categories().find({ slug: values.slug }).value()) {
        fail(409, 'این شناسه قبلاً استفاده شده است', { errors: { slug: 'این شناسه قبلاً استفاده شده است' } })
      }
      res.status(201).json(categories().insert(values).write())
    }),
  )

  router.patch(
    '/categories/:id',
    handle((req, res) => {
      requireAdmin(req)
      const current = categories()
        .find({ id: Number(req.params.id) })
        .value()
      if (!current) fail(404, 'دسته‌بندی پیدا نشد')
      const { slug: _ignored, ...values } = parse(categorySchema, { ...current, ...req.body, slug: current.slug })
      res.json(categories().find({ id: current.id }).assign(values).write())
    }),
  )

  router.delete(
    '/categories/:id',
    handle((req, res) => {
      requireAdmin(req)
      const current = categories()
        .find({ id: Number(req.params.id) })
        .value()
      if (!current) fail(404, 'دسته‌بندی پیدا نشد')
      const used = products().filter({ category: current.slug }).size().value()
      if (used > 0) {
        fail(409, `این دسته ${used} محصول دارد؛ ابتدا محصولات را به دستهٔ دیگری منتقل یا حذف کنید.`)
      }
      categories().remove({ id: current.id }).write()
      res.status(204).end()
    }),
  )

  router.get(
    '/catalog/meta',
    handle((_req, res) => {
      const all = products().value()
      const counts: Record<string, number> = {}
      for (const product of all) counts[product.category] = (counts[product.category] ?? 0) + 1
      res.json({ total: all.length, maxPrice: Math.max(0, ...all.map((product) => product.price)), counts })
    }),
  )

  return router
}
