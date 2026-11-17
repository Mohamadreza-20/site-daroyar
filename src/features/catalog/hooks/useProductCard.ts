import { useCategoryLabel } from '@/features/catalog/hooks/useCategoryLabel'
import { isSoldOut, oldPriceOf } from '@/features/catalog/domain/productRules'
import { useAddToCart } from '@/features/cart/hooks/useAddToCart'
import { useCanWish } from '@/features/wishlist/data/queries'
import { useWishToggle } from '@/features/wishlist/hooks/useWishToggle'
import type { Product } from '@/shared/domain/types'

export function useProductCard(product: Product) {
  const addToCart = useAddToCart(product)
  return {
    canWish: useCanWish(),
    categoryLabel: useCategoryLabel(product.category),
    soldOut: isSoldOut(product),
    oldPrice: oldPriceOf(product),
    onAdd: () => addToCart(1),
  }
}

export const useProductWish = (id: number) => useWishToggle(id, '/shop', 'برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید')
