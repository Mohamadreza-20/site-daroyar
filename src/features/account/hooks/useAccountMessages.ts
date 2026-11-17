import { useSeo } from '@/shared/hooks/useSeo'
import { useMyMessages } from '@/features/contact/data/queries'

export function useAccountMessages() {
  useSeo({ title: 'پیام‌های من', noindex: true })
  const { data, isPending, isError, error, refetch } = useMyMessages()
  return { messages: data ?? [], isPending, isError, error, refetch }
}
