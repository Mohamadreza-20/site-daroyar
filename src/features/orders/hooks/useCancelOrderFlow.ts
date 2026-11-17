import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useCancelOrder } from '@/features/orders/data/queries'

export function useCancelOrderFlow(successText: string) {
  const cancel = useCancelOrder()
  const [targetId, setTargetId] = useState<string | null>(null)
  const ask = useCallback((id: string) => setTargetId(id), [])
  const close = useCallback(() => setTargetId(null), [])
  const confirm = useCallback(() => {
    if (!targetId) return
    cancel.mutate(targetId, {
      onSuccess: () => {
        toast.success(successText)
        setTargetId(null)
      },
      onError: (e) => {
        toast.error(e.message || 'لغو سفارش انجام نشد')
        setTargetId(null)
      },
    })
  }, [targetId, cancel, successText])
  return { open: targetId !== null, ask, close, confirm, isPending: cancel.isPending }
}
