import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useSeo } from '@/shared/hooks/useSeo'
import { statusOf } from '@/shared/domain/errors'
import { articleJsonLd } from '@/shared/seo/schema'
import { useArticle, useArticles } from '@/features/articles/data/queries'
import { articleBreadcrumbs, relatedArticles } from '@/features/articles/domain/articleRules'

export function useArticlePage() {
  const { slug = '' } = useParams()
  const { data: article, isPending, isError, error, refetch } = useArticle(slug)
  const { data: all = [] } = useArticles()
  useSeo({
    title: article?.title,
    description: article?.excerpt,
    type: 'article',
    noindex: isError,
    breadcrumbs: article ? articleBreadcrumbs(article) : undefined,
    jsonLd: article ? articleJsonLd(article) : undefined,
  })
  const more = useMemo(() => relatedArticles(all, slug), [all, slug])
  const retry = statusOf(error) === 404 ? undefined : refetch
  return { article, isPending, isError, error, retry, more }
}
