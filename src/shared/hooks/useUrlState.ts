import { useQueryClient, type QueryFunctionContext, type QueryKey } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from '@/shared/hooks/useUtils'
import { warmQuery } from '@/shared/data/warmQuery'

type PatchValue = string | number | boolean | null | undefined
interface UpdateOptions {
  resetPage?: boolean
  replace?: boolean
}

export function useUrlParams() {
  const [params, setParams] = useSearchParams()

  const update = useCallback(
    (patch: Record<string, PatchValue>, { resetPage = true, replace = false }: UpdateOptions = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === '' || value == null || value === false || value === 0) next.delete(key)
            else next.set(key, String(value === true ? 1 : value))
          }
          if (resetPage) next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams({}), [setParams])
  const page = Math.max(1, Number(params.get('page')) || 1)
  const setPage = useCallback(
    (value: number, { replace = false }: { replace?: boolean } = {}) =>
      update({ page: value <= 1 ? '' : value }, { resetPage: false, replace }),
    [update],
  )

  return { params, update, reset, page, setPage }
}

export function useSearchInput(urlValue: string, onCommit: (value: string) => void, delay = 350) {
  const [text, setText] = useState(urlValue)
  const debounced = useDebounce(text, delay)
  const dirty = useRef(false)
  const committed = useRef(urlValue)

  useEffect(() => {
    if (urlValue !== committed.current) {
      committed.current = urlValue
      dirty.current = false
      setText(urlValue)
    }
  }, [urlValue])

  useEffect(() => {
    const next = debounced.trim()
    if (dirty.current && next !== committed.current) {
      dirty.current = false
      committed.current = next
      onCommit(next)
    }
  }, [debounced, onCommit])

  const onChange = useCallback((value: string) => {
    dirty.current = true
    setText(value)
  }, [])
  const clear = useCallback(() => {
    dirty.current = false
    committed.current = ''
    setText('')
    onCommit('')
  }, [onCommit])

  return { text, onChange, clear }
}

interface ClampArgs {
  page: number
  total: number | undefined
  pageSize: number
  ready: boolean
  setPage: (page: number, options?: { replace?: boolean }) => void
}

export function useClampPage({ page, total, pageSize, ready, setPage }: ClampArgs) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize))
  useEffect(() => {
    if (ready && page > totalPages) setPage(totalPages, { replace: true })
  }, [ready, page, totalPages, setPage])
  return { totalPages, current: Math.min(page, totalPages) }
}

interface PrefetchArgs<T> {
  current: number
  totalPages: number
  ready: boolean
  queryKey: QueryKey
  queryFn: (signal: QueryFunctionContext['signal']) => Promise<T>
}

export function usePrefetchNext<T>({ current, totalPages, ready, queryKey, queryFn }: PrefetchArgs<T>) {
  const queryClient = useQueryClient()
  const key = JSON.stringify(queryKey)
  const fn = useRef(queryFn)
  fn.current = queryFn
  useEffect(() => {
    if (!ready || current >= totalPages) return
    warmQuery(queryClient, {
      queryKey: JSON.parse(key) as QueryKey,
      queryFn: ({ signal }) => fn.current(signal),
      staleTime: 60_000,
    })
  }, [ready, current, totalPages, key, queryClient])
}
