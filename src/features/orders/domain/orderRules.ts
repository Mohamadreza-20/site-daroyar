import { CUSTOMER_CANCELABLE, ORDER_STATUS, ORDER_TRANSITIONS } from '@/shared/domain/constants'
import type { Order, OrderStatus } from '@/shared/domain/types'

export const canCancel = (status: OrderStatus): boolean => CUSTOMER_CANCELABLE.includes(status)

export const nextStatuses = (status: OrderStatus): readonly OrderStatus[] => ORDER_TRANSITIONS[status]

export const ORDER_STATUS_FILTERS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'همه' },
  ...(Object.entries(ORDER_STATUS) as [OrderStatus, { label: string }][]).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const parseOrderStatus = (value: string | null): OrderStatus | '' =>
  value && value in ORDER_STATUS ? (value as OrderStatus) : ''

export const itemCount = (order: Order): number => order.items.reduce((n, i) => n + i.qty, 0)

export const statusChangeNotice = (next: OrderStatus): string =>
  next === 'canceled' ? 'سفارش لغو و موجودی بازگردانده شد' : 'وضعیت سفارش به‌روز شد'

export const ORDERS_ADMIN_PAGE_SIZE = 10
