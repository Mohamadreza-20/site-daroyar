import { memo } from 'react'
import type { Product } from '@/shared/domain/types'
import ProductCard from '@/features/catalog/components/ProductCard'

const EAGER_COUNT = 4

const ProductGrid = memo(function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul
      key={products.map((p) => p.id).join('-')}
      className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 max-[640px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[640px]:gap-3"
    >
      {products.map((p, index) => (
        <li key={p.id} className={index < EAGER_COUNT ? undefined : 'animate-page-in'}>
          <ProductCard product={p} priority={index < EAGER_COUNT} />
        </li>
      ))}
    </ul>
  )
})

export default ProductGrid
