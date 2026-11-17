import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { DEFAULT_IMAGE, LOCALE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, absoluteUrl } from '@/shared/seo/config'
import { breadcrumbJsonLd, type Breadcrumb, type JsonLd } from '@/shared/seo/schema'

export interface SeoOptions {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  breadcrumbs?: readonly Breadcrumb[]
  jsonLd?: JsonLd | readonly JsonLd[]
}

const JSON_LD_ID = 'seo-jsonld'

function upsert<K extends 'meta' | 'link'>(tag: K, attr: string, key: string, valueAttr: string, value: string) {
  let element = document.head.querySelector<HTMLElementTagNameMap[K]>(`${tag}[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement(tag)
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute(valueAttr, value)
}

const meta = (attr: 'name' | 'property', key: string, content: string) => upsert('meta', attr, key, 'content', content)

export function useSeo({ title, description, image, type = 'website', noindex, breadcrumbs, jsonLd }: SeoOptions = {}) {
  const { pathname } = useLocation()
  const structured = JSON.stringify([...(breadcrumbs ? [breadcrumbJsonLd(breadcrumbs)] : []), ...[jsonLd ?? []].flat()])

  useEffect(() => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE
    const pageDescription =
      description?.trim() ||
      (title
        ? `${title}؛ بخشی از فروشگاه نمایشی ${SITE_NAME}. خرید و پرداخت واقعی در این نسخه فعال نیست.`
        : SITE_DESCRIPTION)
    const url = absoluteUrl(pathname)
    const picture = absoluteUrl(image ?? DEFAULT_IMAGE)

    document.title = pageTitle
    meta('name', 'description', pageDescription)
    meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    meta('property', 'og:type', type === 'product' ? 'product' : type)
    meta('property', 'og:site_name', SITE_NAME)
    meta('property', 'og:locale', LOCALE)
    meta('property', 'og:title', pageTitle)
    meta('property', 'og:description', pageDescription)
    meta('property', 'og:url', url)
    meta('property', 'og:image', picture)
    meta('property', 'og:image:alt', pageTitle)
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'twitter:title', pageTitle)
    meta('name', 'twitter:description', pageDescription)
    meta('name', 'twitter:image', picture)
    meta('name', 'twitter:image:alt', pageTitle)
    upsert('link', 'rel', 'canonical', 'href', url)

    document.getElementById(JSON_LD_ID)?.remove()
    if (structured !== '[]') {
      const script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      script.textContent = structured
      document.head.appendChild(script)
    }
    return () => document.getElementById(JSON_LD_ID)?.remove()
  }, [title, description, image, type, noindex, pathname, structured])
}
