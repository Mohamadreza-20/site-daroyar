import { lazy, Suspense } from 'react'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/ui/common/Primitives'
import Button, { ICON_BTN } from '@/shared/ui/common/Button'
import { CARD_ROW, PANEL_TITLE, ROW_ACTIONS, STACK, TABLE, TABLE_WRAP, TD, TH, TR } from '@/shared/ui/common/styles'
import Modal, { ConfirmDialog } from '@/shared/ui/common/Modal'
import ModalFallback from '@/shared/ui/loaders/ModalFallback'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { AdminTableSkeleton } from '@/shared/ui/loaders/AdminSkeletons'
import { cn } from '@/shared/ui/lib/cn'
import { formatNumber } from '@/shared/domain/format'
import { useAdminCategories } from '@/features/admin/hooks/useAdminCategories'

const CategoryForm = lazy(() => import('@/features/admin/components/CategoryForm'))

export default function AdminCategories() {
  const vm = useAdminCategories()
  if (vm.isPending) return <AdminTableSkeleton label="در حال دریافت دسته‌بندی‌ها…" />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <div className={CARD_ROW}>
        <h1 className={PANEL_TITLE}>دسته‌بندی‌ها ({formatNumber(vm.categories.length)})</h1>
        <Button onClick={vm.startNew} icon={<Plus size={18} />}>
          دستهٔ جدید
        </Button>
      </div>
      {vm.categories.length ? (
        <div className={TABLE_WRAP}>
          <table className={TABLE}>
            <caption className="sr-only">فهرست دسته‌بندی‌ها</caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  نام
                </th>
                <th scope="col" className={TH}>
                  شناسه
                </th>
                <th scope="col" className={TH}>
                  تعداد محصول
                </th>
                <th scope="col" className={TH}>
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {vm.categories.map((item) => (
                <tr key={item.id} className={TR}>
                  <td className={TD}>
                    <b>{item.label}</b>
                    <small className="block text-muted">{item.blurb}</small>
                  </td>
                  <td dir="ltr" className={cn(TD, 'text-start')}>
                    {item.slug}
                  </td>
                  <td className={TD}>{formatNumber(vm.counts?.[item.slug] ?? 0)}</td>
                  <td className={TD}>
                    <div className={ROW_ACTIONS}>
                      <button
                        type="button"
                        className={cn(ICON_BTN, 'size-[38px]')}
                        onClick={() => vm.startEdit(item)}
                        aria-label={`ویرایش ${item.label}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className={cn(ICON_BTN, 'size-[38px] hover:bg-danger-50 hover:text-danger')}
                        onClick={() => vm.askDelete(item)}
                        aria-label={`حذف ${item.label}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Tags} title="دسته‌ای وجود ندارد" text="با دکمهٔ «دستهٔ جدید» اولین دسته را بسازید." />
      )}
      <Modal
        open={Boolean(vm.editing)}
        onClose={vm.closeForm}
        title={vm.editing === 'new' ? 'افزودن دسته' : 'ویرایش دسته'}
      >
        <Suspense fallback={<ModalFallback />}>
          <CategoryForm
            category={vm.editing === 'new' ? null : vm.editing}
            loading={vm.saving}
            serverError={vm.serverError}
            onSubmit={vm.submit}
            onCancel={vm.closeForm}
          />
        </Suspense>
      </Modal>
      <ConfirmDialog
        open={Boolean(vm.deleting)}
        onClose={vm.cancelDelete}
        loading={vm.isDeleting}
        title="حذف دسته"
        text={`دستهٔ «${vm.deleting?.label ?? ''}» حذف شود؟ دسته‌ای که محصول دارد حذف نمی‌شود.`}
        confirmLabel="حذف"
        onConfirm={vm.confirmDelete}
      />
    </div>
  )
}
