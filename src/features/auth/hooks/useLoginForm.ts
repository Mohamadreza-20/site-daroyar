import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSeo } from '@/shared/hooks/useSeo'
import { isOfflineError, messageOf } from '@/shared/domain/errors'
import { useLogin } from '@/features/auth/data/queries'
import { useAuthStore } from '@/features/auth/data/store'
import { landingPathOf } from '@/features/auth/domain/access'
import type { DemoAccount } from '@/features/auth/domain/demoAccounts'
import { loginSchema, type LoginForm } from '@/features/auth/domain/schemas'

export function useLoginForm() {
  useSeo({
    title: 'ورود',
    description: 'ورود به حساب کاربری نمایشی دارویار برای مشاهدهٔ سفارش‌ها و علاقه‌مندی‌ها.',
    noindex: true,
  })
  const user = useAuthStore((s) => s.user)
  const expired = useAuthStore((s) => s.sessionExpired)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const form = useForm<LoginForm, unknown, LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })
  const { setValue } = form

  const from = (location.state as { from?: string } | null)?.from

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: ({ user: u }) => {
        toast.success(`خوش آمدید ${u.firstName}`)
        void navigate(from ?? landingPathOf(u), { replace: true })
      },
      onError: (error) => {
        if (isOfflineError(error)) toast.error('ارتباط با سرور برقرار نیست؛ اتصال را بررسی کنید.')
      },
    }),
  )

  const fillDemo = useCallback(
    (demo: DemoAccount) => {
      setValue('username', demo.username, { shouldValidate: true })
      setValue('password', demo.password, { shouldValidate: true })
    },
    [setValue],
  )

  return {
    redirectTo: user ? landingPathOf(user) : null,
    expired,
    from,
    field: form.register,
    errors: form.formState.errors,
    onSubmit,
    fillDemo,
    isPending: login.isPending,
    serverError: login.error && !isOfflineError(login.error) ? messageOf(login.error) : null,
  }
}
