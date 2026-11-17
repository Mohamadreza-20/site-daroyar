import Modal from '@/shared/ui/common/Modal'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import OrderDetails from '@/features/orders/components/OrderDetails'
import { useOrderDetails } from '@/features/admin/hooks/useAdminOrders'

function OrderDetailsModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { order: data, isPending, isError, error, refetch } = useOrderDetails(id)
  return (
    <Modal open={Boolean(id)} onClose={onClose} title="جزئیات سفارش" size="lg">
      {isPending && (
        <p className="text-muted" role="status">
          در حال دریافت…
        </p>
      )}
      {isError && <ErrorState error={error} onRetry={refetch} compact home={false} />}
      {data && (
        <>
          <OrderDetails order={data} />
          {data.user && (
            <p className="mt-4 text-muted">
              حساب کاربری: <b dir="ltr">@{data.user.username}</b> — {data.user.email}
            </p>
          )}
        </>
      )}
    </Modal>
  )
}

export default OrderDetailsModal
