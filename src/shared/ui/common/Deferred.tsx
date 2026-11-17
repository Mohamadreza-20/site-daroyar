import { Suspense, type ReactNode } from 'react'
import { useEverTrue } from '@/shared/hooks/useUtils'

interface DeferredProps {
  when: boolean
  fallback?: ReactNode
  children: ReactNode
}

export default function Deferred({ when, fallback = null, children }: DeferredProps) {
  const armed = useEverTrue(when)
  return armed ? <Suspense fallback={fallback}>{children}</Suspense> : null
}
