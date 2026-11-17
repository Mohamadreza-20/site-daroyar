import { memo, useCallback } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { CARD } from '@/shared/ui/common/styles'
import { ORDER_STATUS, PAYMENT_METHODS } from '@/shared/domain/constants'
import { formatDate, formatNumber, formatToman } from '@/shared/domain/format'
import { handleImgError } from '@/shared/ui/lib/image'
import type { Order } from '@/shared/domain/types'
import { canCancel } from '@/features/orders/domain/orderRules'

const OCARD_BAR = 'flex flex-wrap items-center justify-between gap-3'

interface OrderCardProps {
  order: Order
  onCancel?: (id: string) => void
}

const OrderCard = memo(function OrderCard({ order, onCancel }: OrderCardProps) {
  const status = ORDER_STATUS[order.status]
  const handleCancel = useCallback(() => onCancel?.(order.id), [onCancel, order.id])
  return (
    <li className={CARD}>
      <header className={OCARD_BAR}>
        <div>
          <b dir="ltr">{order.id}</b>
          <small className="block text-muted">{formatDate(order.createdAt)}</small>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </header>
      <ul className="my-4 grid gap-2.5 border-y border-dashed border-line py-3.5">
        {order.items.map((i) => (
          <li key={i.productId} className="flex items-center gap-3">
            <Link to={`/product/${i.productId}`} aria-label={i.title}>
              <img
                className="size-[52px] rounded-[12px] bg-bg-2 object-cover"
                onError={handleImgError}
                src={i.thumbnail}
                alt=""
                width={52}
                height={52}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <span dir="auto" className="line-clamp-2 flex-1 text-[14px]">
              {i.title}
            </span>
            <small>× {formatNumber(i.qty)}</small>
          </li>
        ))}
      </ul>
      <footer className={OCARD_BAR}>
        <p className="text-[14px] text-muted [&_b]:text-ink">
          پرداخت: <b>{PAYMENT_METHODS[order.payment]}</b> · مبلغ: <b>{formatToman(order.totals.total)}</b>
        </p>
        <div className="flex gap-2">
          <Button to={`/account/orders/${order.id}`} variant="soft" size="sm">
            جزئیات سفارش
          </Button>
          {onCancel && canCancel(order.status) && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              لغو سفارش
            </Button>
          )}
        </div>
      </footer>
    </li>
  )
})

export default OrderCard
