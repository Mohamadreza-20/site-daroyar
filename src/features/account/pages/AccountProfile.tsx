import { Mail, Phone } from 'lucide-react'
import { Input } from '@/shared/ui/common/Fields'
import Button from '@/shared/ui/common/Button'
import { CARD, FORM_GRID, PANEL_TITLE, STACK } from '@/shared/ui/common/styles'
import { toEnglishDigits } from '@/shared/domain/format'
import { useAccountProfile } from '@/features/account/hooks/useAccountProfile'

export default function AccountProfile() {
  const { register, errors, isDirty, isPending, username, onSubmit } = useAccountProfile()

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>اطلاعات حساب</h1>
      <form className={CARD} onSubmit={onSubmit} noValidate>
        <div className={FORM_GRID}>
          <Input label="نام" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="نام خانوادگی" error={errors.lastName?.message} {...register('lastName')} />
          <Input label="ایمیل" type="email" icon={Mail} ltr error={errors.email?.message} {...register('email')} />
          <Input
            label="شمارهٔ موبایل"
            icon={Phone}
            ltr
            error={errors.phone?.message}
            {...register('phone', { setValueAs: toEnglishDigits })}
          />
          <Input
            label="نام کاربری"
            ltr
            value={username}
            disabled
            readOnly
            hint="نام کاربری قابل تغییر نیست"
            onChange={() => undefined}
          />
        </div>
        <Button type="submit" size="lg" loading={isPending} disabled={!isDirty} className="mt-5">
          ذخیرهٔ تغییرات
        </Button>
      </form>
    </div>
  )
}
