import { useRouteError } from 'react-router'
import { useSeo } from '@/shared/hooks/useSeo'

export function useRouteErrorPage() {
  const error = useRouteError()
  useSeo({ title: 'خطا', noindex: true })
  return { error, reload: () => window.location.reload() }
}
