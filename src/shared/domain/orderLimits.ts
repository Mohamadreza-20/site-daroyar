export const MAX_QTY = 99
export const MAX_CART_LINES = 50

const MIN_DISCOUNT_PRICE_STEP = 10

const roundingStepOf = (basePrice: number): number =>
  basePrice >= 100_000 ? 1000 : basePrice >= 10_000 ? 100 : MIN_DISCOUNT_PRICE_STEP

export const priceAfterDiscount = (basePrice: number, discount = 0): number => {
  const percent = Math.min(90, Math.max(0, Number(discount) || 0))
  if (percent === 0) return basePrice
  const step = roundingStepOf(basePrice)
  const rounded = Math.round((basePrice * (1 - percent / 100)) / step) * step
  return Math.min(Math.max(step, rounded), basePrice - step)
}

export const maxQtyFor = (stock: number): number => Math.min(MAX_QTY, Math.max(0, Math.floor(Number(stock) || 0)))

export const clampQty = (qty: number, max: number = MAX_QTY): number =>
  Math.max(1, Math.min(Math.floor(Number(qty) || 1), MAX_QTY, max))
