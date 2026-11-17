import { api, totalOf } from '@/shared/data/client'
import type { AdminStats, Category, Paged, Product, User } from '@/shared/domain/types'
import { assetPath } from '@/shared/data/assets'
import { normalizeProduct } from '@/features/catalog/data/api'
import type { CategoryForm, ProductForm } from '@/features/admin/domain/schemas'

export const fetchStats = (signal?: AbortSignal) => api.get<AdminStats>('/stats', { signal }).then((r) => r.data)

export async function fetchUsers(params: object, signal?: AbortSignal): Promise<Paged<User>> {
  const response = await api.get<User[]>('/users', { params, signal })
  return { items: response.data, total: totalOf(response) }
}

const productPayload = ({
  title,
  brand,
  category,
  basePrice,
  discount,
  stock,
  thumbnail,
  description,
}: ProductForm) => ({
  title,
  brand,
  category,
  basePrice,
  discount,
  stock,
  thumbnail: assetPath(thumbnail),
  description,
})

export const createProduct = (form: ProductForm) =>
  api.post<Product>('/products', productPayload(form)).then((r) => normalizeProduct(r.data))

export const updateProduct = ({ id, form }: { id: number; form: ProductForm }) =>
  api.patch<Product>(`/products/${id}`, productPayload(form)).then((r) => normalizeProduct(r.data))

export const updateStock = ({ id, stock }: { id: number; stock: number }) =>
  api.patch<Product>(`/products/${id}/stock`, { stock }).then((r) => normalizeProduct(r.data))

export const deleteProduct = (id: number) => api.delete(`/products/${id}`).then(() => id)

export const createCategory = (form: CategoryForm) => api.post<Category>('/categories', form).then((r) => r.data)

export const updateCategory = ({ id, form }: { id: number; form: CategoryForm }) =>
  api.patch<Category>(`/categories/${id}`, form).then((r) => r.data)

export const deleteCategory = (id: number) => api.delete(`/categories/${id}`).then(() => id)
