import { lazy } from 'react'
import { ReceiptText, Search } from 'lucide-react'
import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import { EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { ConfirmDialog } from '@/shared/ui/common/Modal'
import {
  ADMIN_FILTERS,
  ADMIN_SEARCH,
  PANEL_TITLE,
  SEARCH_ICON,
  SEARCH_INPUT,
  STACK,
  TABLE,
  TABLE_WRAP,
  TH,
  chipClass,
} from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { AdminTableSkeleton } from '@/shared/ui/loaders/AdminSkeletons'
import { formatNumber } from '@/shared/domain/format'
import { ORDER_STATUS_FILTERS } from '@/features/orders/domain/orderRules'
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders'
import AdminOrderRow from '@/features/admin/components/AdminOrderRow'
import Deferred from '@/shared/ui/common/Deferred'

const OrderDetailsModal = lazy(() => import('@/features/admin/components/OrderDetailsModal'))

export default function AdminOrders() {
  const vm = useAdminOrders()
  if (vm.isPending) return <AdminTableSkeleton label="در حال دریافت سفارش‌ها…" />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>سفارش‌ها ({formatNumber(vm.total)})</h1>
      <div className={ADMIN_FILTERS}>
        <label className={ADMIN_SEARCH}>
          <Search size={18} className={SEARCH_ICON} aria-hidden="true" />
          <input
            className={SEARCH_INPUT}
            type="search"
            value={vm.search.text}
            onChange={(e) => vm.search.onChange(e.target.value)}
            placeholder="شماره سفارش، نام مشتری یا شهر…"
            aria-label="جستجو در سفارش‌ها"
          />
        </label>
        {vm.filtered && (
          <Button variant="ghost" size="sm" onClick={vm.clearFilters}>
            پاک کردن فیلترها
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="فیلتر وضعیت سفارش">
        {ORDER_STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={chipClass(vm.status === f.value)}
            aria-pressed={vm.status === f.value}
            onClick={() => vm.setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {vm.orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={vm.filtered ? 'سفارشی با این فیلتر پیدا نشد' : 'هنوز سفارشی ثبت نشده'}
          text={vm.filtered ? undefined : 'با حساب مشتری یک سفارش ثبت کنید تا اینجا دیده شود.'}
        />
      ) : (
        <>
          <BusyOverlay busy={vm.busy} label="در حال دریافت سفارش‌ها…">
            <div className={TABLE_WRAP}>
              <table className={TABLE}>
                <caption className="sr-only">فهرست سفارش‌ها</caption>
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      شمارهٔ سفارش
                    </th>
                    <th scope="col" className={TH}>
                      مشتری
                    </th>
                    <th scope="col" className={TH}>
                      تاریخ
                    </th>
                    <th scope="col" className={TH}>
                      تعداد
                    </th>
                    <th scope="col" className={TH}>
                      مبلغ
                    </th>
                    <th scope="col" className={TH}>
                      وضعیت
                    </th>
                    <th scope="col" className={TH}>
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vm.orders.map((o) => (
                    <AdminOrderRow key={o.id} order={o} onStatus={vm.onStatus} onDetails={vm.openDetails} />
                  ))}
                </tbody>
              </table>
            </div>
          </BusyOverlay>
          <Pagination page={vm.page} totalPages={vm.totalPages} onChange={vm.setPage} />
        </>
      )}
      <Deferred when={Boolean(vm.detailsId)}>
        <OrderDetailsModal id={vm.detailsId} onClose={vm.closeDetails} />
      </Deferred>
      <ConfirmDialog
        open={Boolean(vm.pending)}
        onClose={vm.cancelPending}
        loading={vm.isUpdating}
        title="لغو سفارش"
        text={`سفارش ${vm.pending?.order.id ?? ''} لغو شود؟ این کار قابل بازگشت نیست و موجودی کالاها به انبار برمی‌گردد.`}
        confirmLabel="بله، لغو شود"
        onConfirm={vm.confirmPending}
      />
    </div>
  )
}
