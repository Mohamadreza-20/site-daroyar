import { Outlet, ScrollRestoration } from 'react-router'
import { Toaster } from 'sonner'
import { useShellModel } from '@/shared/hooks/useShellModel'
import RouteAnnouncer from '@/shared/ui/layout/RouteAnnouncer'

export default function RootShell() {
  useShellModel()

  return (
    <>
      <Outlet />
      <RouteAnnouncer />
      <Toaster
        position="top-center"
        dir="rtl"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
      />
      <ScrollRestoration />
    </>
  )
}
