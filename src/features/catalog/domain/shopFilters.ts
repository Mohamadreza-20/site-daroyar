import { SORT_OPTIONS } from '@/shared/domain/constants'
import type { ProductQuery, SortKey } from '@/shared/domain/types'

export const SHOP_PAGE_SIZE = 12
const PRICE_BOUND_STEP = 100000

export interface ShopFilters {
  q: string
  category: string
  sort: SortKey
  maxPrice: number
  onlyAvailable: boolean
  onlyDiscount: boolean
}

const isSortKey = (value: string | null): value is SortKey => SORT_OPTIONS.some((option) => option.value === value)

export function parseShopFilters(params: URLSearchParams): ShopFilters {
  const sort = params.get('sort')
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    sort: isSortKey(sort) ? sort : 'popular',
    maxPrice: Number(params.get('max')) || 0,
    onlyAvailable: params.get('available') === '1',
    onlyDiscount: params.get('discount') === '1',
  }
}

export const toProductQuery = (filters: ShopFilters, page: number): ProductQuery => ({
  q: filters.q,
  category: filters.category,
  maxPrice: filters.maxPrice,
  available: filters.onlyAvailable,
  discounted: filters.onlyDiscount,
  sort: filters.sort,
  page,
  limit: SHOP_PAGE_SIZE,
})

export const priceBoundsOf = (maxPrice: number | undefined): number =>
  maxPrice ? Math.ceil(maxPrice / PRICE_BOUND_STEP) * PRICE_BOUND_STEP : 0

export function shopSeo(categoryLabel: string | undefined) {
  return {
    title: categoryLabel ?? 'فروشگاه',
    description: categoryLabel
      ? `خرید نمایشی محصولات ${categoryLabel} در دارویار؛ فیلتر بر اساس قیمت، موجودی و تخفیف.`
      : 'فهرست محصولات نمایشی دارویار؛ جستجو، فیلتر و مرتب‌سازی بر اساس دسته، قیمت، موجودی و تخفیف.',
  }
}

export const sortPatch = (value: SortKey): { sort: string } => ({ sort: value === 'popular' ? '' : value })
