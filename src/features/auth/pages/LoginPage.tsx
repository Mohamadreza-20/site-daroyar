import { Link, Navigate } from 'react-router'
import { Lock, TriangleAlert, User } from 'lucide-react'
import { Input } from '@/shared/ui/common/Fields'
import Button from '@/shared/ui/common/Button'
import { DEMO_NOTE, FIELD_ERROR, chipClass } from '@/shared/ui/common/styles'
import { DEMO_ACCOUNTS } from '@/features/auth/domain/demoAccounts'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import AuthShell, { AUTH_FORM } from '@/features/auth/components/AuthShell'

export default function LoginPage() {
  const { redirectTo, expired, from, field, errors, onSubmit, fillDemo, isPending, serverError } = useLoginForm()

  if (redirectTo) return <Navigate to={redirectTo} replace />

  return (
    <AuthShell
      title="ورود به حساب کاربری"
      subtitle="نام کاربری و گذرواژهٔ خود را وارد کنید."
      footer={
        <>
          حساب ندارید؟{' '}
          <Link to="/register" state={{ from }}>
            ثبت‌نام کنید
          </Link>
        </>
      }
    >
      {expired && (
        <p className={DEMO_NOTE} role="status">
          نشست قبلی شما منقضی شده است؛ دوباره وارد شوید.
        </p>
      )}
      <form className={AUTH_FORM} onSubmit={onSubmit} noValidate>
        {serverError && (
          <p className={`${FIELD_ERROR} flex items-center gap-1.5`} role="alert">
            <TriangleAlert size={16} aria-hidden="true" /> {serverError}
          </p>
        )}
        <Input
          label="نام کاربری یا ایمیل"
          icon={User}
          ltr
          autoComplete="username"
          error={errors.username?.message}
          {...field('username')}
        />
        <Input
          label="گذرواژه"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          error={errors.password?.message}
          {...field('password')}
        />
        <Button type="submit" size="lg" block loading={isPending}>
          ورود
        </Button>
      </form>
      <div className="grid gap-2 rounded-2xl bg-bg px-4 py-3.5 text-[13px]">
        <p>ورود سریع با حساب نمونه:</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.username}
              type="button"
              className={chipClass(false, 'min-h-[34px] px-3.5 text-[13px]')}
              onClick={() => fillDemo(demo)}
            >
              {demo.label}
            </button>
          ))}
        </div>
        <small className="text-muted">ورود با حساب‌های نمونه یا حساب‌هایی که ثبت‌نام کرده‌اید انجام می‌شود.</small>
      </div>
    </AuthShell>
  )
}
