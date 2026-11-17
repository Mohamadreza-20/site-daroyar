import { toEnglishDigits } from '@/shared/domain/format'
import type { Coupon } from '@/shared/domain/types'
import type { CartLine } from '@/shared/domain/pricing'
import type { CheckoutForm } from '@/features/cart/domain/schemas'
import type { Notice } from '@/features/cart/domain/cartRules'

export interface CreateOrderPayload {
  items: { productId: number | string; qty: number }[]
  couponCode: string | null
  shippingMethodId: string
  payment: CheckoutForm['payment']
  expectedTotal: number
  shipping: Omit<CheckoutForm, 'shippingMethodId' | 'payment'>
}

export function buildOrderPayload(
  values: CheckoutForm,
  lines: readonly CartLine[],
  coupon: Pick<Coupon, 'code'> | null,
  expectedTotal: number,
): CreateOrderPayload {
  const { shippingMethodId, payment, ...address } = values
  return {
    items: lines.map((line) => ({ productId: line.id, qty: line.qty })),
    couponCode: coupon?.code ?? null,
    shippingMethodId,
    payment,
    expectedTotal,
    shipping: {
      ...address,
      phone: toEnglishDigits(address.phone),
      postalCode: toEnglishDigits(address.postalCode),
    },
  }
}

export function orderFailureNotice(failure: { code?: string; status?: number; message: string }): Notice {
  switch (failure.code) {
    case 'CART_CHANGED':
      return { level: 'error', text: 'موجودی برخی کالاها تغییر کرده است؛ سبد خرید به‌روز شد.' }
    case 'PRICE_CHANGED':
      return {
        level: 'warning',
        text: 'قیمت یا هزینهٔ ارسال تغییر کرده است؛ مبلغ جدید را بررسی و دوباره ثبت کنید.',
      }
    case 'INVALID_COUPON':
      return { level: 'error', text: 'کد تخفیف دیگر معتبر نیست؛ آن را حذف کنید.' }
    default:
      return {
        level: 'error',
        text:
          failure.status === 0
            ? 'ارتباط با سرور برقرار نیست؛ دوباره تلاش کنید'
            : failure.message || 'ثبت سفارش انجام نشد',
      }
  }
}

export const defaultCheckoutValues = (user: { firstName: string; lastName: string; phone: string } | null) => ({
  fullName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
  phone: user?.phone ?? '',
  province: '',
  city: '',
  address: '',
  postalCode: '',
  shippingMethodId: 'standard',
  payment: 'online' as const,
  note: '',
})
