import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { fieldErrorsOf } from '@/shared/domain/errors'
import { useClampPage, useSearchInput, useUrlParams } from '@/shared/hooks/useUrlState'
import { useSeo } from '@/shared/hooks/useSeo'
import type { Product } from '@/shared/domain/types'
import { useCategories, useProducts } from '@/features/catalog/data/queries'
import { useProductMutations } from '@/features/admin/data/queries'
import type { ProductForm } from '@/features/admin/domain/schemas'
import { PRODUCTS_PAGE_SIZE, parseStockFilter, stockRange } from '@/features/admin/domain/productRules'

export function useAdminProducts() {
  useSeo({ title: 'مدیریت محصولات', noindex: true })
  const { create, update, stock, remove } = useProductMutations()
  const { data: categories = [] } = useCategories()
  const { params, update: setParam, reset, page, setPage } = useUrlParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const stockFilter = parseStockFilter(params.get('stock') ?? '')
  const commit = useCallback((value: string) => setParam({ q: value }, { replace: true }), [setParam])
  const search = useSearchInput(q, commit)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useProducts({
    q,
    category,
    ...stockRange(stockFilter),
    sort: 'newest',
    page,
    limit: PRODUCTS_PAGE_SIZE,
  })

  const closeForm = useCallback(() => {
    setEditing(null)
    create.reset()
    update.reset()
  }, [create, update])

  const submit = useCallback(
    (form: ProductForm) => {
      const done = (msg: string) => ({
        onSuccess: () => {
          toast.success(msg)
          setEditing(null)
        },
        onError: (e: Error) => {
          if (!fieldErrorsOf(e)) toast.error(e.message || 'عملیات انجام نشد')
        },
      })
      if (editing === 'new') create.mutate(form, done('محصول جدید افزوده شد'))
      else if (editing) update.mutate({ id: editing.id, form }, done('محصول ویرایش شد'))
    },
    [editing, create, update],
  )

  const saveStock = useCallback(
    (id: number, value: number) =>
      stock.mutate(
        { id, stock: value },
        {
          onSuccess: () => toast.success('موجودی به‌روز شد'),
          onError: (e: Error) => toast.error(e.message || 'به‌روزرسانی موجودی انجام نشد'),
        },
      ),
    [stock],
  )

  const confirmDelete = useCallback(() => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('محصول حذف شد')
        setDeleting(null)
      },
      onError: (e: Error) => {
        toast.error(e.message || 'حذف انجام نشد')
        setDeleting(null)
      },
    })
  }, [remove, deleting])

  const total = data?.total ?? 0
  const { totalPages, current } = useClampPage({
    page,
    total,
    pageSize: PRODUCTS_PAGE_SIZE,
    ready: !!data && !isPlaceholderData,
    setPage,
  })

  return {
    products: data?.items ?? [],
    total,
    categories,
    isPending,
    isError,
    error,
    refetch,
    busy: isPlaceholderData && isFetching,
    search,
    category,
    stockFilter,
    setCategory: (value: string) => setParam({ category: value }),
    setStockFilter: (value: string) => setParam({ stock: value }),
    hasFilters: Boolean(q || search.text || category || stockFilter),
    resetFilters: () => {
      search.clear()
      reset()
    },
    page: current,
    totalPages,
    setPage,
    editing,
    startNew: () => setEditing('new'),
    startEdit: setEditing,
    closeForm,
    submit,
    saving: create.isPending || update.isPending,
    serverError: create.error ?? update.error,
    saveStock,
    stockSavingId: stock.isPending ? stock.variables?.id : undefined,
    deleting,
    askDelete: setDeleting,
    cancelDelete: () => setDeleting(null),
    confirmDelete,
    isDeleting: remove.isPending,
  }
}
