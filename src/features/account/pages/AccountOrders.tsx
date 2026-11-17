import { Package } from 'lucide-react'
import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import { EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { PANEL_TITLE, STACK } from '@/shared/ui/common/styles'
import { ConfirmDialog } from '@/shared/ui/common/Modal'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { PanelOrdersSkeleton } from '@/shared/ui/loaders/PanelSkeletons'
import { useAccountOrders } from '@/features/account/hooks/useAccountOrders'
import OrderCard from '@/features/account/components/OrderCard'

export default function AccountOrders() {
  const vm = useAccountOrders()
  if (vm.isPending) return <PanelOrdersSkeleton />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>سفارش‌های من</h1>
      {vm.orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="هنوز سفارشی ندارید"
          text="بعد از ثبت اولین سفارش، وضعیت آن را اینجا می‌بینید."
        >
          <Button to="/shop">رفتن به فروشگاه</Button>
        </EmptyState>
      ) : (
        <>
          <BusyOverlay busy={vm.busy} label="در حال دریافت سفارش‌ها…">
            <ul className={STACK}>
              {vm.orders.map((o) => (
                <OrderCard key={o.id} order={o} onCancel={vm.cancel.ask} />
              ))}
            </ul>
          </BusyOverlay>
          <Pagination page={vm.page} totalPages={vm.totalPages} onChange={vm.setPage} />
        </>
      )}
      <ConfirmDialog
        open={vm.cancel.open}
        onClose={vm.cancel.close}
        onConfirm={vm.cancel.confirm}
        loading={vm.cancel.isPending}
        title="لغو سفارش"
        text="آیا از لغو این سفارش مطمئن هستید؟ موجودی کالاها به انبار برمی‌گردد."
        confirmLabel="بله، لغو شود"
      />
    </div>
  )
}
