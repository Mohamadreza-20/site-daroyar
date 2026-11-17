import type {
  Article,
  Category,
  ContactMessage,
  Coupon,
  Order,
  Product,
  Review,
  ShippingMethod,
  User,
} from '../src/shared/domain/types.ts'

export interface UserRow extends User {
  passwordHash: string
}

export interface ProductRow extends Product {
  searchText: string
}

interface ReviewRow extends Review {
  userId?: number
}

interface SessionRow {
  id: string
  userId: number
  expiresAt: string
}

export interface WishlistRow {
  id: number
  userId: number
  productIds: number[]
}

export interface CouponRow extends Coupon {
  id: number
  active: boolean
}

interface SubscriberRow {
  id: number
  email: string
  createdAt: string
}

export type OrderRow = Omit<Order, 'coupon'> & { coupon: Pick<Coupon, 'code' | 'percent'> | null }

interface Tables {
  categories: Category
  products: ProductRow
  reviews: ReviewRow
  users: UserRow
  sessions: SessionRow
  wishlists: WishlistRow
  orders: OrderRow
  shippingMethods: ShippingMethod
  coupons: CouponRow
  articles: Article
  messages: ContactMessage
  subscribers: SubscriberRow
}

type Query<T> = Partial<T> | ((item: T) => boolean)

interface Entity<T> {
  value(): T | undefined
  assign(patch: Partial<T>): { write(): T }
}

interface Collection<T> {
  value(): T[]
  size(): { value(): number }
  find(query: Query<T>): Entity<T>
  filter(query: Query<T>): Collection<T>
  push(item: T): { write(): T[] }
  insert(item: Partial<T>): { write(): T }
  remove(query: Partial<T>): { write(): T[] }
}

export interface Db {
  get<K extends keyof Tables>(name: K): Collection<Tables[K]>
}

declare global {
  namespace Express {
    interface Request {
      user: UserRow | null
      token: string | null
      sessionExpired: boolean
    }
  }
}
