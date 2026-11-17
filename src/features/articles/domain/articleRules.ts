import type { Article } from '@/shared/domain/types'

export const ALL_CATEGORY = 'all'

export const articleCategories = (articles: Article[]): string[] => [
  ALL_CATEGORY,
  ...new Set(articles.map((a) => a.category)),
]

export const filterByCategory = (articles: Article[], category: string): Article[] =>
  category === ALL_CATEGORY ? articles : articles.filter((a) => a.category === category)

export const relatedArticles = (articles: Article[], slug: string, limit = 3): Article[] =>
  articles.filter((a) => a.slug !== slug).slice(0, limit)

export const articleBreadcrumbs = (article: Article) => [
  { name: 'خانه', path: '/' },
  { name: 'مقالات', path: '/articles' },
  { name: article.title, path: `/articles/${article.slug}` },
]
