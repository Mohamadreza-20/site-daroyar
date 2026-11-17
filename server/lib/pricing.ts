export interface PricedLine {
  price: number
  basePrice: number
  qty: number
}

export interface Totals {
  subtotal: number
  savings: number
  couponDiscount: number
  shipping: number
  total: number
  count: number
}

export { priceAfterDiscount } from '../../src/shared/domain/orderLimits.ts'

export function calcTotals(
  lines: readonly PricedLine[],
  coupon: { percent: number } | null,
  shippingMethod: { cost: number; freeFrom: number | null } | null | undefined,
): Totals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0)
  const savings = lines.reduce((sum, line) => sum + Math.max(0, line.basePrice - line.price) * line.qty, 0)
  const couponDiscount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0
  const afterDiscount = subtotal - couponDiscount
  const freeFrom = shippingMethod?.freeFrom ?? null
  const shipping =
    !lines.length || !shippingMethod || (freeFrom != null && afterDiscount >= freeFrom) ? 0 : shippingMethod.cost
  return {
    subtotal,
    savings,
    couponDiscount,
    shipping,
    total: afterDiscount + shipping,
    count: lines.reduce((sum, line) => sum + line.qty, 0),
  }
}
