import { useCallback } from 'react'
import { formatNumber } from '@/shared/domain/format'
import { maxQtyFor } from '@/shared/domain/orderLimits'
import type { Product } from '@/shared/domain/types'
import { useCartStore } from '@/features/cart/data/store'
import { addToCartNotice } from '@/features/cart/domain/cartRules'
import { notify } from '@/features/cart/hooks/useNotify'

interface Options {
  overLimitText?: string
  describeQty?: boolean
}

export function useAddToCart(product: Pick<Product, 'id' | 'stock' | 'title'> | undefined, options: Options = {}) {
  const addItem = useCartStore((s) => s.addItem)
  const { overLimitText, describeQty } = options
  return useCallback(
    (qty = 1) => {
      if (!product) return
      const addedDescription = describeQty
        ? `${formatNumber(Math.min(qty, maxQtyFor(product.stock)))} عدد ${product.title}`
        : undefined
      notify(addToCartNotice(addItem(product, qty), product.title, { overLimitText, addedDescription }))
    },
    [addItem, product, overLimitText, describeQty],
  )
}
