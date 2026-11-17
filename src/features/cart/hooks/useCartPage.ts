import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCategoryLabelOf } from '@/features/catalog/hooks/useCategoryLabel'
import { useSeo } from '@/shared/hooks/useSeo'
import { useCartStore } from '@/features/cart/data/store'
import { useCartSummary } from '@/features/cart/data/queries'
import { canCheckout, hasBlockedLines } from '@/features/cart/domain/cartRules'

export function useCartPage() {
  useSeo({
    title: 'سبد خرید',
    description: 'اقلام انتخاب‌شدهٔ شما در فروشگاه نمایشی دارویار.',
    noindex: true,
  })
  const cart = useCartSummary()
  const categoryLabel = useCategoryLabelOf()
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)

  const onRemove = useCallback(
    (id: number | string) => {
      removeItem(id)
      toast.success('از سبد خرید حذف شد')
    },
    [removeItem],
  )

  return {
    cart,
    showSkeleton: cart.isPending && !cart.lines.some((line) => line.product),
    showError: cart.isError && !cart.isEmpty,
    canCheckout: canCheckout(cart.lines, cart.totals),
    hasBlocked: hasBlockedLines(cart.lines),
    categoryLabel,
    onQty: setQty,
    onRemove,
    onClear: clear,
  }
}
