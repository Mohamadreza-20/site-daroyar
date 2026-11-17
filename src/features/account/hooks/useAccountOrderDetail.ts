import { useParams } from 'react-router'
import { useSeo } from '@/shared/hooks/useSeo'
import { statusOf } from '@/shared/domain/errors'
import { useOrder } from '@/features/orders/data/queries'
import { useCancelOrderFlow } from '@/features/orders/hooks/useCancelOrderFlow'
import { canCancel } from '@/features/orders/domain/orderRules'

export function useAccountOrderDetail() {
  const { id } = useParams()
  useSeo({ title: 'جزئیات سفارش', noindex: true })
  const { data: order, isPending, isError, error, refetch } = useOrder(id)
  const cancel = useCancelOrderFlow('سفارش لغو شد')
  return {
    order,
    isPending,
    isError,
    error,
    retry: statusOf(error) === 404 ? undefined : refetch,
    cancel,
    cancelable: order ? canCancel(order.status) : false,
  }
}
