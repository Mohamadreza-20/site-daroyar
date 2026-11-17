import { useCallback } from 'react'
import { useCategoryLabel as useLabel, useCategoryMap } from '@/features/catalog/data/queries'

export const useCategoryLabel = (slug: string): string => useLabel(slug)

export function useCategoryLabelOf(): (slug: string | undefined) => string {
  const categories = useCategoryMap()
  return useCallback((slug) => (slug ? (categories.get(slug)?.label ?? slug) : ''), [categories])
}
