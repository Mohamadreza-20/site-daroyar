import { LOW_STOCK } from '@/shared/domain/constants'
import { toEnglishDigits } from '@/shared/domain/format'
import type { BadgeTone } from '@/shared/domain/constants'
import type { Product } from '@/shared/domain/types'
import type { ProductFormInput } from '@/features/admin/domain/schemas'

export const PRODUCTS_PAGE_SIZE = 10

export type StockFilter = '' | 'available' | 'low' | 'out'

const STOCK_FILTERS: Record<StockFilter, { stockFrom?: number; stockTo?: number }> = {
  '': {},
  available: { stockFrom: 1 },
  low: { stockFrom: 1, stockTo: LOW_STOCK - 1 },
  out: { stockTo: 0 },
}

export const parseStockFilter = (value: string): StockFilter => (value in STOCK_FILTERS ? (value as StockFilter) : '')

export const stockRange = (filter: StockFilter) => STOCK_FILTERS[filter]

export const stockTone = (stock: number): BadgeTone => (stock === 0 ? 'danger' : stock < LOW_STOCK ? 'warn' : 'success')

export function parseStockInput(raw: string): number | null {
  const stock = Number(toEnglishDigits(raw))
  return Number.isInteger(stock) && stock >= 0 ? stock : null
}

const EMPTY: ProductFormInput = {
  title: '',
  brand: '',
  category: '',
  basePrice: '',
  discount: 0,
  stock: 10,
  thumbnail: '',
  description: '',
}

export const productToForm = (p: Product | null): ProductFormInput =>
  p
    ? {
        title: p.title,
        brand: p.brand,
        category: p.category,
        basePrice: p.basePrice,
        discount: p.discount,
        stock: p.stock,
        thumbnail: p.thumbnail,
        description: p.description,
      }
    : EMPTY
