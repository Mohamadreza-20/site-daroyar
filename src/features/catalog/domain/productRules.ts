import { LOW_STOCK } from '@/shared/domain/constants'
import { maxQtyFor } from '@/shared/domain/orderLimits'
import type { Product } from '@/shared/domain/types'

export type StockLevel = 'soldOut' | 'low' | 'ok'

export const isSoldOut = (product: Pick<Product, 'stock'>): boolean => product.stock <= 0

export const stockLevelOf = (stock: number): StockLevel => (stock <= 0 ? 'soldOut' : stock < LOW_STOCK ? 'low' : 'ok')

export const oldPriceOf = (product: Pick<Product, 'discount' | 'basePrice'>): number | null =>
  product.discount > 0 ? product.basePrice : null

export const maxPurchasableQty = (product: Pick<Product, 'stock'>): number => Math.max(1, maxQtyFor(product.stock))

export const seoDescriptionOf = (product: Pick<Product, 'description'>): string => product.description.slice(0, 155)

export const specRows = (product: Product, categoryLabel: string): [string, string][] =>
  (
    [
      ['برند', product.brand],
      ['دسته‌بندی', categoryLabel],
      ['کد کالا', product.sku],
    ] as [string, string][]
  ).filter(([, value]) => value)
