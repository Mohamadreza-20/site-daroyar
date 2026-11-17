import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/data/store'
import { useCanWish, useIsWished, useToggleWishlist } from '@/features/wishlist/data/queries'

export function useWishToggle(id: number, returnTo: string, loginPrompt: string) {
  const wished = useIsWished(id)
  const canWish = useCanWish()
  const authed = useAuthStore((s) => Boolean(s.user))
  const { mutate: toggle } = useToggleWishlist()
  const navigate = useNavigate()

  const onToggle = useCallback(() => {
    if (!authed) {
      toast.info(loginPrompt)
      void navigate('/login', { state: { from: returnTo } })
      return
    }
    toggle(
      { id, wished },
      {
        onSuccess: () => toast.success(wished ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد'),
        onError: () => toast.error('ذخیرهٔ علاقه‌مندی انجام نشد؛ دوباره تلاش کنید'),
      },
    )
  }, [authed, navigate, toggle, id, wished, returnTo, loginPrompt])

  return { wished, canWish, onToggle }
}
