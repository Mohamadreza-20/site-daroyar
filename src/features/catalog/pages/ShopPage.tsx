import { memo } from 'react'
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import { useShopPage } from '@/features/catalog/hooks/useShopPage'
import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import type { SortKey } from '@/shared/domain/types'
import { Breadcrumb, EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import Button, { ICON_BTN } from '@/shared/ui/common/Button'
import { MINI_SELECT, PAGEHEAD, SEARCHFIELD, SEARCH_CLEAR, SEARCH_ICON, SEARCH_INPUT } from '@/shared/ui/common/styles'
import ProductGrid from '@/features/catalog/components/ProductGrid'
import ShopFilters from '@/features/catalog/components/ShopFilters'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { ShopSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import { SORT_OPTIONS } from '@/shared/domain/constants'
import { formatNumber } from '@/shared/domain/format'

interface ToolbarProps {
  total: number
  sort: SortKey
  onSort: (value: SortKey) => void
  onOpenFilters: () => void
}

const Toolbar = memo(function Toolbar({ total, sort, onSort, onOpenFilters }: ToolbarProps) {
  return (
    <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
      <p>
        <b>{formatNumber(total)}</b> محصول
      </p>
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden max-[1025px]:inline-flex"
          onClick={onOpenFilters}
          icon={<SlidersHorizontal size={16} />}
        >
          فیلترها
        </Button>
        <label className="flex items-center gap-2 text-[13.5px] text-muted">
          <span className="max-[641px]:hidden">مرتب‌سازی:</span>
          <select className={MINI_SELECT} value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
})

export default function ShopPage() {
  const {
    filters,
    categories,
    categoryLabel,
    priceBounds,
    products,
    total,
    page,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isBusy,
    search,
    drawer,
    dialogRef,
    openFilters,
    closeFilters,
    onSort,
    onPage,
    onReset,
    onFilterChange,
  } = useShopPage()

  if (isLoading) return <ShopSkeleton />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const filtersNode = (
    <ShopFilters
      categories={categories}
      category={filters.category}
      maxPrice={filters.maxPrice}
      priceBounds={priceBounds}
      onlyAvailable={filters.onlyAvailable}
      onlyDiscount={filters.onlyDiscount}
      onChange={onFilterChange}
      onReset={onReset}
    />
  )

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'فروشگاه' }]} />
      <header className={PAGEHEAD}>
        <h1>{categoryLabel ?? 'فروشگاه نمایشی دارویار'}</h1>
        <label className={SEARCHFIELD}>
          <Search size={18} className={SEARCH_ICON} aria-hidden="true" />
          <input
            className={SEARCH_INPUT}
            type="search"
            value={search.text}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="نام محصول یا برند…"
            aria-label="جستجو در محصولات"
          />
          {search.text && (
            <button type="button" className={SEARCH_CLEAR} onClick={search.clear} aria-label="پاک کردن">
              <X size={16} className="absolute start-3.5 text-muted" />
            </button>
          )}
        </label>
      </header>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] items-start gap-7 pb-5 max-[1025px]:grid-cols-1">
        <aside className="sticky top-[calc(var(--header-h)+16px)] rounded-lg border border-line bg-surface p-[22px] max-[1025px]:hidden">
          {filtersNode}
        </aside>
        <div>
          <Toolbar total={total} sort={filters.sort} onSort={onSort} onOpenFilters={openFilters} />
          {products.length ? (
            <>
              <BusyOverlay busy={isBusy} label="در حال دریافت محصولات…">
                <ProductGrid products={products} />
              </BusyOverlay>
              <Pagination page={page} totalPages={totalPages} onChange={onPage} />
            </>
          ) : (
            <EmptyState icon={PackageSearch} title="محصولی پیدا نشد" text="فیلترها یا عبارت جستجو را تغییر دهید.">
              <Button variant="soft" onClick={onReset}>
                حذف همهٔ فیلترها
              </Button>
            </EmptyState>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-[rgba(10,30,34,0.5)] backdrop-blur-[3px]" onClick={closeFilters} />
          <aside
            ref={dialogRef}
            tabIndex={-1}
            className="absolute top-0 bottom-0 start-0 flex w-[min(100%,420px)] flex-col bg-surface shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="فیلترها"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2.5 text-[18px]">فیلترها</h2>
              <button type="button" className={ICON_BTN} onClick={closeFilters} aria-label="بستن">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filtersNode}</div>
            <div className="grid gap-2.5 border-t border-line bg-surface px-5 pt-4 pb-5">
              <Button block onClick={closeFilters}>
                نمایش {formatNumber(total)} محصول
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
