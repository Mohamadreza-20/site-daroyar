import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keys } from '@/shared/data/queryKeys'
import { useAuthStore } from '@/features/auth/data/store'
import {
  fetchAdminMessages,
  fetchMyMessages,
  replyToMessage,
  sendContactMessage,
  subscribeNewsletter,
} from '@/features/contact/data/api'

export function useMyMessages() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: [...keys.myMessages, userId],
    enabled: Boolean(userId),
    queryFn: ({ signal }) => fetchMyMessages(signal),
    staleTime: 30 * 1000,
  })
}

export const useAdminMessages = (params: object) =>
  useQuery({
    queryKey: keys.adminMessages(params),
    queryFn: ({ signal }) => fetchAdminMessages(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.messages }),
  })
}

export function useReplyMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: replyToMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] })
      void queryClient.invalidateQueries({ queryKey: keys.messages })
    },
  })
}

export const useSubscribeNewsletter = () => useMutation({ mutationFn: subscribeNewsletter })
