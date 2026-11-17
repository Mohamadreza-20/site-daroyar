import { useMemo, useState } from 'react'
import { useSeo } from '@/shared/hooks/useSeo'
import { useArticles } from '@/features/articles/data/queries'
import { articleCategories, filterByCategory, ALL_CATEGORY } from '@/features/articles/domain/articleRules'

export function useArticlesPage() {
  useSeo({
    title: 'مقالات سلامت',
    description:
      'مقالات آموزشی نمونه دربارهٔ مراقبت پوست، مصرف صحیح دارو، تغذیه و سبک زندگی سالم. این محتوا برای نمایش پروژه است و جایگزین توصیهٔ پزشکی نیست.',
    breadcrumbs: [
      { name: 'خانه', path: '/' },
      { name: 'مقالات سلامت', path: '/articles' },
    ],
  })
  const { data: articles = [], isPending, isError, error, refetch } = useArticles()
  const [category, setCategory] = useState(ALL_CATEGORY)
  const categories = useMemo(() => articleCategories(articles), [articles])
  const list = useMemo(() => filterByCategory(articles, category), [articles, category])
  const [featured, ...rest] = list
  return { isPending, isError, error, refetch, category, setCategory, categories, featured, rest }
}
