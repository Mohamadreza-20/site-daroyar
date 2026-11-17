import { queryOptions, useQuery } from '@tanstack/react-query'
import { keys } from '@/shared/data/queryKeys'
import { fetchArticle, fetchArticles } from '@/features/articles/data/api'

const HOUR = 60 * 60 * 1000

export const articlesOptions = queryOptions({
  queryKey: keys.articles,
  queryFn: ({ signal }) => fetchArticles(signal),
  staleTime: HOUR,
})

export const useArticles = () => useQuery(articlesOptions)

export const useArticle = (slug: string) =>
  useQuery({
    queryKey: keys.article(slug),
    queryFn: ({ signal }) => fetchArticle(slug, signal),
    staleTime: HOUR,
    retry: false,
  })
