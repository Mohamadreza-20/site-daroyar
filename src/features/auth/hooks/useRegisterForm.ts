import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { toEnglishDigits } from '@/shared/domain/format'
import { isOfflineError } from '@/shared/domain/errors'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import { useSeo } from '@/shared/hooks/useSeo'
import { useRegister } from '@/features/auth/data/queries'
import { useAuthStore } from '@/features/auth/data/store'
import { landingPathOf } from '@/features/auth/domain/access'
import { registerSchema, type RegisterForm, type RegisterFormInput } from '@/features/auth/domain/schemas'

export function useRegisterForm() {
  useSeo({
    title: 'ثبت‌نام',
    description: 'ساخت حساب کاربری نمایشی در دارویار برای بررسی جریان ثبت‌نام و پیگیری سفارش.',
    noindex: true,
  })
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const registerMutation = useRegister()
  const form = useForm<RegisterFormInput, unknown, RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
      terms: false,
    },
  })
  const { register, setError } = form

  const from = (location.state as { from?: string } | null)?.from

  const onSubmit = form.handleSubmit((values) =>
    registerMutation.mutate(
      { ...values, phone: toEnglishDigits(values.phone) },
      {
        onSuccess: () => {
          toast.success('ثبت‌نام با موفقیت انجام شد')
          void navigate(from ?? '/account', { replace: true })
        },
        onError: (error) => {
          if (applyServerErrors(error, setError)) return
          toast.error(
            isOfflineError(error)
              ? 'ارتباط با سرور برقرار نیست؛ دوباره تلاش کنید.'
              : error.message || 'ثبت‌نام انجام نشد',
          )
        },
      },
    ),
  )

  const field = useCallback(
    (name: FieldPath<RegisterFormInput>) =>
      name === 'phone' ? register(name, { setValueAs: toEnglishDigits }) : register(name),
    [register],
  )

  return {
    redirectTo: user ? landingPathOf(user) : null,
    from,
    field,
    errors: form.formState.errors,
    onSubmit,
    isPending: registerMutation.isPending,
  }
}
