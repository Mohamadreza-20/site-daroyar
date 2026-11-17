import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import type { Category } from '@/shared/domain/types'
import { categorySchema, type CategoryForm } from '@/features/admin/domain/schemas'
import { categoryToForm } from '@/features/admin/domain/categoryRules'

export function useCategoryForm(
  category: Category | null,
  serverError: unknown,
  onSubmit: (form: CategoryForm) => void,
) {
  const values = useMemo(() => categoryToForm(category), [category])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema), defaultValues: values })
  useEffect(() => reset(values), [values, reset])
  useEffect(() => {
    if (serverError) applyServerErrors(serverError, setError)
  }, [serverError, setError])
  return { register, errors, submit: handleSubmit(onSubmit) }
}
