import { memo, useCallback } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Breadcrumb, EmptyState, Price, QuantityControl } from '@/shared/ui/common/Primitives'
import Button, { ICON_BTN } from '@/shared/ui/common/Button'
import { CART_LAYOUT, CART_SIDE, PAGEHEAD, FIELD_ERROR } from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { CartSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import { cn } from '@/shared/ui/lib/cn'
import { handleImgError } from '@/shared/ui/lib/image'
import type { CartLine } from '@/shared/domain/pricing'
import { useCartPage } from '@/features/cart/hooks/useCartPage'
import OrderSummary from '@/features/cart/components/OrderSummary'
import CouponBox from '@/features/cart/components/CouponBox'
import CartLineStatus from '@/features/cart/components/CartLineStatus'

interface RowProps {
  line: CartLine
  label: string
  onQty: (id: number | string, qty: number, max: number) => void
  onRemove: (id: number | string) => void
}

const Row = memo(function Row({ line, label, onQty, onRemove }: RowProps) {
  const { product } = line
  const handleQty = useCallback((q: number) => onQty(line.id, q, line.maxQty), [onQty, line.id, line.maxQty])
  const handleRemove = useCallback(() => onRemove(line.id), [onRemove, line.id])
  const title = product?.title ?? `محصول ${line.id}`
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="grid grid-cols-[96px_minmax(0,1fr)_auto_auto_auto] items-center gap-4 rounded-[22px] border border-line bg-surface p-3.5 max-[721px]:grid-cols-[80px_minmax(0,1fr)_44px] max-[721px]:items-start max-[721px]:gap-x-3 max-[721px]:gap-y-2.5 max-[721px]:[grid-template-areas:'img_info_del'_'img_foot_foot']"
    >
      <Link
        to={`/product/${line.id}`}
        className="size-24 overflow-hidden rounded-[18px] bg-bg-2 max-[721px]:size-20 max-[721px]:[grid-area:img] [&_img]:size-full [&_img]:object-cover"
        aria-label={title}
      >
        {product && (
          <img
            onError={handleImgError}
            src={product.thumbnail}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
          />
        )}
      </Link>
      <div className="grid min-w-0 gap-1 max-[721px]:[grid-area:info] [&_small]:text-muted">
        <Link to={`/product/${line.id}`} className="font-extrabold leading-[1.6] hover:text-primary-700" dir="auto">
          {title}
        </Link>
        <small>{label}</small>
        {line.available && <Price price={line.price} oldPrice={line.basePrice > line.price ? line.basePrice : null} />}
        <CartLineStatus line={line} />
      </div>
      <div className="contents max-[721px]:flex max-[721px]:items-center max-[721px]:justify-between max-[721px]:gap-3 max-[721px]:[grid-area:foot]">
        {line.available && <QuantityControl value={line.qty} max={line.maxQty} onChange={handleQty} />}
        <div className="min-w-[120px] text-end max-[721px]:min-w-0">
          {line.available && <Price price={line.price * line.qty} />}
        </div>
      </div>
      <button
        type="button"
        className={cn(ICON_BTN, 'hover:bg-danger-50 hover:text-danger max-[721px]:[grid-area:del]')}
        onClick={handleRemove}
        aria-label={`حذف ${title}`}
      >
        <Trash2 size={20} />
      </button>
    </motion.li>
  )
})

export default function CartPage() {
  const { cart, showSkeleton, showError, canCheckout, categoryLabel, onQty, onRemove, onClear } = useCartPage()

  if (showSkeleton) return <CartSkeleton />
  if (showError) return <ErrorState error={cart.error} onRetry={cart.refetch} />

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'سبد خرید' }]} />
      <header className={PAGEHEAD}>
        <h1>سبد خرید</h1>
        {!cart.isEmpty && (
          <Button variant="ghost" size="sm" onClick={onClear} icon={<Trash2 size={16} />}>
            خالی کردن سبد
          </Button>
        )}
      </header>
      {cart.isEmpty ? (
        <EmptyState icon={ShoppingBag} title="سبد خرید شما خالی است" text="هنوز محصولی انتخاب نکرده‌اید.">
          <Button to="/shop">مشاهدهٔ محصولات</Button>
        </EmptyState>
      ) : (
        <div className={CART_LAYOUT}>
          <ul className="grid gap-3.5">
            <AnimatePresence initial={false}>
              {cart.lines.map((line) => (
                <Row
                  key={line.id}
                  line={line}
                  label={categoryLabel(line.product?.category)}
                  onQty={onQty}
                  onRemove={onRemove}
                />
              ))}
            </AnimatePresence>
          </ul>
          <div className={CART_SIDE}>
            <CouponBox />
            <OrderSummary totals={cart.totals} shippingLabel={cart.method?.label}>
              {!canCheckout && cart.totals.count > 0 && (
                <p className={FIELD_ERROR} role="alert">
                  ابتدا اقلام ناموجود را از سبد حذف کنید.
                </p>
              )}
              {canCheckout ? (
                <Button to="/checkout" size="lg" block>
                  ادامه و ثبت سفارش
                </Button>
              ) : (
                <Button size="lg" block disabled>
                  ادامه و ثبت سفارش
                </Button>
              )}
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  )
}
