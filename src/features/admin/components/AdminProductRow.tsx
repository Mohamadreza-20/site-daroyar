import { memo, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Product } from '@/shared/domain/types'
import { useCategoryLabelOf } from '@/features/catalog/hooks/useCategoryLabel'
import { useStockEditor } from '@/features/admin/hooks/useStockEditor'
import { stockTone } from '@/features/admin/domain/productRules'
import { Badge } from '@/shared/ui/common/Primitives'
import Button, { ICON_BTN } from '@/shared/ui/common/Button'
import { CELL_USER, CELL_USER_NAME, MINI_SELECT, ROW_ACTIONS, TD, THUMB, TR } from '@/shared/ui/common/styles'
import { cn } from '@/shared/ui/lib/cn'
import { formatNumber, formatToman } from '@/shared/domain/format'
import { handleImgError } from '@/shared/ui/lib/image'

interface StockEditorProps {
  product: Product
  onSave: (id: number, stock: number) => void
  saving: boolean
}

const StockEditor = memo(function StockEditor({ product, onSave, saving }: StockEditorProps) {
  const { value, setValue, changed, submit } = useStockEditor(product, onSave)
  return (
    <form onSubmit={submit} className="flex items-center gap-1.5">
      <Badge tone={stockTone(product.stock)}>{formatNumber(product.stock)}</Badge>
      <input
        className={cn(MINI_SELECT, 'w-[70px]')}
        inputMode="numeric"
        dir="ltr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`موجودی ${product.title}`}
      />
      <Button type="submit" size="sm" variant="soft" disabled={!changed} loading={saving}>
        ثبت
      </Button>
    </form>
  )
})

interface RowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onStock: (id: number, stock: number) => void
  savingStock: boolean
}

const AdminProductRow = memo(function AdminProductRow({ product, onEdit, onDelete, onStock, savingStock }: RowProps) {
  const label = useCategoryLabelOf()(product.category)
  const edit = useCallback(() => onEdit(product), [onEdit, product])
  const del = useCallback(() => onDelete(product), [onDelete, product])
  return (
    <tr className={TR}>
      <td className={TD}>
        <div className={CELL_USER}>
          <img
            onError={handleImgError}
            className={THUMB}
            src={product.thumbnail}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
          <div>
            <b
              dir="auto"
              className={cn(CELL_USER_NAME, 'overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]')}
            >
              {product.title}
            </b>
            <small className="text-muted">{product.brand}</small>
          </div>
        </div>
      </td>
      <td className={TD}>{label}</td>
      <td className={TD}>
        <b>{formatToman(product.price)}</b>
        {product.discount > 0 && (
          <small className="block text-accent-600">{formatNumber(product.discount)}٪ تخفیف</small>
        )}
      </td>
      <td className={TD}>
        <StockEditor key={product.stock} product={product} onSave={onStock} saving={savingStock} />
      </td>
      <td className={TD}>
        <div className={ROW_ACTIONS}>
          <button
            type="button"
            className={cn(ICON_BTN, 'size-[38px]')}
            onClick={edit}
            aria-label={`ویرایش ${product.title}`}
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            className={cn(ICON_BTN, 'size-[38px] hover:bg-danger-50 hover:text-danger')}
            onClick={del}
            aria-label={`حذف ${product.title}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
})

export default AdminProductRow
