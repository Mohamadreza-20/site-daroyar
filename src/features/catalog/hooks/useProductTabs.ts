import { useCallback, useRef, type KeyboardEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { useAuthStore } from '@/features/auth/data/store'
import { tabForKey, tabFromParam, type ProductTabId } from '@/features/catalog/domain/productTabs'
import type { Review } from '@/shared/domain/types'

export function useProductTabs() {
  const [params, setParams] = useSearchParams()
  const tab = tabFromParam(params.get('tab'))
  const listRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (id: ProductTabId) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id === 'desc') next.delete('tab')
          else next.set('tab', id)
          return next
        },
        { replace: true, preventScrollReset: true },
      ),
    [setParams],
  )

  const onKeyDown = (event: KeyboardEvent) => {
    const target = tabForKey(tab, event.key)
    if (!target) return
    event.preventDefault()
    select(target)
    listRef.current?.querySelector<HTMLElement>(`#ptab-${target}`)?.focus()
  }

  return { tab, select, onKeyDown, listRef }
}

type ReviewComposerState = 'login' | 'hidden' | 'reviewed' | 'form'

export function useReviewComposer(reviews: readonly Review[] | undefined) {
  const user = useAuthStore((s) => s.user)
  const { pathname, search } = useLocation()
  const state: ReviewComposerState = !user
    ? 'login'
    : user.role === 'admin'
      ? 'hidden'
      : reviews?.some((review) => review.userId === user.id)
        ? 'reviewed'
        : 'form'
  return { state, loginFrom: `${pathname}${search}` }
}
