import type { QueryClient } from '@tanstack/react-query'
import { warmQuery } from '@/shared/data/warmQuery'
import { articlesOptions } from '@/features/articles/data/queries'
import { catalogMetaOptions, categoriesOptions, productListOptions } from '@/features/catalog/data/queries'
import { parseShopFilters, toProductQuery } from '@/features/catalog/domain/shopFilters'
import { BEST_PRODUCTS, DEAL_PRODUCTS, NEWEST_PRODUCTS } from '@/features/home/domain/homeQueries'

export function prefetchForPath(queryClient: QueryClient, pathname: string, search = '') {
  warmQuery(queryClient, categoriesOptions)
  if (pathname === '/shop') {
    void import('@/features/catalog/pages/ShopPage')
    const params = new URLSearchParams(search)
    const page = Math.max(1, Number(params.get('page')) || 1)
    warmQuery(queryClient, productListOptions(toProductQuery(parseShopFilters(params), page)))
    warmQuery(queryClient, catalogMetaOptions)
    return
  }
  if (pathname !== '/') return
  for (const params of [BEST_PRODUCTS, DEAL_PRODUCTS, NEWEST_PRODUCTS]) {
    warmQuery(queryClient, productListOptions(params))
  }
  warmQuery(queryClient, catalogMetaOptions)
  warmQuery(queryClient, articlesOptions)
}
