import { useClampPage, useUrlParams } from '@/shared/hooks/useUrlState'
import { useSeo } from '@/shared/hooks/useSeo'
import { useOrders } from '@/features/orders/data/queries'
import { useCancelOrderFlow } from '@/features/orders/hooks/useCancelOrderFlow'
import { ORDERS_PAGE_SIZE } from '@/features/account/domain/accountRules'

export function useAccountOrders() {
  useSeo({ title: 'سفارش‌های من', noindex: true })
  const { page, setPage } = useUrlParams()
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useOrders({
    _page: page,
    _limit: ORDERS_PAGE_SIZE,
  })
  const cancel = useCancelOrderFlow('سفارش لغو شد و موجودی کالاها بازگردانده شد')
  const { totalPages, current } = useClampPage({
    page,
    total: data?.total ?? 0,
    pageSize: ORDERS_PAGE_SIZE,
    ready: !!data && !isPlaceholderData,
    setPage,
  })
  return {
    orders: data?.items ?? [],
    isPending,
    isError,
    error,
    refetch,
    busy: isPlaceholderData && isFetching,
    page: current,
    totalPages,
    setPage,
    cancel,
  }
}
