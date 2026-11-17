import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { errorCodeOf, statusOf } from '@/shared/domain/errors'
import { toEnglishDigits } from '@/shared/domain/format'
import { keys } from '@/shared/data/queryKeys'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import { useSeo } from '@/shared/hooks/useSeo'
import { useAuthStore } from '@/features/auth/data/store'
import { useCartSummary } from '@/features/cart/data/queries'
import { useCreateOrder } from '@/features/orders/data/queries'
import { hasBlockedLines } from '@/features/cart/domain/cartRules'
import { buildOrderPayload, defaultCheckoutValues, orderFailureNotice } from '@/features/cart/domain/checkout'
import { checkoutSchema, type CheckoutForm, type CheckoutFormInput } from '@/features/cart/domain/schemas'
import { notify } from '@/features/cart/hooks/useNotify'

export function useCheckoutPage() {
  useSeo({ title: 'تسویه‌حساب', noindex: true })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const createOrder = useCreateOrder()

  const form = useForm<CheckoutFormInput, unknown, CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultCheckoutValues(user),
  })
  const { register, watch, setFocus, setError } = form
  const errors = form.formState.errors

  const payment = watch('payment')
  const shippingMethodId = watch('shippingMethodId')
  const cart = useCartSummary(shippingMethodId)
  const { lines, totals, shippingMethods } = cart
  const blocked = hasBlockedLines(lines)

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['products', 'ids'] })
    void queryClient.invalidateQueries({ queryKey: keys.shipping })
  }, [queryClient])

  useEffect(() => {
    const first = Object.keys(errors)[0]
    if (first) setFocus(first as FieldPath<CheckoutFormInput>)
  }, [errors, setFocus])

  const onSubmit = form.handleSubmit((values) => {
    if (createOrder.isPending || !cart.method) return
    if (blocked) {
      toast.error('ابتدا مشکل اقلام سبد را برطرف کنید')
      return
    }
    createOrder.mutate(buildOrderPayload(values, lines, cart.coupon, totals.total), {
      onSuccess: (order) => {
        toast.success('سفارش شما ثبت شد')
        void navigate(`/order-success/${order.id}`, { replace: true })
      },
      onError: (error) => {
        if (applyServerErrors(error, setError)) {
          toast.error(error.message)
          return
        }
        notify(orderFailureNotice({ code: errorCodeOf(error), status: statusOf(error), message: error.message }))
      },
    })
  })

  const field = (name: FieldPath<CheckoutFormInput>) =>
    name === 'phone' || name === 'postalCode' ? register(name, { setValueAs: toEnglishDigits }) : register(name)

  return {
    cart,
    lines,
    totals,
    shippingMethods,
    shippingMethodId,
    payment,
    blocked,
    field,
    errors,
    onSubmit,
    isSubmitting: createOrder.isPending,
    redirectToCart: cart.isEmpty && !createOrder.isPending && !createOrder.isSuccess,
    showSkeleton: cart.isPending || (!cart.method && !cart.isError),
  }
}
