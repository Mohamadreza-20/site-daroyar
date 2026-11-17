import { maxQtyFor } from '@/shared/domain/orderLimits'
import type { Coupon, Product, ShippingMethod } from '@/shared/domain/types'

export type CartLoadState = 'ok' | 'loading' | 'error'

export interface CartLine {
  id: number | string
  product: Product | null
  pending: boolean
  unknown: boolean
  requestedQty: number
  qty: number
  stock: number
  maxQty: number
  available: boolean
  limited: boolean
  price: number
  basePrice: number
}

export interface CartTotals {
  subtotal: number
  savings: number
  couponDiscount: number
  shipping: number
  total: number
  count: number
  remainingForFree: number
  freeFrom: number | null
}

export function buildCartLines(
  items: readonly { id: number | string; qty: number }[],
  products: readonly Product[],
  state: CartLoadState = 'ok',
): CartLine[] {
  const byId = new Map(products.map((product) => [String(product.id), product]))
  return items.map((item) => {
    const product = byId.get(String(item.id)) ?? null
    const stock = Math.max(0, Number(product?.stock) || 0)
    const maxQty = maxQtyFor(stock)
    const available = product !== null && maxQty > 0
    const qty = available ? Math.min(item.qty, maxQty) : 0
    return {
      id: item.id,
      product,
      pending: !product && state === 'loading',
      unknown: !product && state === 'error',
      requestedQty: item.qty,
      qty,
      stock,
      maxQty,
      available,
      limited: available && qty < item.qty,
      price: product?.price ?? 0,
      basePrice: product?.basePrice ?? product?.price ?? 0,
    }
  })
}

export function calcTotals(
  lines: readonly CartLine[],
  coupon: Pick<Coupon, 'percent'> | null,
  shippingMethod: Pick<ShippingMethod, 'cost' | 'freeFrom'> | null,
): CartTotals {
  const payable = lines.filter((line) => line.available)
  const subtotal = payable.reduce((sum, line) => sum + line.price * line.qty, 0)
  const savings = payable.reduce((sum, line) => sum + Math.max(0, line.basePrice - line.price) * line.qty, 0)
  const couponDiscount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0
  const afterDiscount = subtotal - couponDiscount
  const freeFrom = shippingMethod?.freeFrom ?? null
  const shipping =
    !payable.length || !shippingMethod || (freeFrom != null && afterDiscount >= freeFrom) ? 0 : shippingMethod.cost
  return {
    subtotal,
    savings,
    couponDiscount,
    shipping,
    total: afterDiscount + shipping,
    count: payable.reduce((sum, line) => sum + line.qty, 0),
    remainingForFree: freeFrom == null ? 0 : Math.max(0, freeFrom - afterDiscount),
    freeFrom,
  }
}

export function freeShippingProgress(
  totals: Pick<CartTotals, 'subtotal' | 'couponDiscount' | 'remainingForFree'>,
): number {
  const paid = totals.subtotal - totals.couponDiscount
  return Math.min(100, Math.round((paid / (paid + totals.remainingForFree || 1)) * 100))
}
