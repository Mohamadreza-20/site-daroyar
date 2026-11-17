import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { keys } from '@/shared/data/queryKeys'
import { useAuthStore } from '@/features/auth/data/store'
import { addToWishlist, fetchWishlist, removeFromWishlist } from '@/features/wishlist/data/api'

const EMPTY: readonly number[] = []

export function useWishlist() {
  const userId = useAuthStore((s) => s.user?.id)
  const isCustomer = useAuthStore((s) => s.user?.role === 'customer')
  return useQuery({
    queryKey: [...keys.wishlist, userId],
    enabled: isCustomer,
    queryFn: ({ signal }) => fetchWishlist(signal),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCanWish = (): boolean => useAuthStore((s) => s.user?.role !== 'admin')

export const useWishlistIds = (): readonly number[] => useWishlist().data ?? EMPTY

export function useIsWished(id: number | string): boolean {
  const ids = useWishlistIds()
  return useMemo(() => ids.includes(Number(id)), [ids, id])
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  const key = [...keys.wishlist, userId]
  return useMutation({
    mutationFn: ({ id, wished }: { id: number; wished: boolean }) =>
      wished ? removeFromWishlist(id) : addToWishlist(id),
    onMutate: async ({ id, wished }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<number[]>(key) ?? []
      queryClient.setQueryData(key, wished ? previous.filter((item) => item !== id) : [...previous, id])
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous ?? []),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
