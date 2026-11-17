import { memo, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { CHECK_INPUT, CHECK_LABEL, CHIP_SM, chipClass } from '@/shared/ui/common/styles'
import { useDebounce } from '@/shared/hooks/useUtils'
import { formatToman } from '@/shared/domain/format'
import type { Category } from '@/shared/domain/types'

const PRICE_STEP = 50000

const FIELDSET = 'm-0 grid gap-3 border-0 p-0'
const LEGEND = 'mb-2.5 p-0 text-[14px] font-extrabold'

type FilterChange = {
  category?: string
  max?: number
  available?: boolean
  discount?: boolean
}

interface ShopFiltersProps {
  categories?: Category[]
  category: string
  maxPrice: number
  priceBounds: number
  onlyAvailable: boolean
  onlyDiscount: boolean
  onChange: (change: FilterChange) => void
  onReset: () => void
}

const ShopFilters = memo(function ShopFilters({
  categories = [],
  category,
  maxPrice,
  priceBounds,
  onlyAvailable,
  onlyDiscount,
  onChange,
  onReset,
}: ShopFiltersProps) {
  const [price, setPrice] = useState(maxPrice || priceBounds)
  const debounced = useDebounce(price, 250)
  const unlimited = (value: number) => value >= priceBounds

  useEffect(() => setPrice(maxPrice || priceBounds), [maxPrice, priceBounds])
  const latest = useRef({ maxPrice, priceBounds, onChange })
  latest.current = { maxPrice, priceBounds, onChange }

  useEffect(() => {
    const current = latest.current
    const next = debounced >= current.priceBounds ? 0 : debounced
    if (next !== current.maxPrice) current.onChange({ max: next })
  }, [debounced])

  return (
    <div className="grid gap-[22px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px]">فیلتر محصولات</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-accent-600"
          onClick={onReset}
        >
          <RotateCcw size={14} /> پاک کردن
        </button>
      </div>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>دسته‌بندی</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(!category, CHIP_SM)}
            aria-pressed={!category}
            onClick={() => onChange({ category: '' })}
          >
            همه
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={chipClass(category === item.slug, CHIP_SM)}
              aria-pressed={category === item.slug}
              onClick={() => onChange({ category: item.slug })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>حداکثر قیمت</legend>
        <input
          type="range"
          min={PRICE_STEP}
          max={priceBounds}
          step={PRICE_STEP}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          aria-label="حداکثر قیمت"
          className="w-full accent-primary [direction:ltr]"
        />
        <p className="text-[13px] text-muted">{unlimited(price) ? 'بدون محدودیت قیمت' : `تا ${formatToman(price)}`}</p>
      </fieldset>

      <fieldset className={FIELDSET}>
        <legend className={LEGEND}>سایر</legend>
        <label className={CHECK_LABEL}>
          <input
            className={CHECK_INPUT}
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => onChange({ available: e.target.checked })}
          />
          فقط کالاهای موجود
        </label>
        <label className={CHECK_LABEL}>
          <input
            className={CHECK_INPUT}
            type="checkbox"
            checked={onlyDiscount}
            onChange={(e) => onChange({ discount: e.target.checked })}
          />
          فقط کالاهای تخفیف‌دار
        </label>
      </fieldset>
    </div>
  )
})

export default ShopFilters
