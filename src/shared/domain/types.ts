type Role = 'admin' | 'customer'

export interface User {
  id: number
  image: string
  createdAt: string
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: Role
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

export type CategoryTone = 'teal' | 'coral' | 'indigo' | 'amber'

export type CategoryIconName =
  'Sparkles' | 'Flower2' | 'SprayCan' | 'Apple' | 'Pill' | 'Droplets' | 'Leaf' | 'HeartPulse' | 'Baby' | 'Stethoscope'

export interface Category {
  id: number
  slug: string
  label: string
  tone: CategoryTone
  icon: CategoryIconName
  blurb: string
}

export interface Product {
  id: number
  title: string
  brand: string
  category: string
  description: string
  basePrice: number
  discount: number
  price: number
  stock: number
  rating: number
  reviewCount: number
  tags: string[]
  sku: string
  thumbnail: string
  images: string[]
  createdAt: string
}

export interface Review {
  id: number
  productId: number
  userId?: number
  reviewerName: string
  rating: number
  comment: string
  date: string
}

type ArticleBlock = { type: 'p' | 'h2'; text: string } | { type: 'ul'; items: string[] }

export interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  role: string
  date: string
  readTime: number
  tone: number
  icon: string
  references: { label: string; url: string }[]
  content: ArticleBlock[]
}

export type OrderStatus = 'processing' | 'packed' | 'shipped' | 'delivered' | 'canceled'
export type PaymentMethod = 'online' | 'cod'

export interface OrderItem {
  productId: number
  title: string
  thumbnail: string
  category: string
  price: number
  basePrice: number
  qty: number
}

interface OrderTotals {
  subtotal: number
  savings: number
  couponDiscount: number
  shipping: number
  total: number
  count: number
}

interface ShippingAddress {
  fullName: string
  phone: string
  note: string
  province: string
  city: string
  address: string
  postalCode: string
}

export interface Coupon {
  code: string
  percent: number
  label: string
}

export interface ShippingMethod {
  id: string
  label: string
  description: string
  cost: number
  freeFrom: number | null
}

export interface Order {
  id: string
  userId: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  history: { status: OrderStatus; at: string }[]
  items: OrderItem[]
  totals: OrderTotals
  coupon: Coupon | null
  shippingMethod: Pick<ShippingMethod, 'id' | 'label' | 'cost'>
  payment: PaymentMethod
  shipping: ShippingAddress
  customer: string
  user?: Pick<User, 'username' | 'email'>
}

export type MessageStatus = 'pending' | 'answered'

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  userId: number | null
  status: MessageStatus
  reply: string | null
  repliedAt: string | null
  createdAt: string
}

export interface CatalogMeta {
  total: number
  maxPrice: number
  counts: Record<string, number>
}

export interface AdminStats {
  products: number
  lowStock: number
  outOfStock: number
  users: number
  orders: number
  revenue: number
  byStatus: Partial<Record<OrderStatus, number>>
  byCategory: { slug: string; label: string; count: number }[]
  recentOrders: Order[]
}

export interface Paged<T> {
  items: T[]
  total: number
}

export type SortKey = 'popular' | 'newest' | 'discount' | 'cheap' | 'expensive'

export interface ProductQuery {
  q?: string
  category?: string
  maxPrice?: number
  available?: boolean
  discounted?: boolean
  sort?: SortKey
  page?: number
  limit?: number
  exclude?: number | string
  stockFrom?: number
  stockTo?: number
  ids?: (string | number)[]
}
