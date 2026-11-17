import { Heart } from 'lucide-react'
import { useAccountWishlist } from '@/features/account/hooks/useAccountWishlist'
import ProductGrid from '@/features/catalog/components/ProductGrid'
import { EmptyState } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { PANEL_TITLE, STACK } from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { PanelWishlistSkeleton } from '@/shared/ui/loaders/PanelSkeletons'

export default function AccountWishlist() {
  const { items, pending, isError, error, retry } = useAccountWishlist()
  if (pending) return <PanelWishlistSkeleton />
  if (isError) return <ErrorState error={error} onRetry={retry} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>علاقه‌مندی‌ها</h1>
      {items.length ? (
        <ProductGrid products={items} />
      ) : (
        <EmptyState
          icon={Heart}
          title="فهرست علاقه‌مندی‌ها خالی است"
          text="با زدن آیکون قلب روی محصولات، آن‌ها را اینجا ذخیره کنید."
        >
          <Button to="/shop">مشاهدهٔ محصولات</Button>
        </EmptyState>
      )}
    </div>
  )
}
