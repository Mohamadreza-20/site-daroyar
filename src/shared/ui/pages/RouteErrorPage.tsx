import { useRouteErrorPage } from '@/shared/hooks/useRouteErrorPage'
import Header from '@/shared/ui/layout/Header'
import ErrorState from '@/shared/ui/feedback/ErrorState'

export default function RouteErrorPage() {
  const { error, reload } = useRouteErrorPage()
  return (
    <>
      <Header />
      <main className="site-main">
        <ErrorState error={error} onRetry={reload} />
      </main>
    </>
  )
}
