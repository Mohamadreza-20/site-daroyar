import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/data/client'
import { keys } from '@/shared/data/queryKeys'
import type { Order } from '@/shared/domain/types'
import { useAuthStore } from '@/features/auth/data/store'
import { useCartStore } from '@/features/cart/data/store'
import {
  cancelOrder,
  createOrder,
  fetchOrder,
  fetchOrders,
  updateOrderStatus,
  validateCoupon,
} from '@/features/orders/data/api'

export function useOrders(params: object) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: keys.orderList({ userId, ...params }),
    enabled: Boolean(userId),
    queryFn: ({ signal }) => fetchOrders(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: keys.order(id ?? ''),
    enabled: Boolean(id),
    queryFn: ({ signal }) => fetchOrder(id ?? '', signal),
    staleTime: 30 * 1000,
  })

function useAfterOrderChange() {
  const queryClient = useQueryClient()
  return (order?: Order) => {
    if (order) queryClient.setQueryData(keys.order(order.id), order)
    for (const queryKey of [keys.orders, keys.products, keys.adminStats]) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }
}

export function useCreateOrder() {
  const afterChange = useAfterOrderChange()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      useCartStore.getState().clear()
      afterChange(order)
    },
    onError: (error) => {
      if (isApiError(error) && (error.code === 'CART_CHANGED' || error.code === 'PRICE_CHANGED')) {
        void queryClient.invalidateQueries({ queryKey: keys.products })
      }
    },
  })
}

export const useCancelOrder = () => useMutation({ mutationFn: cancelOrder, onSuccess: useAfterOrderChange() })

export const useUpdateOrderStatus = () =>
  useMutation({ mutationFn: updateOrderStatus, onSuccess: useAfterOrderChange() })

export const useApplyCoupon = () => useMutation({ mutationFn: validateCoupon })
