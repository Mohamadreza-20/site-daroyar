import { memo } from 'react'
import type { Product } from '@/shared/domain/types'
import { SectionHeading } from '@/shared/ui/common/Primitives'
import ProductCarousel from '@/features/catalog/components/ProductCarousel'

export interface FeaturedProductsProps {
  id: string
  eyebrow: string
  title: string
  text?: string
  products: Product[]
  to?: string
}

const FeaturedProducts = memo(function FeaturedProducts({
  id,
  eyebrow,
  title,
  text,
  products,
  to = '/shop',
}: FeaturedProductsProps) {
  if (!products.length) return null
  return (
    <section className="section-y site-container">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} to={to} />
      <ProductCarousel id={id} products={products} />
    </section>
  )
})

export default FeaturedProducts
