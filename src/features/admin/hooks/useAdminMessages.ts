import { useClampPage, useUrlParams } from '@/shared/hooks/useUrlState'
import { useSeo } from '@/shared/hooks/useSeo'
import { useAdminMessages as useAdminMessagesQuery } from '@/features/contact/data/queries'
import { MESSAGES_PAGE_SIZE, parseMessageStatus } from '@/features/admin/domain/messageRules'

export function useAdminMessagesPage() {
  useSeo({ title: 'پیام‌ها', noindex: true })
  const { params, update, page, setPage } = useUrlParams()
  const status = parseMessageStatus(params.get('status'))
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useAdminMessagesQuery({
    status: status || undefined,
    _page: page,
    _limit: MESSAGES_PAGE_SIZE,
  })
  const { totalPages, current } = useClampPage({
    page,
    total: data?.total ?? 0,
    pageSize: MESSAGES_PAGE_SIZE,
    ready: !!data && !isPlaceholderData,
    setPage,
  })
  return {
    messages: data?.items ?? [],
    total: data?.total ?? 0,
    isPending,
    isError,
    error,
    refetch,
    busy: isPlaceholderData && isFetching,
    status,
    setStatus: (value: string) => update({ status: value }),
    page: current,
    totalPages,
    setPage,
  }
}
