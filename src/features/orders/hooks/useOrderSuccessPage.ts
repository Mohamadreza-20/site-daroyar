import { useParams } from 'react-router'
import { statusOf } from '@/shared/domain/errors'
import { useSeo } from '@/shared/hooks/useSeo'
import { useOrder } from '@/features/orders/data/queries'

export function useOrderSuccessPage() {
  useSeo({ title: 'سفارش ثبت شد', noindex: true })
  const { id } = useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(id)
  return { order, isPending, isError, error, retry: statusOf(error) === 404 ? undefined : refetch }
}
