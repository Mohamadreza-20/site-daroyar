import { useAuthStore } from '@/features/auth/data/store'
import { useCartBadge } from '@/features/cart/data/queries'
import { useUiStore } from '@/shared/ui/uiStore'

export function useMobileTabBarModel() {
  const user = useAuthStore((s) => s.user)
  const count = useCartBadge()
  const openCart = useUiStore((s) => s.openCart)
  const accountTo = user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'
  return { authed: Boolean(user), accountTo, count, openCart }
}
