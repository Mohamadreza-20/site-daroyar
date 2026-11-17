import { lazy, Suspense } from 'react'
import { Package, Plus, Search } from 'lucide-react'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import { EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import {
  ADMIN_FILTERS,
  ADMIN_SEARCH,
  CARD_ROW,
  MINI_SELECT,
  PANEL_TITLE,
  SEARCH_ICON,
  SEARCH_INPUT,
  STACK,
  TABLE,
  TABLE_WRAP,
  TH,
  TOOLBAR_SORT,
} from '@/shared/ui/common/styles'
import Modal, { ConfirmDialog } from '@/shared/ui/common/Modal'
import ModalFallback from '@/shared/ui/loaders/ModalFallback'
import AdminProductRow from '@/features/admin/components/AdminProductRow'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { AdminTableSkeleton } from '@/shared/ui/loaders/AdminSkeletons'
import { LOW_STOCK } from '@/shared/domain/constants'
import { formatNumber } from '@/shared/domain/format'

const ProductForm = lazy(() => import('@/features/admin/components/ProductForm'))

export default function AdminProducts() {
  const vm = useAdminProducts()
  if (vm.isPending) return <AdminTableSkeleton label="در حال دریافت فهرست محصولات…" variant="capsule" />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <div className={CARD_ROW}>
        <h1 className={PANEL_TITLE}>مدیریت محصولات ({formatNumber(vm.total)})</h1>
        <Button onClick={vm.startNew} icon={<Plus size={18} />}>
          محصول جدید
        </Button>
      </div>
      <div className={ADMIN_FILTERS}>
        <label className={ADMIN_SEARCH}>
          <Search size={18} className={SEARCH_ICON} aria-hidden="true" />
          <input
            className={SEARCH_INPUT}
            type="search"
            value={vm.search.text}
            onChange={(e) => vm.search.onChange(e.target.value)}
            placeholder="جستجو در محصولات…"
            aria-label="جستجو در محصولات"
          />
        </label>
        <label className={TOOLBAR_SORT}>
          <span className="max-[641px]:hidden">دسته:</span>
          <select className={MINI_SELECT} value={vm.category} onChange={(e) => vm.setCategory(e.target.value)}>
            <option value="">همه</option>
            {vm.categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={TOOLBAR_SORT}>
          <span className="max-[641px]:hidden">موجودی:</span>
          <select className={MINI_SELECT} value={vm.stockFilter} onChange={(e) => vm.setStockFilter(e.target.value)}>
            <option value="">همه</option>
            <option value="available">موجود</option>
            <option value="low">کم‌موجودی (کمتر از {formatNumber(LOW_STOCK)})</option>
            <option value="out">ناموجود</option>
          </select>
        </label>
        {vm.hasFilters && (
          <Button variant="ghost" size="sm" onClick={vm.resetFilters}>
            پاک کردن فیلترها
          </Button>
        )}
      </div>
      {vm.products.length ? (
        <>
          <BusyOverlay busy={vm.busy} label="در حال دریافت محصولات…">
            <div className={TABLE_WRAP}>
              <table className={TABLE}>
                <caption className="sr-only">فهرست محصولات</caption>
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      محصول
                    </th>
                    <th scope="col" className={TH}>
                      دسته
                    </th>
                    <th scope="col" className={TH}>
                      قیمت
                    </th>
                    <th scope="col" className={TH}>
                      موجودی
                    </th>
                    <th scope="col" className={TH}>
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vm.products.map((p) => (
                    <AdminProductRow
                      key={p.id}
                      product={p}
                      onEdit={vm.startEdit}
                      onDelete={vm.askDelete}
                      onStock={vm.saveStock}
                      savingStock={vm.stockSavingId === p.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </BusyOverlay>
          <Pagination page={vm.page} totalPages={vm.totalPages} onChange={vm.setPage} />
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="محصولی پیدا نشد"
          text={vm.hasFilters ? 'فیلترها را تغییر دهید.' : 'هنوز محصولی ثبت نشده است.'}
        >
          {vm.hasFilters && (
            <Button variant="soft" onClick={vm.resetFilters}>
              پاک کردن فیلترها
            </Button>
          )}
        </EmptyState>
      )}

      <Modal
        open={Boolean(vm.editing)}
        onClose={vm.closeForm}
        title={vm.editing === 'new' ? 'افزودن محصول' : 'ویرایش محصول'}
        size="lg"
      >
        <Suspense fallback={<ModalFallback />}>
          <ProductForm
            product={vm.editing === 'new' ? null : vm.editing}
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
        onConfirm={vm.confirmDelete}
        loading={vm.isDeleting}
        title="حذف محصول"
        text={`«${vm.deleting?.title ?? ''}» برای همیشه حذف شود؟`}
        confirmLabel="حذف"
      />
    </div>
  )
}
