import { lazy, memo, Suspense } from 'react'
import { Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import type { Product } from '@/shared/domain/types'
import { Badge, Breadcrumb, Price, QuantityControl, Rating, SectionHeading } from '@/shared/ui/common/Primitives'
import Button, { ICON_BTN } from '@/shared/ui/common/Button'
import { DEMO_NOTE } from '@/shared/ui/common/styles'
import ProductGallery from '@/features/catalog/components/ProductGallery'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { ProductSkeleton, SectionSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import { cn } from '@/shared/ui/lib/cn'
import { formatNumber } from '@/shared/domain/format'
import { useProductPage, usePurchase } from '@/features/catalog/hooks/useProductPage'

const ProductTabs = lazy(() => import('@/features/catalog/components/ProductTabs'))
const ProductCarousel = lazy(() => import('@/features/catalog/components/ProductCarousel'))

const Purchase = memo(function Purchase({ product }: { product: Product }) {
  const { qty, setQty, max, stockLevel, oldPrice, onAdd, wished, canWish, onToggle } = usePurchase(product)
  const soldOut = stockLevel === 'soldOut'

  return (
    <div className="grid w-full gap-3.5 rounded-lg border border-line bg-surface p-[22px] shadow-sm">
      <Price price={product.price} oldPrice={oldPrice} large />
      <p
        className={cn(
          'text-[13.5px] font-bold',
          soldOut ? 'text-danger' : stockLevel === 'low' ? 'text-warn' : 'text-success',
        )}
      >
        {soldOut
          ? 'ناموجود'
          : stockLevel === 'low'
            ? `فقط ${formatNumber(product.stock)} عدد در انبار`
            : 'موجود در انبار'}
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <QuantityControl value={qty} max={max} onChange={setQty} />
        <Button
          size="lg"
          className="min-w-[180px] flex-1"
          onClick={onAdd}
          disabled={soldOut}
          icon={<ShoppingBag size={20} />}
        >
          افزودن به سبد خرید
        </Button>
        {canWish && (
          <button
            type="button"
            className={cn(
              ICON_BTN,
              'border-[1.5px] border-line',
              wished && 'border-danger text-danger [&_svg]:fill-danger',
            )}
            onClick={onToggle}
            aria-pressed={wished}
            aria-label="علاقه‌مندی"
          >
            <Heart size={22} />
          </button>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-[18px] gap-y-2 border-t border-dashed border-line pt-3 text-[13px] text-muted [&_svg]:text-primary">
        <li className="flex items-center gap-1.5">
          <Truck size={18} /> ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان
        </li>
        <li className="flex items-center gap-1.5">
          <ShieldCheck size={18} /> اطلاعات محصول نمونه است
        </li>
        <li className="flex items-center gap-1.5">
          <RotateCcw size={18} /> خرید و مرجوعی نمایشی
        </li>
      </ul>
    </div>
  )
})

export default function ProductPage() {
  const { product, related, reviews, categoryLabel, isLoading, failed, error, retry } = useProductPage()

  if (isLoading) return <ProductSkeleton />
  if (failed || !product) return <ErrorState error={error} onRetry={retry} />

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb
        items={[
          { label: 'خانه', to: '/' },
          { label: 'فروشگاه', to: '/shop' },
          { label: categoryLabel, to: `/shop?category=${product.category}` },
          { label: product.title },
        ]}
      />
      <div className="grid grid-cols-2 items-start gap-[clamp(24px,4vw,56px)] max-[1025px]:grid-cols-1">
        <ProductGallery images={product.images} title={product.title} discount={product.discount} />
        <div className="grid justify-items-start gap-3.5">
          <Badge>{categoryLabel}</Badge>
          <h1 dir="auto" className="text-[clamp(20px,2.6vw,28px)] leading-[1.6]">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-muted">
            {product.reviewCount > 0 && <Rating value={product.rating} count={product.reviewCount} />}
            <span>
              برند:{' '}
              <b dir="auto" className="text-ink">
                {product.brand}
              </b>
            </span>
          </div>
          <p className="line-clamp-2 leading-[2] text-muted" dir="auto">
            {product.description}
          </p>
          {product.stock <= 0 && (
            <p className={DEMO_NOTE} role="status">
              این محصول فعلاً ناموجود است. می‌توانید از محصولات مشابه زیر انتخاب کنید.
            </p>
          )}
          <Purchase key={product.id} product={product} />
        </div>
      </div>
      <Suspense fallback={<SectionSkeleton height={260} />}>
        <ProductTabs product={product} categoryLabel={categoryLabel} reviews={reviews} />
      </Suspense>
      {related.length > 0 && (
        <section className="section-y">
          <SectionHeading
            eyebrow="پیشنهاد"
            title={product.stock > 0 ? 'محصولات مشابه' : 'جایگزین‌های موجود'}
            to={`/shop?category=${product.category}`}
          />
          <Suspense fallback={<SectionSkeleton height={320} />}>
            <ProductCarousel id="related" products={related} />
          </Suspense>
        </section>
      )}
    </div>
  )
}
