import { Link } from 'react-router'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useContactForm } from '@/features/contact/hooks/useContactForm'
import { SUBJECTS, contactChannels } from '@/features/contact/domain/subjects'
import { Input, Select, Textarea } from '@/shared/ui/common/Fields'
import { Breadcrumb } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { CARD, CARD_TITLE, DEMO_NOTE, FORM_GRID, PAGEHEAD } from '@/shared/ui/common/styles'
import { cn } from '@/shared/ui/lib/cn'
import { BRAND } from '@/shared/domain/constants'

const ICONS = { phone: Phone, email: Mail, address: MapPin, hours: Clock }

export default function ContactPage() {
  const { register, errors, isPending, onSubmit, isCustomer } = useContactForm()
  const channels = contactChannels()

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'تماس با ما' }]} />
      <header className={cn(PAGEHEAD, 'flex-col items-start gap-1.5')}>
        <h1>تماس با ما</h1>
        <p className="text-muted">
          پیام شما در API آزمایشی ذخیره می‌شود و مدیر سایت از پنل مدیریت به آن پاسخ می‌دهد.
          {isCustomer && (
            <>
              {' '}
              <Link to="/account/messages" className="font-extrabold text-primary-700">
                مشاهدهٔ پیام‌های من
              </Link>
            </>
          )}
        </p>
        <p className={DEMO_NOTE} role="note">
          اطلاعات تماس ساختگی است و به سامانهٔ پشتیبانی واقعی متصل نیست.
        </p>
      </header>
      <ul className="mb-6 grid grid-cols-4 gap-4 max-[1025px]:grid-cols-2 max-[641px]:grid-cols-1">
        {channels.map(({ key, title, value, href }) => {
          const Icon = ICONS[key as keyof typeof ICONS]
          return (
            <li key={key} className={cn(CARD, 'grid justify-items-start gap-1 p-5')}>
              <span className="mb-1.5 grid size-[52px] shrink-0 place-items-center rounded-md bg-primary-50 text-primary">
                <Icon size={24} />
              </span>
              <small className="text-muted">{title}</small>
              {href ? (
                <a href={href} dir="auto" className="leading-[1.7] font-extrabold">
                  {value}
                </a>
              ) : (
                <b className="leading-[1.7] font-extrabold">{value}</b>
              )}
            </li>
          )
        })}
      </ul>
      <div className="grid grid-cols-[1.3fr_1fr] items-stretch gap-[22px] pb-4 max-[1025px]:grid-cols-1">
        <form className={CARD} onSubmit={onSubmit} noValidate>
          <h2 className={CARD_TITLE}>ارسال پیام</h2>
          <div className={FORM_GRID}>
            <Input label="نام شما" error={errors.name?.message} {...register('name')} />
            <Input label="ایمیل" type="email" ltr error={errors.email?.message} {...register('email')} />
            <Select className="col-span-full" label="موضوع" error={errors.subject?.message} {...register('subject')}>
              <option value="">انتخاب کنید…</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Textarea className="col-span-full" label="پیام" error={errors.message?.message} {...register('message')} />
          </div>
          <Button type="submit" size="lg" loading={isPending} icon={<Send size={18} />} className="mt-5">
            ارسال پیام
          </Button>
        </form>
        <div
          className="grid content-center justify-items-center gap-2.5 rounded-lg border border-line bg-[linear-gradient(160deg,var(--color-primary-50),#fff)] p-6 text-center shadow-sm"
          aria-label="نشانی نمایشی برند"
        >
          <div className="relative mb-2 grid size-[180px] place-items-center">
            <span className="relative z-2 grid size-[76px] -rotate-45 place-items-center rounded-[50%_50%_50%_8px] bg-accent text-white shadow-[0_14px_30px_rgba(255,122,89,0.45)]">
              <MapPin size={34} className="rotate-45" />
            </span>
            <i className="absolute inset-[20%] animate-ripple rounded-full border-2 border-primary opacity-0" />
            <i className="absolute inset-[20%] animate-ripple rounded-full border-2 border-primary opacity-0 [animation-delay:1.3s]" />
          </div>
          <h3>{BRAND.name}</h3>
          <p>{BRAND.address}</p>
        </div>
      </div>
      <section id="terms" className={cn(CARD, 'mt-6')} aria-labelledby="terms-title">
        <h2 id="terms-title" className={CARD_TITLE}>
          قوانین و مقررات (نمایشی)
        </h2>
        <p className="text-muted">
          دارویار یک پروژهٔ نمایشی است. محصولات، قیمت‌ها و سفارش‌ها واقعی نیستند، اطلاعات حساب فقط در پایگاه‌دادهٔ آزمایشی
          ذخیره می‌شود و هیچ خدمت دارویی یا پرداختی ارائه نمی‌شود.
        </p>
      </section>
    </div>
  )
}
