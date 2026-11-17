import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router'
import Header from '@/shared/ui/layout/Header'
import Footer from '@/shared/ui/layout/Footer'
import Deferred from '@/shared/ui/common/Deferred'
import { useUiStore } from '@/shared/ui/uiStore'
import MobileTabBar from '@/shared/ui/layout/MobileTabBar'
import BrandLoader from '@/shared/ui/loaders/BrandLoader'
import OfflineBanner from '@/shared/ui/feedback/OfflineBanner'

const CartDrawer = lazy(() => import('@/shared/ui/layout/CartDrawer'))
const MobileMenu = lazy(() => import('@/shared/ui/layout/MobileMenu'))

export default function RootLayout() {
  const cartOpen = useUiStore((s) => s.cartOpen)
  const menuOpen = useUiStore((s) => s.menuOpen)
  return (
    <>
      <a
        href="#main"
        className="fixed -top-[60px] start-4 z-[200] rounded-[12px] bg-ink px-4 py-2.5 text-white [transition:top_0.2s] focus:top-3"
      >
        پرش به محتوای اصلی
      </a>
      <Header />
      <main id="main" className="min-h-svh">
        <Suspense
          fallback={
            <div className="grid min-h-[60svh] place-items-center">
              <BrandLoader variant="cross" label="لحظه‌ای صبر کنید…" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Deferred when={cartOpen}>
        <CartDrawer />
      </Deferred>
      <Deferred when={menuOpen}>
        <MobileMenu />
      </Deferred>
      <MobileTabBar />
      <OfflineBanner />
    </>
  )
}
