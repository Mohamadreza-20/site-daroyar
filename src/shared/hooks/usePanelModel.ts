import { useCallback, useState } from 'react'
import { useAuthStore } from '@/features/auth/data/store'

export function usePanelModel() {
  const user = useAuthStore((s) => s.user)
  const [confirming, setConfirming] = useState(false)
  const openConfirm = useCallback(() => setConfirming(true), [])
  const closeConfirm = useCallback(() => setConfirming(false), [])
  return { user, confirming, openConfirm, closeConfirm }
}
