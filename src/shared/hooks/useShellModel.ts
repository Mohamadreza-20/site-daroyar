import { useEffect } from 'react'
import { useSessionSync } from '@/features/auth/hooks/useSessionSync'

export function useShellModel(): void {
  useSessionSync()
  useEffect(() => {
    const boot = document.getElementById('boot')
    if (!boot) return undefined
    boot.classList.add('is-hidden')
    const id = setTimeout(() => boot.remove(), 600)
    return () => clearTimeout(id)
  }, [])
}
