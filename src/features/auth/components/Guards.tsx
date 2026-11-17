import { Navigate, Outlet } from 'react-router'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { useAccessGuard } from '@/features/auth/hooks/useAccessGuard'
import type { AccessRequirement } from '@/features/auth/domain/access'

function Guard({ requirement }: { requirement: AccessRequirement }) {
  const decision = useAccessGuard(requirement)
  if (decision.type === 'redirect') {
    return <Navigate to={decision.to} replace state={decision.from ? { from: decision.from } : undefined} />
  }
  if (decision.type === 'forbidden') return <ErrorState status={403} />
  return <Outlet />
}

export const RequireAuth = () => <Guard requirement="auth" />
export const RequireAdmin = () => <Guard requirement="admin" />
export const CustomerOnly = () => <Guard requirement="customer" />
