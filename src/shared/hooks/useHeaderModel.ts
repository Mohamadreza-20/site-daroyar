import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/data/store'
import { useCartBadge } from '@/features/cart/data/queries'
import { useCanWish, useWishlistIds } from '@/features/wishlist/data/queries'
import { useUiStore } from '@/shared/ui/uiStore'
import type { User } from '@/shared/domain/types'

const panelPathOf = (user: Pick<User, 'role'> | null | undefined): string =>
  user?.role === 'admin' ? '/admin' : '/account'

export function useHeaderModel() {
  const user = useAuthStore((s) => s.user)
  const openMenu = useUiStore((s) => s.openMenu)
  const canWish = useCanWish()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { user, openMenu, canWish, scrolled, panelTo: panelPathOf(user) }
}

export function useCartButtonModel() {
  const count = useCartBadge()
  const openCart = useUiStore((s) => s.openCart)
  return { count, openCart }
}

export function useWishButtonModel() {
  return { count: useWishlistIds().length }
}
