import type { ProductQuery } from '@/shared/domain/types'

export const BEST_PRODUCTS: ProductQuery = { sort: 'popular', available: true, limit: 12 }
export const DEAL_PRODUCTS: ProductQuery = { sort: 'discount', discounted: true, available: true, limit: 12 }
export const NEWEST_PRODUCTS: ProductQuery = { sort: 'newest', available: true, limit: 12 }
export const HOME_ARTICLE_COUNT = 3
