import type { Category } from '@/shared/domain/types'
import type { CategoryForm } from '@/features/admin/domain/schemas'

const EMPTY: CategoryForm = { slug: '', label: '', blurb: '', tone: 'teal', icon: 'Sparkles' }

export const categoryToForm = (category: Category | null): CategoryForm =>
  category
    ? { slug: category.slug, label: category.label, blurb: category.blurb, tone: category.tone, icon: category.icon }
    : EMPTY
