import { useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth/data/store'
import { resolveAccess, type AccessRequirement } from '@/features/auth/domain/access'

export function useAccessGuard(requirement: AccessRequirement) {
  const user = useAuthStore((s) => s.user)
  const { pathname, search } = useLocation()
  return resolveAccess(user, requirement, requirement === 'admin' ? pathname : pathname + search)
}
