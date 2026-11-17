import { useCallback, useState, type SyntheticEvent } from 'react'
import { toast } from 'sonner'
import { statusOf } from '@/shared/domain/errors'
import { useApplyCoupon } from '@/features/orders/data/queries'
import { useCart, useCartStore } from '@/features/cart/data/store'
import { couponFailureMessage } from '@/features/cart/domain/cartRules'

export function useCouponBox() {
  const { coupon } = useCart()
  const setCoupon = useCartStore((s) => s.setCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const apply = useApplyCoupon()
  const [code, setCode] = useState('')

  const onApply = useCallback(
    (event?: SyntheticEvent) => {
      event?.preventDefault()
      if (!code.trim() || apply.isPending) return
      apply.mutate(code, {
        onSuccess: (result) => {
          setCoupon(result)
          toast.success('کد تخفیف اعمال شد')
          setCode('')
        },
        onError: (error) => toast.error(couponFailureMessage(statusOf(error))),
      })
    },
    [code, apply, setCoupon],
  )

  return { coupon, code, setCode, onApply, removeCoupon, isPending: apply.isPending }
}
