import { useSeo } from '@/shared/hooks/useSeo'
import { useAuthStore } from '@/features/auth/data/store'
import { useOrders } from '@/features/orders/data/queries'
import { useWishlistIds } from '@/features/wishlist/data/queries'
import { useCartBadge } from '@/features/cart/data/queries'
import { recentOrders, totalSpent } from '@/features/account/domain/accountRules'

export function useAccountOverview() {
  useSeo({ title: 'پنل کاربری', noindex: true })
  const firstName = useAuthStore((s) => s.user?.firstName)
  const { data, isPending, isError, error, refetch } = useOrders({ _page: 1, _limit: 100 })
  const wishCount = useWishlistIds().length
  const cartCount = useCartBadge()
  const orders = data?.items ?? []
  return {
    firstName,
    isPending,
    isError,
    error,
    refetch,
    orderCount: orders.length,
    spent: totalSpent(orders),
    wishCount,
    cartCount,
    recent: recentOrders(orders),
  }
}
