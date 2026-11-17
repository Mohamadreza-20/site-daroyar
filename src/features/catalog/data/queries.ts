import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { keys } from '@/shared/data/queryKeys'
import type { Category, Paged, Product, ProductQuery } from '@/shared/domain/types'
import {
  createReview,
  fetchCatalogMeta,
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchReviews,
} from '@/features/catalog/data/api'
import type { ReviewForm } from '@/features/catalog/domain/schemas'

const MINUTE = 60 * 1000

export const productListOptions = (params: ProductQuery) =>
  queryOptions({
    queryKey: keys.productList(params),
    queryFn: ({ signal }) => fetchProducts(params, signal),
    staleTime: MINUTE,
  })

export const categoriesOptions = queryOptions({
  queryKey: keys.categories,
  queryFn: ({ signal }) => fetchCategories(signal),
  staleTime: 30 * MINUTE,
})

export const catalogMetaOptions = queryOptions({
  queryKey: keys.catalogMeta,
  queryFn: ({ signal }) => fetchCatalogMeta(signal),
  staleTime: 5 * MINUTE,
})

export const useProducts = (params: ProductQuery, options: { enabled?: boolean; staleTime?: number } = {}) =>
  useQuery({ ...productListOptions(params), placeholderData: keepPreviousData, ...options })

export const useCategories = () => useQuery(categoriesOptions)

export const useCatalogMeta = () => useQuery(catalogMetaOptions)

export function useCategoryMap(): Map<string, Category> {
  const { data } = useCategories()
  return useMemo(() => new Map((data ?? []).map((category) => [category.slug, category])), [data])
}

export const useCategoryLabel = (slug: string | undefined): string =>
  useCategoryMap().get(slug ?? '')?.label ?? slug ?? ''

function findInListCaches(queryClient: QueryClient, id: string | number): Product | undefined {
  for (const [, data] of queryClient.getQueriesData<Paged<Product>>({ queryKey: ['products', 'list'] })) {
    const found = data?.items.find((product) => String(product.id) === String(id))
    if (found) return found
  }
  return undefined
}

export function useProduct(id: string | number | undefined) {
  const queryClient = useQueryClient()
  return useQuery<Product>({
    queryKey: keys.product(id ?? ''),
    enabled: Boolean(id),
    queryFn: ({ signal }) => fetchProduct(id ?? '', signal),
    placeholderData: () => (id ? findInListCaches(queryClient, id) : undefined),
    staleTime: MINUTE,
  })
}

export const useRelatedProducts = (product: Product | undefined) =>
  useQuery({
    queryKey: keys.related(product?.id),
    enabled: Boolean(product),
    queryFn: ({ signal }) =>
      fetchProducts(
        { category: product?.category, exclude: product?.id, available: true, sort: 'popular', limit: 10 },
        signal,
      ).then((result) => result.items),
    staleTime: MINUTE,
  })

export const useReviews = (productId: string | number | undefined) =>
  useQuery({
    queryKey: keys.reviews(productId ?? ''),
    enabled: Boolean(productId),
    queryFn: ({ signal }) => fetchReviews(productId ?? '', signal),
    staleTime: 5 * MINUTE,
  })

export function useAddReview(productId: string | number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ReviewForm) => createReview({ ...values, productId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.reviews(productId) })
      void queryClient.invalidateQueries({ queryKey: keys.products })
    },
  })
}

export const productListPrefetch = (params: ProductQuery) => ({
  queryKey: keys.productList(params),
  queryFn: (signal: AbortSignal) => fetchProducts(params, signal),
})
