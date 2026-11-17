import { api, totalOf } from '@/shared/data/client'
import { assetUrl } from '@/shared/data/assets'
import type { CatalogMeta, Category, Paged, Product, ProductQuery, Review, SortKey } from '@/shared/domain/types'

const SORTS: Record<SortKey, { _sort: string; _order: string }> = {
  popular: { _sort: 'rating,id', _order: 'desc,desc' },
  newest: { _sort: 'createdAt,id', _order: 'desc,desc' },
  discount: { _sort: 'discount,rating', _order: 'desc,desc' },
  cheap: { _sort: 'price,id', _order: 'asc,asc' },
  expensive: { _sort: 'price,id', _order: 'desc,desc' },
}

export function normalizeProduct(product: Product): Product {
  const images = product.images?.length ? product.images : [product.thumbnail]
  return {
    ...product,
    tags: product.tags ?? [],
    thumbnail: assetUrl(product.thumbnail),
    images: images.map(assetUrl),
  }
}

function buildProductQuery({
  q,
  category,
  maxPrice,
  available,
  discounted,
  sort = 'popular',
  page = 1,
  limit = 12,
  exclude,
  stockFrom,
  stockTo,
  ids,
}: ProductQuery = {}) {
  const params: Record<string, unknown> = { ...(SORTS[sort] ?? SORTS.popular) }
  if (q?.trim()) params.q = q.trim()
  if (category) params.category = category
  if (maxPrice) params.price_lte = maxPrice
  if (available) params.stock_gte = 1
  if (discounted) params.discount_gte = 1
  if (exclude != null) params.id_ne = exclude
  if (stockFrom != null) params.stock_gte = stockFrom
  if (stockTo != null) params.stock_lte = stockTo
  if (ids) params.id = ids
  if (limit) {
    params._limit = limit
    params._page = page
  }
  return params
}

export async function fetchProducts(params: ProductQuery, signal?: AbortSignal): Promise<Paged<Product>> {
  const response = await api.get<Product[]>('/products', {
    params: buildProductQuery(params),
    signal,
    paramsSerializer: { indexes: null },
  })
  return { items: response.data.map(normalizeProduct), total: totalOf(response) }
}

export async function fetchProductsByIds(ids: readonly (string | number)[], signal?: AbortSignal): Promise<Product[]> {
  if (!ids.length) return []
  const { items } = await fetchProducts({ ids: [...ids], limit: ids.length }, signal)
  return items
}

export async function fetchProduct(id: string | number, signal?: AbortSignal): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(id)}`, { signal })
  return normalizeProduct(data)
}

export const fetchCategories = (signal?: AbortSignal) =>
  api.get<Category[]>('/categories', { signal }).then((r) => r.data)

export const fetchCatalogMeta = (signal?: AbortSignal) =>
  api.get<CatalogMeta>('/catalog/meta', { signal }).then((r) => r.data)

export const fetchReviews = (productId: string | number, signal?: AbortSignal) =>
  api.get<Review[]>('/reviews', { params: { productId, _sort: 'date', _order: 'desc' }, signal }).then((r) => r.data)

export const createReview = (values: { productId: string | number; rating: number; comment: string }) =>
  api.post<Review>('/reviews', values).then((r) => r.data)
