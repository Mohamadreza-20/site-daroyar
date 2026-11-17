import { useCategories } from '@/features/catalog/data/queries'

export function useFooterModel() {
  const { data: categories = [] } = useCategories()
  return { categories }
}
