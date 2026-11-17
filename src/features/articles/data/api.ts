import { api, createApiError } from '@/shared/data/client'
import type { Article } from '@/shared/domain/types'

export const fetchArticles = (signal?: AbortSignal) => api.get<Article[]>('/articles', { signal }).then((r) => r.data)

export async function fetchArticle(slug: string, signal?: AbortSignal): Promise<Article> {
  const { data } = await api.get<Article[]>('/articles', { params: { slug }, signal })
  const article = data[0]
  if (!article) throw createApiError('مقاله‌ای با این نشانی پیدا نشد', 404)
  return article
}
