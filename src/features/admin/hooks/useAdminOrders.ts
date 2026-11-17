import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useClampPage, useSearchInput, useUrlParams } from '@/shared/hooks/useUrlState'
import { useSeo } from '@/shared/hooks/useSeo'
import { useOrder, useOrders, useUpdateOrderStatus } from '@/features/orders/data/queries'
import { ORDERS_ADMIN_PAGE_SIZE, parseOrderStatus, statusChangeNotice } from '@/features/orders/domain/orderRules'
import type { Order, OrderStatus } from '@/shared/domain/types'

export function useOrderDetails(id: string | null) {
  const { data, isPending, isError, error, refetch } = useOrder(id ?? undefined)
  return { order: data, isPending, isError, error, refetch }
}

export function useAdminOrders() {
  useSeo({ title: 'سفارش‌ها', noindex: true })
  const { params, update, reset, page, setPage } = useUrlParams()
  const q = params.get('q') ?? ''
  const status = parseOrderStatus(params.get('status'))
  const commit = useCallback((value: string) => update({ q: value }, { replace: true }), [update])
  const search = useSearchInput(q, commit)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ order: Order; status: OrderStatus } | null>(null)
  const updateStatus = useUpdateOrderStatus()
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useOrders({
    q: q || undefined,
    status: status || undefined,
    _page: page,
    _limit: ORDERS_ADMIN_PAGE_SIZE,
  })

  const apply = useCallback(
    (order: Order, next: OrderStatus) =>
      updateStatus.mutate(
        { id: order.id, status: next },
        {
          onSuccess: () => toast.success(statusChangeNotice(next)),
          onError: (e) => toast.error(e.message || 'تغییر وضعیت انجام نشد'),
          onSettled: () => setPending(null),
        },
      ),
    [updateStatus],
  )
  const onStatus = useCallback(
    (order: Order, next: OrderStatus | '') => {
      if (!next) return
      if (next === 'canceled') setPending({ order, status: next })
      else apply(order, next)
    },
    [apply],
  )
  const { totalPages, current } = useClampPage({
    page,
    total: data?.total ?? 0,
    pageSize: ORDERS_ADMIN_PAGE_SIZE,
    ready: !!data && !isPlaceholderData,
    setPage,
  })
  return {
    orders: data?.items ?? [],
    total: data?.total ?? 0,
    isPending,
    isError,
    error,
    refetch,
    busy: isPlaceholderData && isFetching,
    search,
    status,
    setStatus: (value: string) => update({ status: value }),
    filtered: Boolean(q || search.text || status),
    clearFilters: () => {
      search.clear()
      reset()
    },
    page: current,
    totalPages,
    setPage,
    detailsId,
    openDetails: setDetailsId,
    closeDetails: () => setDetailsId(null),
    pending,
    cancelPending: () => setPending(null),
    confirmPending: () => pending && apply(pending.order, pending.status),
    isUpdating: updateStatus.isPending,
    onStatus,
  }
}
