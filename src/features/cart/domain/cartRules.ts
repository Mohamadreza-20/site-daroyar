import { MAX_CART_LINES } from '@/shared/domain/orderLimits'
import { formatNumber } from '@/shared/domain/format'
import type { CartLine, CartTotals } from '@/shared/domain/pricing'

export type AddResult = 'added' | 'limited' | 'limit' | 'full' | 'unavailable'

export interface Notice {
  level: 'success' | 'warning' | 'error' | 'info'
  text: string
  description?: string
}

export function addToCartNotice(
  result: AddResult,
  title: string,
  options: { overLimitText?: string; addedDescription?: string } = {},
): Notice {
  switch (result) {
    case 'unavailable':
      return { level: 'error', text: 'این محصول در حال حاضر موجود نیست' }
    case 'limit':
      return { level: 'warning', text: options.overLimitText ?? 'موجودی این محصول در سبد خرید به سقف رسیده است' }
    case 'full':
      return { level: 'warning', text: `سبد خرید حداکثر ${formatNumber(MAX_CART_LINES)} کالای متفاوت می‌پذیرد` }
    case 'limited':
      return { level: 'warning', text: 'تعداد به سقف مجاز خرید محدود شد', description: title }
    default:
      return { level: 'success', text: 'به سبد خرید اضافه شد', description: options.addedDescription ?? title }
  }
}

export const couponFailureMessage = (status: number | undefined): string =>
  status === 404 ? 'کد تخفیف معتبر نیست' : 'بررسی کد تخفیف انجام نشد؛ دوباره تلاش کنید'

export const hasBlockedLines = (lines: readonly CartLine[]): boolean => lines.some((line) => !line.available)

export const canCheckout = (lines: readonly CartLine[], totals: Pick<CartTotals, 'count'>): boolean =>
  totals.count > 0 && !hasBlockedLines(lines)
