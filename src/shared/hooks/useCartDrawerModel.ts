import { useCallback } from 'react'
import { useLocation } from 'react-router'
import { toast } from 'sonner'
import { useCartStore } from '@/features/cart/data/store'
import { useCartSummary } from '@/features/cart/data/queries'
import { useUiStore } from '@/shared/ui/uiStore'
import { useCloseOnNavigate, useDialogA11y, useLockBodyScroll } from '@/shared/hooks/useUtils'
import { freeShippingProgress } from '@/shared/domain/pricing'

export function useCartDrawerModel() {
  const open = useUiStore((s) => s.cartOpen)
  const close = useUiStore((s) => s.closeCart)
  const cart = useCartSummary(undefined, { enabled: open })
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const { pathname } = useLocation()
  useLockBodyScroll(open)

  useCloseOnNavigate(pathname, close)

  const dialogRef = useDialogA11y(open, close)

  const onRemove = useCallback(
    (id: number | string) => {
      removeItem(id)
      toast.success('از سبد خرید حذف شد')
    },
    [removeItem],
  )

  return {
    open,
    close,
    dialogRef,
    cart,
    totals: cart.totals,
    lines: cart.lines,
    progress: freeShippingProgress(cart.totals),
    onQty: setQty,
    onRemove,
  }
}
