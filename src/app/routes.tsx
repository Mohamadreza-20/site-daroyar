import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import RootShell from '@/shared/ui/layout/RootShell'
import RootLayout from '@/shared/ui/layout/RootLayout'
import HomePage from '@/features/home/pages/HomePage'
import RouteErrorPage from '@/shared/ui/pages/RouteErrorPage'
import { LoginSkeleton, RegisterSkeleton } from '@/shared/ui/loaders/AuthSkeletons'
import { CustomerOnly, RequireAdmin, RequireAuth } from '@/features/auth/components/Guards'

const ShopPage = lazy(() => import('@/features/catalog/pages/ShopPage'))
const ProductPage = lazy(() => import('@/features/catalog/pages/ProductPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/features/cart/pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/features/orders/pages/OrderSuccessPage'))
const ArticlesPage = lazy(() => import('@/features/articles/pages/ArticlesPage'))
const ArticlePage = lazy(() => import('@/features/articles/pages/ArticlePage'))
const ContactPage = lazy(() => import('@/features/contact/pages/ContactPage'))
const NotFoundPage = lazy(() => import('@/shared/ui/pages/NotFoundPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))

const AccountLayout = lazy(() => import('@/features/account/pages/AccountLayout'))
const AccountOverview = lazy(() => import('@/features/account/pages/AccountOverview'))
const AccountOrders = lazy(() => import('@/features/account/pages/AccountOrders'))
const AccountOrderDetail = lazy(() => import('@/features/account/pages/AccountOrderDetail'))
const AccountWishlist = lazy(() => import('@/features/account/pages/AccountWishlist'))
const AccountMessages = lazy(() => import('@/features/account/pages/AccountMessages'))
const AccountProfile = lazy(() => import('@/features/account/pages/AccountProfile'))

const AdminLayout = lazy(() => import('@/features/admin/pages/AdminLayout'))
const AdminOverview = lazy(() => import('@/features/admin/pages/AdminOverview'))
const AdminProducts = lazy(() => import('@/features/admin/pages/AdminProducts'))
const AdminCategories = lazy(() => import('@/features/admin/pages/AdminCategories'))
const AdminOrders = lazy(() => import('@/features/admin/pages/AdminOrders'))
const AdminMessages = lazy(() => import('@/features/admin/pages/AdminMessages'))
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers'))

const authPage = (page: ReactNode, skeleton: ReactNode) => (
  <Suspense fallback={<div className="grid min-h-screen place-items-center p-6">{skeleton}</div>}>{page}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <RootShell />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'shop', element: <ShopPage /> },
          { path: 'product/:id', element: <ProductPage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'articles', element: <ArticlesPage /> },
          { path: 'articles/:slug', element: <ArticlePage /> },
          { path: 'contact', element: <ContactPage /> },
          {
            element: <RequireAuth />,
            children: [
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'order-success/:id', element: <OrderSuccessPage /> },
              {
                element: <CustomerOnly />,
                children: [
                  {
                    path: 'account',
                    element: <AccountLayout />,
                    children: [
                      { index: true, element: <AccountOverview /> },
                      { path: 'orders', element: <AccountOrders /> },
                      { path: 'orders/:id', element: <AccountOrderDetail /> },
                      { path: 'wishlist', element: <AccountWishlist /> },
                      { path: 'messages', element: <AccountMessages /> },
                      { path: 'profile', element: <AccountProfile /> },
                    ],
                  },
                ],
              },
            ],
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: 'admin',
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminOverview /> },
                  { path: 'products', element: <AdminProducts /> },
                  { path: 'categories', element: <AdminCategories /> },
                  { path: 'orders', element: <AdminOrders /> },
                  { path: 'messages', element: <AdminMessages /> },
                  { path: 'users', element: <AdminUsers /> },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      { path: 'login', element: authPage(<LoginPage />, <LoginSkeleton />) },
      { path: 'register', element: authPage(<RegisterPage />, <RegisterSkeleton />) },
    ],
  },
])
