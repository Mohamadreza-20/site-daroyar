import OrderDetails from '@/features/orders/components/OrderDetails'
import Button from '@/shared/ui/common/Button'
import { CARD, CARD_ROW, PANEL_TITLE, STACK } from '@/shared/ui/common/styles'
import { ConfirmDialog } from '@/shared/ui/common/Modal'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { PanelOrdersSkeleton } from '@/shared/ui/loaders/PanelSkeletons'
import { useAccountOrderDetail } from '@/features/account/hooks/useAccountOrderDetail'

export default function AccountOrderDetail() {
  const { order, isPending, isError, error, retry, cancel, cancelable } = useAccountOrderDetail()

  if (isPending) return <PanelOrdersSkeleton />
  if (isError || !order) return <ErrorState error={error} onRetry={retry} compact home={false} />

  return (
    <div className={STACK}>
      <div className={CARD_ROW}>
        <h1 className={PANEL_TITLE}>جزئیات سفارش</h1>
        <Button to="/account/orders" variant="ghost" size="sm">
          بازگشت به سفارش‌ها
        </Button>
      </div>
      <section className={CARD}>
        <OrderDetails order={order} />
        {cancelable && (
          <Button variant="outline" className="mt-5" onClick={() => cancel.ask(order.id)}>
            لغو سفارش
          </Button>
        )}
      </section>
      <ConfirmDialog
        open={cancel.open}
        onClose={cancel.close}
        loading={cancel.isPending}
        title="لغو سفارش"
        text="آیا از لغو این سفارش مطمئن هستید؟"
        confirmLabel="بله، لغو شود"
        onConfirm={cancel.confirm}
      />
    </div>
  )
}
