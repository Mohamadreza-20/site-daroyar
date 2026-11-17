import type { ProductQuery } from '@/shared/domain/types'

type Id = string | number

export const keys = {
  products: ['products'] as const,
  productList: (params: ProductQuery) => ['products', 'list', params] as const,
  productIds: (ids: readonly string[]) => ['products', 'ids', ids] as const,
  product: (id: Id) => ['products', 'detail', String(id)] as const,
  related: (id: Id | undefined) => ['products', 'related', String(id)] as const,
  reviews: (id: Id) => ['reviews', String(id)] as const,
  categories: ['categories'] as const,
  catalogMeta: ['catalog', 'meta'] as const,
  shipping: ['shippingMethods'] as const,
  articles: ['articles'] as const,
  article: (slug: string) => ['articles', slug] as const,
  me: ['me'] as const,
  wishlist: ['wishlist'] as const,
  orders: ['orders'] as const,
  orderList: (params: object) => ['orders', 'list', params] as const,
  order: (id: Id) => ['orders', 'detail', String(id)] as const,
  myMessages: ['messages', 'mine'] as const,
  messages: ['messages'] as const,
  adminMessages: (params: object) => ['admin', 'messages', params] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (params: object) => ['admin', 'users', params] as const,
}
