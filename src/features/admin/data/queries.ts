import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keys } from '@/shared/data/queryKeys'
import type { Product } from '@/shared/domain/types'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchStats,
  fetchUsers,
  updateCategory,
  updateProduct,
  updateStock,
} from '@/features/admin/data/api'

export const useStats = () => useQuery({ queryKey: keys.adminStats, queryFn: ({ signal }) => fetchStats(signal) })

export const useUsers = (params: object) =>
  useQuery({
    queryKey: keys.adminUsers(params),
    queryFn: ({ signal }) => fetchUsers(params, signal),
    placeholderData: keepPreviousData,
  })

function useAfterProductChange() {
  const queryClient = useQueryClient()
  return {
    list: () => {
      for (const queryKey of [
        ['products', 'list'],
        ['products', 'ids'],
        ['products', 'related'],
        keys.catalogMeta,
        keys.adminStats,
      ]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
    detail: (product: Product) => queryClient.setQueryData(keys.product(product.id), product),
    remove: (id: number) => queryClient.removeQueries({ queryKey: keys.product(id), exact: true }),
  }
}

export function useProductMutations() {
  const after = useAfterProductChange()
  const onSaved = (product: Product) => {
    after.detail(product)
    after.list()
  }
  return {
    create: useMutation({ mutationFn: createProduct, onSuccess: after.list }),
    update: useMutation({ mutationFn: updateProduct, onSuccess: onSaved }),
    stock: useMutation({ mutationFn: updateStock, onSuccess: onSaved }),
    remove: useMutation({
      mutationFn: deleteProduct,
      onSuccess: (id) => {
        after.remove(id)
        after.list()
      },
    }),
  }
}

export function useCategoryMutations() {
  const queryClient = useQueryClient()
  const done = () => {
    for (const queryKey of [keys.categories, keys.catalogMeta, keys.adminStats]) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }
  return {
    create: useMutation({ mutationFn: createCategory, onSuccess: done }),
    update: useMutation({ mutationFn: updateCategory, onSuccess: done }),
    remove: useMutation({ mutationFn: deleteCategory, onSuccess: done }),
  }
}
