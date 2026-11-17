import { useCategories } from '@/features/catalog/data/queries'

export const useCategorySection = () => ({ categories: useCategories().data ?? [] })
