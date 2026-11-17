import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useLogout } from '@/features/auth/data/queries'

export function useLogoutFlow(onClose: () => void) {
  const { mutate: logout } = useLogout()
  const navigate = useNavigate()

  return useCallback(() => {
    onClose()
    void navigate('/', { replace: true })
    logout(undefined, { onSettled: () => toast.success('با موفقیت خارج شدید') })
  }, [logout, navigate, onClose])
}
