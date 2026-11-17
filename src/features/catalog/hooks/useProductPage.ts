import { useState } from 'react'
import { useParams } from 'react-router'
import { statusOf } from '@/shared/domain/errors'
import { useSeo } from '@/shared/hooks/useSeo'
import { productJsonLd } from '@/shared/seo/schema'
import type { Product } from '@/shared/domain/types'
import { useProduct, useRelatedProducts, useReviews } from '@/features/catalog/data/queries'
import { useCategoryLabel } from '@/features/catalog/hooks/useCategoryLabel'
import { maxPurchasableQty, oldPriceOf, seoDescriptionOf, stockLevelOf } from '@/features/catalog/domain/productRules'
import { useAddToCart } from '@/features/cart/hooks/useAddToCart'
import { useWishToggle } from '@/features/wishlist/hooks/useWishToggle'

export function useProductPage() {
  const { id } = useParams()
  const { data: product, isPending, isError, error, refetch } = useProduct(id)
  const { data: related = [] } = useRelatedProducts(product)
  const reviews = useReviews(id)
  const categoryLabel = useCategoryLabel(product?.category ?? '')
  useSeo({
    title: product?.title,
    description: product && seoDescriptionOf(product),
    image: product?.thumbnail,
    type: 'product',
    breadcrumbs: product && [
      { name: 'خانه', path: '/' },
      { name: 'فروشگاه', path: '/shop' },
      { name: product.title, path: `/product/${product.id}` },
    ],
    jsonLd: product && productJsonLd(product),
  })

  return {
    product,
    related,
    reviews,
    categoryLabel,
    isLoading: isPending && !product,
    failed: isError || !product,
    error,
    retry: statusOf(error) === 404 ? undefined : refetch,
  }
}

export function usePurchase(product: Product) {
  const [qty, setQty] = useState(1)
  const addToCart = useAddToCart(product, {
    overLimitText: 'بیشتر از سقف مجاز خرید این کالا نمی‌توانید اضافه کنید',
    describeQty: true,
  })
  const wish = useWishToggle(product.id, `/product/${product.id}`, 'برای ذخیرهٔ علاقه‌مندی‌ها وارد شوید')

  return {
    qty,
    setQty,
    max: maxPurchasableQty(product),
    stockLevel: stockLevelOf(product.stock),
    oldPrice: oldPriceOf(product),
    onAdd: () => addToCart(qty),
    ...wish,
  }
}
