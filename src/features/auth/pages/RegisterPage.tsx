import { Link, Navigate } from 'react-router'
import { AtSign, Lock, Mail, Phone } from 'lucide-react'
import { Input } from '@/shared/ui/common/Fields'
import Button from '@/shared/ui/common/Button'
import { CHECK_INPUT, CHECK_LABEL, FIELD_ERROR } from '@/shared/ui/common/styles'
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm'
import AuthShell, { AUTH_FORM, AUTH_GRID } from '@/features/auth/components/AuthShell'

export default function RegisterPage() {
  const { redirectTo, from, field, errors, onSubmit, isPending } = useRegisterForm()

  if (redirectTo) return <Navigate to={redirectTo} replace />

  return (
    <AuthShell
      title="ساخت حساب کاربری"
      subtitle="چند ثانیه وقت بگذارید و عضو دارویار شوید."
      footer={
        <>
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link to="/login" state={{ from }}>
            وارد شوید
          </Link>
        </>
      }
    >
      <form className={AUTH_FORM} onSubmit={onSubmit} noValidate>
        <div className={AUTH_GRID}>
          <Input label="نام" autoComplete="given-name" error={errors.firstName?.message} {...field('firstName')} />
          <Input
            label="نام خانوادگی"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...field('lastName')}
          />
          <Input
            label="نام کاربری"
            icon={AtSign}
            ltr
            autoComplete="username"
            error={errors.username?.message}
            {...field('username')}
          />
          <Input
            label="شمارهٔ موبایل"
            icon={Phone}
            ltr
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...field('phone')}
          />
          <Input
            className="col-span-full"
            label="ایمیل"
            type="email"
            icon={Mail}
            ltr
            autoComplete="email"
            error={errors.email?.message}
            {...field('email')}
          />
          <Input
            label="گذرواژه"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            hint="حداقل ۸ کاراکتر، شامل حرف و عدد"
            error={errors.password?.message}
            {...field('password')}
          />
          <Input
            label="تکرار گذرواژه"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...field('confirm')}
          />
        </div>
        <div>
          <label className={CHECK_LABEL}>
            <input className={CHECK_INPUT} type="checkbox" {...field('terms')} />
            <span>
              <a href="/contact#terms" target="_blank" rel="noreferrer">
                قوانین و مقررات
              </a>{' '}
              دارویار را می‌پذیرم.
            </span>
          </label>
          {errors.terms && <p className={FIELD_ERROR}>{errors.terms.message}</p>}
        </div>
        <Button type="submit" size="lg" block loading={isPending}>
          ثبت‌نام
        </Button>
      </form>
    </AuthShell>
  )
}
