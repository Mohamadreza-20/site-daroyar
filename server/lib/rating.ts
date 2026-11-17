import type { Db } from '../types.ts'

export function syncRating(db: Db, productId: number): void {
  const reviews = db.get('reviews').filter({ productId }).value()
  const reviewCount = reviews.length
  const rating = reviewCount
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
    : 0
  db.get('products').find({ id: productId }).assign({ rating, reviewCount }).write()
}

export function syncAllRatings(db: Db): void {
  for (const product of db.get('products').value()) syncRating(db, product.id)
}
