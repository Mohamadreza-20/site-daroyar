import type { Order } from '@/shared/domain/types'

export const totalSpent = (orders: Order[]): number =>
  orders.filter((o) => o.status !== 'canceled').reduce((n, o) => n + o.totals.total, 0)

export const recentOrders = (orders: Order[], limit = 3): Order[] => orders.slice(0, limit)

export const ORDERS_PAGE_SIZE = 5
