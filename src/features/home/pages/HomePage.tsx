import { lazy, Suspense } from 'react'
import type { Product } from '@/shared/domain/types'
import { useHomePage } from '@/features/home/hooks/useHomePage'
import Hero from '@/features/home/components/Hero'
import TrustBar from '@/features/home/components/TrustBar'
import type { FeaturedProductsProps } from '@/features/home/components/FeaturedProducts'
import { SectionSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import ErrorState from '@/shared/ui/feedback/ErrorState'

const CategorySection = lazy(() => import('@/features/home/components/CategorySection'))
const FeaturedProducts = lazy(() => import('@/features/home/components/FeaturedProducts'))
const OfferBanner = lazy(() => import('@/features/home/components/OfferBanner'))
const WhyUs = lazy(() => import('@/features/home/components/WhyUs'))
const HomeArticles = lazy(() => import('@/features/home/components/HomeArticles'))
const Testimonials = lazy(() => import('@/features/home/components/Testimonials'))
const Faq = lazy(() => import('@/features/home/components/Faq'))
const Newsletter = lazy(() => import('@/features/home/components/Newsletter'))

interface SectionProps extends Omit<FeaturedProductsProps, 'products'> {
  isPending: boolean
  products: Product[]
}

function Section({ isPending, products, ...props }: SectionProps) {
  if (isPending) return <SectionSkeleton height={380} />
  return (
    <Suspense fallback={<SectionSkeleton height={380} />}>
      <FeaturedProducts {...props} products={products} />
    </Suspense>
  )
}

export default function HomePage() {
  const { best, deals, newest, dealProduct, counts, articles, error, hasError, retry } = useHomePage()

  if (hasError) return <ErrorState error={error} onRetry={retry} />

  return (
    <div>
      <h1 className="sr-only">دارویار؛ فروشگاه نمایشی مراقبت روزانه</h1>
      <Hero />
      <TrustBar />
      <Suspense fallback={<SectionSkeleton height={420} />}>
        <CategorySection counts={counts} />
      </Suspense>
      <Section
        {...best}
        id="best"
        eyebrow="منتخب داده‌های نمونه"
        title="محصولات برگزیدهٔ نمونه"
        text="بر اساس امتیاز داده‌های نمایشی."
      />
      <Suspense fallback={<SectionSkeleton height={280} />}>
        <OfferBanner product={dealProduct} />
      </Suspense>
      <Section
        {...deals}
        id="deals"
        eyebrow="تخفیف‌های ویژه"
        title="فرصت‌های امروز"
        text="محصولات با بیشترین تخفیف."
        to="/shop?sort=discount"
      />
      <Suspense fallback={<SectionSkeleton />}>
        <WhyUs />
      </Suspense>
      <Section {...newest} id="new" eyebrow="تازه‌ها" title="جدیدترین محصولات" to="/shop?sort=newest" />
      <Suspense fallback={<SectionSkeleton height={300} />}>
        <HomeArticles articles={articles} />
        <Testimonials />
        <Faq />
        <Newsletter />
      </Suspense>
    </div>
  )
}
