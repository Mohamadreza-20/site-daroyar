import { useCallback, useState } from 'react'
import { useClampPage, usePrefetchNext, useSearchInput, useUrlParams } from '@/shared/hooks/useUrlState'
import { useDialogA11y, useLockBodyScroll } from '@/shared/hooks/useUtils'
import { useSeo } from '@/shared/hooks/useSeo'
import type { SortKey } from '@/shared/domain/types'
import { productListPrefetch, useCatalogMeta, useCategories, useProducts } from '@/features/catalog/data/queries'
import {
  SHOP_PAGE_SIZE,
  parseShopFilters,
  priceBoundsOf,
  shopSeo,
  sortPatch,
  toProductQuery,
} from '@/features/catalog/domain/shopFilters'

export function useShopPage() {
  const { params, update, reset, page, setPage } = useUrlParams()
  const [drawer, setDrawer] = useState(false)
  useLockBodyScroll(drawer)

  const filters = parseShopFilters(params)
  const commitSearch = useCallback((q: string) => update({ q }, { replace: true }), [update])
  const search = useSearchInput(filters.q, commitSearch)

  const { data: categories = [] } = useCategories()
  const { data: meta } = useCatalogMeta()
  const categoryLabel = categories.find((item) => item.slug === filters.category)?.label
  useSeo({
    ...shopSeo(categoryLabel),
    breadcrumbs: [
      { name: 'خانه', path: '/' },
      { name: 'فروشگاه', path: '/shop' },
    ],
    noindex: Boolean(filters.q),
  })

  const query = useProducts(toProductQuery(filters, page))
  const { data } = query
  const total = data?.total ?? 0
  const ready = !!data && !query.isPlaceholderData
  const { totalPages, current } = useClampPage({ page, total, pageSize: SHOP_PAGE_SIZE, ready, setPage })

  const nextQuery = toProductQuery(filters, current + 1)
  usePrefetchNext({
    current,
    totalPages,
    ready,
    ...productListPrefetch(nextQuery),
  })

  const onSort = useCallback((value: SortKey) => update(sortPatch(value)), [update])
  const onPage = useCallback(
    (value: number) => {
      setPage(value)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setPage],
  )
  const onReset = useCallback(() => {
    search.clear()
    reset()
  }, [search, reset])
  const openFilters = useCallback(() => setDrawer(true), [])
  const closeFilters = useCallback(() => setDrawer(false), [])
  const dialogRef = useDialogA11y(drawer, closeFilters)

  return {
    filters,
    categories,
    categoryLabel,
    priceBounds: priceBoundsOf(meta?.maxPrice),
    products: data?.items ?? [],
    total,
    page: current,
    totalPages,
    isLoading: query.isPending && !data,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isBusy: query.isPlaceholderData && query.isFetching,
    search,
    drawer,
    dialogRef,
    openFilters,
    closeFilters,
    onSort,
    onPage,
    onReset,
    onFilterChange: update,
  }
}
