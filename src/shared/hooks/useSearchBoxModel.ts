import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
  type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router'
import { useProducts } from '@/features/catalog/data/queries'
import { useDebounce } from '@/shared/hooks/useUtils'

const MIN_CHARS = 2
const LIMIT = 6

export function useSearchBoxModel() {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const term = q.trim()
  const debounced = useDebounce(term, 300)
  const enabled = debounced.length >= MIN_CHARS
  const { data, isFetching } = useProducts({ q: debounced, limit: LIMIT }, { enabled })
  const items = useMemo(() => (enabled ? (data?.items ?? []) : []), [enabled, data])
  const settled = enabled && term === debounced && !isFetching
  const showPanel = open && term.length >= MIN_CHARS

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const close = useCallback(() => {
    setOpen(false)
    setActive(-1)
  }, [])

  const goShop = useCallback(() => {
    close()
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop')
  }, [close, navigate, term])

  const onSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (active >= 0 && items[active]) {
        close()
        navigate(`/product/${items[active].id}`)
        return
      }
      goShop()
    },
    [active, items, close, navigate, goShop],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }
      if (!showPanel || !items.length) return
      const step = ({ ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[event.key]
      if (!step) return
      event.preventDefault()
      setActive((index) => (index + step + items.length) % items.length)
    },
    [showPanel, items.length, close],
  )

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQ(event.target.value)
    setActive(-1)
    setOpen(true)
  }, [])

  const onFocus = useCallback(() => setOpen(true), [])

  const clear = useCallback(() => {
    setQ('')
    close()
  }, [close])

  return {
    listId,
    rootRef,
    q,
    active,
    items,
    settled,
    showPanel,
    close,
    goShop,
    onSubmit,
    onKeyDown,
    onChange,
    onFocus,
    clear,
  }
}
