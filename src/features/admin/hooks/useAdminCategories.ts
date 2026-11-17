import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { fieldErrorsOf } from '@/shared/domain/errors'
import { useSeo } from '@/shared/hooks/useSeo'
import type { Category } from '@/shared/domain/types'
import { useCatalogMeta, useCategories } from '@/features/catalog/data/queries'
import { useCategoryMutations } from '@/features/admin/data/queries'
import type { CategoryForm } from '@/features/admin/domain/schemas'

export function useAdminCategories() {
  useSeo({ title: 'مدیریت دسته‌بندی‌ها', noindex: true })
  const { data: categories = [], isPending, isError, error, refetch } = useCategories()
  const { data: meta } = useCatalogMeta()
  const { create, update, remove } = useCategoryMutations()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const closeForm = useCallback(() => {
    setEditing(null)
    create.reset()
    update.reset()
  }, [create, update])

  const submit = useCallback(
    (form: CategoryForm) => {
      const done = (msg: string) => ({
        onSuccess: () => {
          toast.success(msg)
          setEditing(null)
        },
        onError: (e: Error) => {
          if (!fieldErrorsOf(e)) toast.error(e.message || 'عملیات انجام نشد')
        },
      })
      if (editing === 'new') create.mutate(form, done('دستهٔ جدید افزوده شد'))
      else if (editing) update.mutate({ id: editing.id, form }, done('دسته ویرایش شد'))
    },
    [editing, create, update],
  )

  const confirmDelete = useCallback(() => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('دسته حذف شد')
        setDeleting(null)
      },
      onError: (e) => {
        toast.error(e.message || 'حذف انجام نشد')
        setDeleting(null)
      },
    })
  }, [deleting, remove])

  return {
    categories,
    counts: meta?.counts,
    isPending,
    isError,
    error,
    refetch,
    editing,
    startNew: () => setEditing('new'),
    startEdit: setEditing,
    closeForm,
    submit,
    saving: create.isPending || update.isPending,
    serverError: create.error ?? update.error,
    deleting,
    askDelete: setDeleting,
    cancelDelete: () => setDeleting(null),
    confirmDelete,
    isDeleting: remove.isPending,
  }
}
