export type ProductTabId = 'desc' | 'specs' | 'reviews'

export const PRODUCT_TABS: readonly { id: ProductTabId; label: string }[] = [
  { id: 'desc', label: 'توضیحات' },
  { id: 'specs', label: 'مشخصات' },
  { id: 'reviews', label: 'نظرات' },
]

export const tabFromParam = (value: string | null): ProductTabId =>
  PRODUCT_TABS.find((tab) => tab.id === value)?.id ?? 'desc'

export function tabForKey(current: ProductTabId, key: string): ProductTabId | undefined {
  const index = PRODUCT_TABS.findIndex((tab) => tab.id === current)
  const step = key === 'ArrowLeft' ? 1 : key === 'ArrowRight' ? -1 : 0
  if (key === 'Home') return PRODUCT_TABS[0]?.id
  if (key === 'End') return PRODUCT_TABS[PRODUCT_TABS.length - 1]?.id
  return step ? PRODUCT_TABS[(index + step + PRODUCT_TABS.length) % PRODUCT_TABS.length]?.id : undefined
}
