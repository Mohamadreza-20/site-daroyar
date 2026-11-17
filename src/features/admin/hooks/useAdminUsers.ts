import { useCallback } from 'react'
import { useClampPage, useSearchInput, useUrlParams } from '@/shared/hooks/useUrlState'
import { useSeo } from '@/shared/hooks/useSeo'
import { useUsers } from '@/features/admin/data/queries'
import { USERS_PAGE_SIZE } from '@/features/admin/domain/userRules'

export function useAdminUsers() {
  useSeo({ title: 'کاربران', noindex: true })
  const { params, update, page, setPage } = useUrlParams()
  const q = params.get('q') ?? ''
  const commit = useCallback((value: string) => update({ q: value }, { replace: true }), [update])
  const search = useSearchInput(q, commit)
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useUsers({
    q: q || undefined,
    _page: page,
    _limit: USERS_PAGE_SIZE,
  })
  const { totalPages, current } = useClampPage({
    page,
    total: data?.total ?? 0,
    pageSize: USERS_PAGE_SIZE,
    ready: !!data && !isPlaceholderData,
    setPage,
  })
  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    isPending,
    isError,
    error,
    refetch,
    busy: isPlaceholderData && isFetching,
    search,
    page: current,
    totalPages,
    setPage,
  }
}
