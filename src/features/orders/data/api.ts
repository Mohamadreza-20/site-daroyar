import { api, totalOf } from '@/shared/data/client'
import { assetUrl } from '@/shared/data/assets'
import type { Coupon, Order, OrderStatus, Paged, ShippingMethod } from '@/shared/domain/types'
import type { CreateOrderPayload } from '@/features/cart/domain/checkout'

const normalizeOrder = (order: Order): Order => ({
  ...order,
  items: order.items.map((item) => ({ ...item, thumbnail: assetUrl(item.thumbnail) })),
})

export async function fetchOrders(params: object = {}, signal?: AbortSignal): Promise<Paged<Order>> {
  const response = await api.get<Order[]>('/orders', { params, signal })
  return { items: response.data.map(normalizeOrder), total: totalOf(response) }
}

export const fetchOrder = (id: string, signal?: AbortSignal) =>
  api.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal }).then((r) => normalizeOrder(r.data))

export const createOrder = (payload: CreateOrderPayload) =>
  api.post<Order>('/orders', payload).then((r) => normalizeOrder(r.data))

export const cancelOrder = (id: string) =>
  api.post<Order>(`/orders/${encodeURIComponent(id)}/cancel`).then((r) => normalizeOrder(r.data))

export const updateOrderStatus = ({ id, status }: { id: string; status: OrderStatus }) =>
  api.patch<Order>(`/orders/${encodeURIComponent(id)}/status`, { status }).then((r) => normalizeOrder(r.data))

export const validateCoupon = (code: string) => api.post<Coupon>('/coupons/validate', { code }).then((r) => r.data)

export const fetchShippingMethods = (signal?: AbortSignal) =>
  api.get<ShippingMethod[]>('/shippingMethods', { signal }).then((r) => r.data)
