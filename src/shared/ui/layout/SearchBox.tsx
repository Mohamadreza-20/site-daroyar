import { memo } from 'react'
import { Link } from 'react-router'
import { Search, X } from 'lucide-react'
import { useSearchBoxModel } from '@/shared/hooks/useSearchBoxModel'
import { Price } from '@/shared/ui/common/Primitives'
import { cn } from '@/shared/ui/lib/cn'
import { handleImgError } from '@/shared/ui/lib/image'

const ROW = 'flex items-center gap-3 rounded-[14px] px-3 py-2.5 [transition:background_0.15s]'

const SearchBox = memo(function SearchBox() {
  const {
    listId,
    rootRef,
    q,
    active,
    items,
    settled,
    showPanel,
    close,
    goShop,
    onSubmit,
    onKeyDown,
    onChange,
    onFocus,
    clear,
  } = useSearchBoxModel()

  return (
    <div ref={rootRef} className="relative ms-auto flex max-w-[420px] flex-1 max-[861px]:hidden">
      <form className="relative flex w-full items-center" role="search" onSubmit={onSubmit}>
        <Search size={18} className="absolute start-3.5 text-muted" aria-hidden="true" />
        <input
          className="h-11 w-full rounded-[14px] border-[1.5px] border-line bg-bg ps-11 pe-10 outline-hidden [transition:border-color_0.2s,background_0.2s,box-shadow_0.2s] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
          value={q}
          onChange={onChange}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder="جستجوی محصولات بهداشتی و مراقبتی…"
          aria-label="جستجو در فروشگاه"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            className="absolute end-2 grid size-7 place-items-center rounded-full text-muted hover:bg-primary-50 hover:text-primary-700"
            onClick={clear}
            aria-label="پاک کردن جستجو"
          >
            <X size={16} />
          </button>
        )}
      </form>
      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="نتایج جستجو"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-[20px] border border-line bg-surface p-2 shadow-lg"
        >
          {!settled && items.length === 0 && (
            <p className="px-3 py-4 text-center text-muted" role="status">
              در حال جستجو…
            </p>
          )}
          {settled && items.length === 0 && (
            <p className="px-3 py-4 text-center font-bold text-muted" role="status">
              محصولی یافت نشد
            </p>
          )}
          {items.map((product, index) => (
            <Link
              key={product.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={active === index}
              to={`/product/${product.id}`}
              className={cn(ROW, active === index ? 'bg-primary-50' : 'hover:bg-primary-50')}
              onClick={close}
            >
              <img
                className="size-12 shrink-0 rounded-[12px] bg-bg-2 object-cover"
                onError={handleImgError}
                src={product.thumbnail}
                alt=""
                loading="lazy"
              />
              <span dir="auto" className="line-clamp-2 min-w-0 flex-1 text-[14px] leading-[1.6]">
                {product.title}
              </span>
              <Price price={product.price} />
            </Link>
          ))}
          {items.length > 0 && (
            <button
              type="button"
              className="mt-1 w-full rounded-[14px] px-3 py-2.5 text-center font-extrabold text-primary-700 hover:bg-primary-50"
              onClick={goShop}
            >
              مشاهدهٔ همهٔ نتایج
            </button>
          )}
        </div>
      )}
    </div>
  )
})

export default SearchBox
