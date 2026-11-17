import { useSeo } from '@/shared/hooks/useSeo'
import { useProducts } from '@/features/catalog/data/queries'
import { useWishlist } from '@/features/wishlist/data/queries'

const NO_IDS: number[] = []

export function useAccountWishlist() {
  useSeo({ title: 'علاقه‌مندی‌ها', noindex: true })
  const wishlist = useWishlist()
  const ids = wishlist.data ?? NO_IDS
  const hasIds = ids.length > 0
  const products = useProducts({ ids, limit: Math.max(ids.length, 1) }, { enabled: hasIds })
  const items = hasIds ? (products.data?.items ?? []).filter((p) => ids.includes(p.id)) : []
  const pending = wishlist.isPending || (hasIds && products.isPending)
  const failed = wishlist.isError ? wishlist : hasIds && products.isError ? products : null
  return {
    items,
    pending,
    error: failed ? failed.error : null,
    isError: failed !== null,
    retry: failed ? failed.refetch : undefined,
  }
}
