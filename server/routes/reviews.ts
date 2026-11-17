import { Router } from 'express'
import type { Db } from '../types.ts'
import { requireUser } from '../lib/context.js'
import { fail, handle } from '../lib/errors.js'
import { syncRating } from '../lib/rating.js'
import { parse, reviewSchema } from '../lib/schemas.js'

export function reviewRoutes(db: Db) {
  const router = Router()

  router.post(
    '/reviews',
    handle((req, res) => {
      const user = requireUser(req)
      if (user.role === 'admin') fail(403, 'مدیر نمی‌تواند برای محصولات نظر ثبت کند.', { code: 'FORBIDDEN' })
      const { productId, rating, comment } = parse(reviewSchema, req.body)
      if (!db.get('products').find({ id: productId }).value()) fail(404, 'محصول مورد نظر پیدا نشد')
      if (db.get('reviews').find({ productId, userId: user.id }).value()) {
        fail(409, 'شما قبلاً برای این محصول نظر ثبت کرده‌اید', { code: 'ALREADY_REVIEWED' })
      }
      const review = db
        .get('reviews')
        .insert({
          productId,
          userId: user.id,
          reviewerName: `${user.firstName} ${user.lastName}`.trim(),
          rating,
          comment,
          date: new Date().toISOString(),
        })
        .write()
      syncRating(db, productId)
      res.status(201).json(review)
    }),
  )

  return router
}
