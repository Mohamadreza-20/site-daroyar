import { useEffect } from 'react'
import { toast } from 'sonner'
import { useMe } from '@/features/auth/data/queries'
import { useAuthStore } from '@/features/auth/data/store'

export function useSessionSync(): void {
  const token = useAuthStore((s) => s.token)
  const updateUser = useAuthStore((s) => s.updateUser)
  const expired = useAuthStore((s) => s.sessionExpired)
  const me = useMe(Boolean(token))

  useEffect(() => {
    const fresh = me.data?.user
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(useAuthStore.getState().user)) updateUser(fresh)
  }, [me.data, updateUser])

  useEffect(() => {
    if (expired) toast.warning('نشست شما منقضی شد؛ برای ادامه دوباره وارد شوید.', { id: 'session-expired' })
  }, [expired])
}
