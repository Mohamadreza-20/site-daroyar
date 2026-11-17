import { memo } from 'react'
import BrandLoader from '@/shared/ui/loaders/BrandLoader'
import { cn } from '@/shared/ui/lib/cn'
import { ProductGridSkeleton, Sk, SK_CENTER, SK_ROW, SK_ROW_3, SK_STACK } from '@/shared/ui/loaders/Skeleton'

export const PanelOverviewSkeleton = memo(function PanelOverviewSkeleton() {
  return (
    <div aria-busy="true" className={SK_STACK}>
      <Sk h={150} r={26} />
      <div className={cn(SK_ROW, SK_ROW_3)}>
        {Array.from({ length: 3 }, (_, i) => (
          <Sk key={i} h={104} r={22} />
        ))}
      </div>
      <Sk h={240} r={24} />
    </div>
  )
})

export const PanelOrdersSkeleton = memo(function PanelOrdersSkeleton() {
  return (
    <div aria-busy="true" className={SK_STACK}>
      <div className={cn(SK_CENTER, 'm-0')}>
        <BrandLoader variant="drops" label="در حال یافتن سفارش‌ها…" />
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <Sk key={i} h={130} r={22} />
      ))}
    </div>
  )
})

export const PanelWishlistSkeleton = memo(function PanelWishlistSkeleton() {
  return (
    <div aria-busy="true">
      <ProductGridSkeleton count={6} />
    </div>
  )
})
