import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import { priceAfterDiscount } from '@/shared/domain/orderLimits'
import type { Product } from '@/shared/domain/types'
import { useCategories } from '@/features/catalog/data/queries'
import { productSchema, type ProductForm, type ProductFormInput } from '@/features/admin/domain/schemas'
import { productToForm } from '@/features/admin/domain/productRules'

export function useProductForm(product: Product | null, serverError: unknown, onSubmit: (form: ProductForm) => void) {
  const { data: categories = [] } = useCategories()
  const values = useMemo(() => productToForm(product), [product])
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductForm>({ resolver: zodResolver(productSchema), defaultValues: values })
  useEffect(() => reset(values), [values, reset])
  useEffect(() => {
    if (serverError) applyServerErrors(serverError, setError)
  }, [serverError, setError])
  const [basePrice, discount] = useWatch({ control, name: ['basePrice', 'discount'] })
  const base = Number(basePrice)
  const finalPrice = Number.isFinite(base) && base >= 1000 ? priceAfterDiscount(base, Number(discount) || 0) : null
  return { register, errors, categories, finalPrice, submit: handleSubmit(onSubmit) }
}
