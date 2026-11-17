import { memo, useCallback, type ChangeEvent } from 'react'
import { Badge } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { MINI_SELECT, ROW_ACTIONS, TD, TR } from '@/shared/ui/common/styles'
import { ORDER_STATUS } from '@/shared/domain/constants'
import { formatDate, formatNumber, formatToman } from '@/shared/domain/format'
import type { Order, OrderStatus } from '@/shared/domain/types'
import { itemCount, nextStatuses } from '@/features/orders/domain/orderRules'

interface RowProps {
  order: Order
  onStatus: (order: Order, next: OrderStatus | '') => void
  onDetails: (id: string) => void
}

const AdminOrderRow = memo(function AdminOrderRow({ order, onStatus, onDetails }: RowProps) {
  const change = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onStatus(order, e.target.value as OrderStatus | ''),
    [onStatus, order],
  )
  const options = nextStatuses(order.status)
  return (
    <tr className={TR}>
      <td className={TD}>
        <b dir="ltr">{order.id}</b>
      </td>
      <td className={TD}>
        {order.customer}
        <small className="block text-muted">{order.shipping?.city}</small>
      </td>
      <td className={TD}>{formatDate(order.createdAt)}</td>
      <td className={TD}>{formatNumber(itemCount(order))}</td>
      <td className={TD}>
        <b>{formatToman(order.totals.total)}</b>
      </td>
      <td className={TD}>
        <Badge tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</Badge>
      </td>
      <td className={TD}>
        <div className={ROW_ACTIONS}>
          <select
            className={MINI_SELECT}
            value=""
            onChange={change}
            disabled={!options.length}
            aria-label={`تغییر وضعیت سفارش ${order.id}`}
          >
            <option value="">{options.length ? 'تغییر وضعیت…' : 'بدون تغییر'}</option>
            {options.map((key) => (
              <option key={key} value={key}>
                {ORDER_STATUS[key].label}
              </option>
            ))}
          </select>
          <Button size="sm" variant="soft" onClick={() => onDetails(order.id)}>
            جزئیات
          </Button>
        </div>
      </td>
    </tr>
  )
})

export default AdminOrderRow
