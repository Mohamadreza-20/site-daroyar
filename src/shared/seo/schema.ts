import type { Article, Product } from '@/shared/domain/types'
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from '@/shared/seo/config'

export type JsonLd = Record<string, unknown>

export interface Breadcrumb {
  name: string
  path: string
}

const CONTEXT = 'https://schema.org'

export const breadcrumbJsonLd = (items: readonly Breadcrumb[]): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
})

export const productJsonLd = (product: Product): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'Product',
  name: product.title,
  description: product.description,
  sku: product.sku,
  image: product.images.map(absoluteUrl),
  brand: { '@type': 'Brand', name: product.brand },
  category: product.category,
  offers: {
    '@type': 'Offer',
    url: absoluteUrl(`/product/${product.id}`),
    priceCurrency: 'IRR',
    price: product.price * 10,
    itemCondition: `${CONTEXT}/NewCondition`,
    availability: `${CONTEXT}/${product.stock > 0 ? 'InStock' : 'OutOfStock'}`,
  },
  ...(product.reviewCount > 0 && {
    aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
  }),
})

export const articleJsonLd = (article: Article): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'Article',
  headline: article.title,
  description: article.excerpt,
  articleSection: article.category,
  datePublished: article.date,
  inLanguage: 'fa-IR',
  mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
  author: { '@type': 'Person', name: article.author },
  publisher: { '@type': 'Organization', name: SITE_NAME },
})

export const websiteJsonLd = (): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'WebSite',
  name: SITE_NAME,
  url: absoluteUrl('/'),
  description: SITE_DESCRIPTION,
  inLanguage: 'fa-IR',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${absoluteUrl('/shop')}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})
