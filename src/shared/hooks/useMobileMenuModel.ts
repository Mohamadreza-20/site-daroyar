import { useCallback, useState } from 'react'
import { useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth/data/store'
import { useUiStore } from '@/shared/ui/uiStore'
import { useCloseOnNavigate, useDialogA11y, useLockBodyScroll } from '@/shared/hooks/useUtils'

export function useMobileMenuModel() {
  const open = useUiStore((s) => s.menuOpen)
  const close = useUiStore((s) => s.closeMenu)
  const user = useAuthStore((s) => s.user)
  const [confirming, setConfirming] = useState(false)
  const { pathname } = useLocation()
  useLockBodyScroll(open)
  const dialogRef = useDialogA11y(open, close)

  useCloseOnNavigate(pathname, close)

  const onLogout = useCallback(() => {
    close()
    setConfirming(true)
  }, [close])
  const closeConfirm = useCallback(() => setConfirming(false), [])

  return { open, close, user, confirming, dialogRef, onLogout, closeConfirm }
}
