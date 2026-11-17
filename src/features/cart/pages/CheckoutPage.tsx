import { Navigate } from 'react-router'
import { Banknote, CreditCard } from 'lucide-react'
import { useCheckoutPage } from '@/features/cart/hooks/useCheckoutPage'
import { Input, Select, Textarea } from '@/shared/ui/common/Fields'
import { Breadcrumb } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { CARD, CARD_TITLE, CART_LAYOUT, CART_SIDE, DEMO_NOTE, FORM_GRID, PAGEHEAD } from '@/shared/ui/common/styles'
import OrderSummary from '@/features/cart/components/OrderSummary'
import CouponBox from '@/features/cart/components/CouponBox'
import CartLineStatus from '@/features/cart/components/CartLineStatus'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { CheckoutSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import { PROVINCES } from '@/shared/domain/constants'
import { cn } from '@/shared/ui/lib/cn'
import { formatNumber, formatToman } from '@/shared/domain/format'
import { handleImgError } from '@/shared/ui/lib/image'

const PAYGRID = 'grid grid-cols-2 gap-3 max-[721px]:grid-cols-1'
const LEGEND = 'mb-3 p-0 text-[17px]'
const payopt = (active: boolean) =>
  cn(
    'relative flex cursor-pointer items-center gap-3 rounded-[18px] border-2 p-4 [transition:all_0.2s] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] [&_b]:block [&_small]:text-[12px]',
    active ? 'border-primary bg-primary-50 text-primary' : 'border-line text-muted [&_b]:text-ink',
  )
const PAYOPT_INPUT = 'absolute opacity-0'

export default function CheckoutPage() {
  const {
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
    isSubmitting,
    redirectToCart,
    showSkeleton,
  } = useCheckoutPage()

  if (redirectToCart) return <Navigate to="/cart" replace />
  if (showSkeleton) return <CheckoutSkeleton />
  if (cart.isError) return <ErrorState error={cart.error} onRetry={cart.refetch} />

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'سبد خرید', to: '/cart' }, { label: 'تسویه‌حساب' }]} />
      <header className={PAGEHEAD}>
        <h1>اطلاعات ارسال و پرداخت</h1>
      </header>
      <p className={DEMO_NOTE} role="note">
        این فروشگاه نمایشی است: پرداخت واقعی انجام نمی‌شود. لطفاً اطلاعات واقعی خود را وارد نکنید؛ سفارش در API آزمایشی
        ثبت می‌شود.
      </p>
      <form className={CART_LAYOUT} onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
        <div className="grid gap-[18px]">
          <section className={CARD}>
            <h2 className={CARD_TITLE}>نشانی تحویل</h2>
            <div className={FORM_GRID}>
              <Input
                label="نام و نام خانوادگی گیرنده"
                autoComplete="name"
                error={errors.fullName?.message}
                {...field('fullName')}
              />
              <Input
                label="شمارهٔ موبایل"
                inputMode="tel"
                autoComplete="tel"
                ltr
                error={errors.phone?.message}
                {...field('phone')}
              />
              <Select label="استان" error={errors.province?.message} {...field('province')}>
                <option value="">انتخاب کنید…</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <Input label="شهر" error={errors.city?.message} {...field('city')} />
              <Textarea
                className="col-span-full"
                label="نشانی کامل"
                autoComplete="street-address"
                error={errors.address?.message}
                {...field('address')}
              />
              <Input
                label="کد پستی (۱۰ رقم)"
                inputMode="numeric"
                autoComplete="postal-code"
                ltr
                maxLength={10}
                error={errors.postalCode?.message}
                {...field('postalCode')}
              />
              <Input label="توضیحات (اختیاری)" error={errors.note?.message} {...field('note')} />
            </div>
          </section>

          <section className={CARD}>
            <fieldset className="min-w-0">
              <legend className={LEGEND}>روش ارسال</legend>
              <div className={PAYGRID}>
                {shippingMethods.map((method) => {
                  const free = method.freeFrom != null && totals.subtotal - totals.couponDiscount >= method.freeFrom
                  return (
                    <label key={method.id} className={payopt(shippingMethodId === method.id)}>
                      <input className={PAYOPT_INPUT} type="radio" value={method.id} {...field('shippingMethodId')} />
                      <div>
                        <b>{method.label}</b>
                        <small>
                          {method.description} · {free ? 'رایگان' : formatToman(method.cost)}
                        </small>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </section>

          <section className={CARD}>
            <fieldset className="min-w-0">
              <legend className={LEGEND}>روش پرداخت</legend>
              <div className={PAYGRID}>
                <label className={payopt(payment === 'online')}>
                  <input className={PAYOPT_INPUT} type="radio" value="online" {...field('payment')} />
                  <CreditCard size={26} aria-hidden="true" />
                  <div>
                    <b>پرداخت آنلاین</b>
                    <small>درگاه امن بانکی (نمایشی)</small>
                  </div>
                </label>
                <label className={payopt(payment === 'cod')}>
                  <input className={PAYOPT_INPUT} type="radio" value="cod" {...field('payment')} />
                  <Banknote size={26} aria-hidden="true" />
                  <div>
                    <b>پرداخت در محل</b>
                    <small>هنگام تحویل بسته</small>
                  </div>
                </label>
              </div>
            </fieldset>
          </section>

          <section className={CARD}>
            <h2 className={CARD_TITLE}>مرور کالاها ({formatNumber(totals.count)})</h2>
            <ul className="grid gap-2.5">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center gap-3">
                  {line.product && (
                    <img
                      className="size-[52px] rounded-[12px] bg-bg-2 object-cover"
                      onError={handleImgError}
                      src={line.product.thumbnail}
                      alt=""
                      width={52}
                      height={52}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span dir="auto" className="line-clamp-2 flex-1 text-[13.5px]">
                    {line.product?.title ?? `محصول ${line.id}`}
                  </span>
                  <b>× {formatNumber(line.qty)}</b>
                  <CartLineStatus line={line} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={CART_SIDE}>
          <CouponBox />
          <OrderSummary totals={totals} shippingLabel={cart.method?.label}>
            <Button type="submit" size="lg" block loading={isSubmitting} disabled={blocked}>
              ثبت نهایی سفارش
            </Button>
          </OrderSummary>
        </div>
      </form>
    </div>
  )
}
