import { useSeo } from '@/shared/hooks/useSeo'
import { websiteJsonLd } from '@/shared/seo/schema'
import { useArticles } from '@/features/articles/data/queries'
import { useCatalogMeta, useProducts } from '@/features/catalog/data/queries'
import { BEST_PRODUCTS, DEAL_PRODUCTS, HOME_ARTICLE_COUNT, NEWEST_PRODUCTS } from '@/features/home/domain/homeQueries'

export function useHomePage() {
  useSeo({ jsonLd: websiteJsonLd() })
  const best = useProducts(BEST_PRODUCTS)
  const deals = useProducts(DEAL_PRODUCTS)
  const newest = useProducts(NEWEST_PRODUCTS)
  const { data: meta } = useCatalogMeta()
  const { data: articles = [] } = useArticles()

  const failed = [best, deals, newest].find((query) => query.isError)
  const section = (query: typeof best) => ({ isPending: query.isPending, products: query.data?.items ?? [] })

  return {
    best: section(best),
    deals: section(deals),
    newest: section(newest),
    dealProduct: deals.data?.items[0],
    counts: meta?.counts,
    articles: articles.slice(0, HOME_ARTICLE_COUNT),
    error: failed && !failed.data ? failed.error : null,
    hasError: Boolean(failed && !failed.data),
    retry: () => [best, deals, newest].forEach((query) => void query.refetch()),
  }
}
