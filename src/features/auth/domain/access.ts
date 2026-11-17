import type { User } from '@/shared/domain/types'

export type AccessRequirement = 'auth' | 'admin' | 'customer'

export type AccessDecision = { type: 'allow' } | { type: 'forbidden' } | { type: 'redirect'; to: string; from?: string }

export const landingPathOf = (user: Pick<User, 'role'>): string => (user.role === 'admin' ? '/admin' : '/account')

export function resolveAccess(
  user: Pick<User, 'role'> | null,
  requirement: AccessRequirement,
  currentPath: string,
): AccessDecision {
  if (requirement === 'customer') {
    return user?.role === 'admin' ? { type: 'redirect', to: '/admin' } : { type: 'allow' }
  }
  if (!user) return { type: 'redirect', to: '/login', from: currentPath }
  if (requirement === 'admin' && user.role !== 'admin') return { type: 'forbidden' }
  return { type: 'allow' }
}
