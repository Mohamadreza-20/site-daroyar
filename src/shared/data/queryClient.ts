import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/data/client'
import { useAuthStore } from '@/features/auth/data/store'

const NO_RETRY = new Set([400, 401, 403, 404, 409, 422, 429])
const PRIVATE_KEYS = ['orders', 'wishlist', 'messages', 'admin', 'me']

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, error) => !(isApiError(error) && NO_RETRY.has(error.status)) && count < 1,
    },
    mutations: { retry: false },
  },
})

useAuthStore.subscribe((state, previous) => {
  if (previous.user && !state.user) {
    for (const key of PRIVATE_KEYS) queryClient.removeQueries({ queryKey: [key] })
  }
})
