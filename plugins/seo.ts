import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

interface Options {
  siteUrl: string
}

type JsonLd = Record<string, unknown>

interface Page {
  path: string
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
  jsonLd?: JsonLd[]
  body: string
  priority: string
  lastmod?: string
  images?: string[]
}

interface Product {
  id: number
  title: string
  description: string
  price: number
  basePrice: number
  discount: number
  stock: number
  sku: string
  brand: string
  category: string
  thumbnail: string
  images: string[]
  rating: number
  reviewCount: number
}

type ArticleBlock = { type: 'p' | 'h2'; text: string } | { type: 'ul'; items: string[] }

interface Article {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  content: ArticleBlock[]
}

interface Category {
  slug: string
  label: string
}

interface Db {
  products: Product[]
  articles: Article[]
  categories: Category[]
}

const SITE = 'دارویار'
const SCHEMA = 'https://schema.org'
const MAX_DESCRIPTION = 155

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const clip = (value: string, max = MAX_DESCRIPTION) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
const day = (value: string) => value.slice(0, 10)

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
const section = (heading: string, content: string) => `<section><h2>${escapeHtml(heading)}</h2>${content}</section>`
const shell = (title: string, intro: string, rest: string) =>
  `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(intro)}</p>${rest}</main>`

const NAV = list([
  link('/', 'خانه'),
  link('/shop', 'فروشگاه'),
  link('/articles', 'مقالات سلامت'),
  link('/contact', 'تماس با ما'),
])

const breadcrumb = (origin: string, items: { name: string; path: string }[]): JsonLd => ({
  '@context': SCHEMA,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${origin}${item.path}`,
  })),
})

const absolute = (origin: string, path: string) => (/^https?:\/\//.test(path) ? path : `${origin}${path}`)

export function seoPlugin({ siteUrl }: Options): Plugin {
  const origin = siteUrl.replace(/\/$/, '')
  let dist = ''
  let root = process.cwd()

  return {
    name: 'daroyar-seo',
    apply: 'build',
    configResolved(config) {
      root = config.root
      dist = resolve(root, config.build.outDir)
    },
    writeBundle() {
      const template = readFileSync(join(dist, 'index.html'), 'utf8').replaceAll('https://example.com', origin)
      writeFileSync(join(dist, 'index.html'), template)
      const db = JSON.parse(readFileSync(join(root, 'server/db.json'), 'utf8')) as Db
      const categoryLabel = new Map(db.categories.map((category) => [category.slug, category.label]))
      const productLinks = (products: Product[]) =>
        list(products.map((product) => link(`/product/${product.id}`, product.title)))
      const articleLinks = list(db.articles.map((article) => link(`/articles/${article.slug}`, article.title)))
      const today = new Date().toISOString().slice(0, 10)

      const shopDescription =
        'مرور و جست‌وجوی محصولات مراقبتی و بهداشتی دارویار با فیلتر دسته، قیمت و تخفیف؛ نسخهٔ نمایشی.'
      const articlesDescription =
        'مقالات آموزشی نمونه دربارهٔ مراقبت از پوست، تغذیه و سلامت روزمره در فروشگاه نمایشی دارویار.'
      const contactDescription = 'فرم تماس و پرسش‌های متداول فروشگاه نمایشی دارویار.'

      const home: Page = {
        path: '/',
        title: '',
        description: '',
        priority: '1.0',
        jsonLd: [
          {
            '@context': SCHEMA,
            '@type': 'WebSite',
            name: SITE,
            url: `${origin}/`,
            description:
              'دارویار یک فروشگاه نمایشی محصولات مراقبتی است که برای نمایش مهارت‌های طراحی و توسعهٔ فرانت‌اند ساخته شده؛ سفارش و پرداخت واقعی نیست.',
            inLanguage: 'fa-IR',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${origin}/shop?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
        body: shell(
          'دارویار؛ فروشگاه نمایشی محصولات مراقبتی',
          'محصولات نمونهٔ مراقبت پوست، بهداشت و سبک زندگی را در یک تجربهٔ خرید تعاملی مرور کنید. سفارش و پرداخت واقعی نیست.',
          NAV + section('محصولات', productLinks(db.products.slice(0, 12))) + section('مقالات سلامت', articleLinks),
        ),
      }

      const pages: Page[] = [
        {
          path: '/shop',
          title: 'فروشگاه',
          description: shopDescription,
          priority: '0.9',
          jsonLd: [
            breadcrumb(origin, [
              { name: 'خانه', path: '/' },
              { name: 'فروشگاه', path: '/shop' },
            ]),
            {
              '@context': SCHEMA,
              '@type': 'ItemList',
              itemListElement: db.products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${origin}/product/${product.id}`,
                name: product.title,
              })),
            },
          ],
          body: shell('فروشگاه', shopDescription, NAV + productLinks(db.products)),
        },
        {
          path: '/articles',
          title: 'مقالات سلامت',
          description: articlesDescription,
          priority: '0.7',
          jsonLd: [
            breadcrumb(origin, [
              { name: 'خانه', path: '/' },
              { name: 'مقالات سلامت', path: '/articles' },
            ]),
          ],
          body: shell('مقالات سلامت', articlesDescription, NAV + articleLinks),
        },
        {
          path: '/contact',
          title: 'تماس با ما',
          description: contactDescription,
          priority: '0.5',
          jsonLd: [
            breadcrumb(origin, [
              { name: 'خانه', path: '/' },
              { name: 'تماس با ما', path: '/contact' },
            ]),
          ],
          body: shell('تماس با ما', contactDescription, NAV),
        },
        ...db.products.map<Page>((product) => {
          const images = product.images.map((image) => absolute(origin, image))
          const category = categoryLabel.get(product.category) ?? product.category
          return {
            path: `/product/${product.id}`,
            title: product.title,
            description: clip(product.description),
            image: product.thumbnail,
            type: 'product',
            priority: '0.8',
            lastmod: today,
            images,
            jsonLd: [
              breadcrumb(origin, [
                { name: 'خانه', path: '/' },
                { name: 'فروشگاه', path: '/shop' },
                { name: product.title, path: `/product/${product.id}` },
              ]),
              {
                '@context': SCHEMA,
                '@type': 'Product',
                name: product.title,
                description: product.description,
                sku: product.sku,
                image: images,
                brand: { '@type': 'Brand', name: product.brand },
                category,
                offers: {
                  '@type': 'Offer',
                  url: `${origin}/product/${product.id}`,
                  priceCurrency: 'IRR',
                  price: product.price * 10,
                  itemCondition: `${SCHEMA}/NewCondition`,
                  availability: `${SCHEMA}/${product.stock > 0 ? 'InStock' : 'OutOfStock'}`,
                },
                ...(product.reviewCount > 0 && {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  },
                }),
              },
            ],
            body: shell(
              product.title,
              product.description,
              NAV +
                list([
                  `برند: ${escapeHtml(product.brand)}`,
                  `دسته‌بندی: ${escapeHtml(category)}`,
                  `کد کالا: ${escapeHtml(product.sku)}`,
                  `قیمت: ${product.price.toLocaleString('fa-IR')} تومان`,
                  product.stock > 0 ? 'موجود' : 'ناموجود',
                ]),
            ),
          }
        }),
        ...db.articles.map<Page>((article) => ({
          path: `/articles/${article.slug}`,
          title: article.title,
          description: clip(article.excerpt),
          type: 'article',
          priority: '0.6',
          lastmod: day(article.date),
          jsonLd: [
            breadcrumb(origin, [
              { name: 'خانه', path: '/' },
              { name: 'مقالات سلامت', path: '/articles' },
              { name: article.title, path: `/articles/${article.slug}` },
            ]),
            {
              '@context': SCHEMA,
              '@type': 'Article',
              headline: article.title,
              description: article.excerpt,
              articleSection: article.category,
              datePublished: article.date,
              dateModified: article.date,
              inLanguage: 'fa-IR',
              mainEntityOfPage: `${origin}/articles/${article.slug}`,
              image: [`${origin}/og-image.png`],
              author: { '@type': 'Person', name: article.author },
              publisher: {
                '@type': 'Organization',
                name: SITE,
                logo: { '@type': 'ImageObject', url: `${origin}/icon-512.png` },
              },
            },
          ],
          body: shell(
            article.title,
            article.excerpt,
            NAV +
              article.content
                .map((block) =>
                  block.type === 'h2'
                    ? `<h2>${escapeHtml(block.text)}</h2>`
                    : block.type === 'ul'
                      ? list(block.items.map(escapeHtml))
                      : `<p>${escapeHtml(block.text)}</p>`,
                )
                .join(''),
          ),
        })),
      ]

      const replaceTag = (html: string, pattern: RegExp, value: string) => html.replace(pattern, () => value)

      const render = (page: Page) => {
        const title = page.title ? `${page.title} | ${SITE}` : ''
        const url = `${origin}${page.path === '/' ? '/' : page.path}`
        const image = page.image && /^https?:\/\//.test(page.image) ? page.image : `${origin}/og-image.png`
        let html = template
        if (title) {
          const description = escapeHtml(page.description)
          html = replaceTag(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
          html = replaceTag(
            html,
            /<meta name="description" content="[^"]*"/,
            `<meta name="description" content="${description}"`,
          )
          html = replaceTag(
            html,
            /<meta property="og:title" content="[^"]*"/,
            `<meta property="og:title" content="${escapeHtml(title)}"`,
          )
          html = replaceTag(
            html,
            /<meta property="og:description" content="[^"]*"/,
            `<meta property="og:description" content="${description}"`,
          )
          html = replaceTag(
            html,
            /<meta property="og:type" content="[^"]*"/,
            `<meta property="og:type" content="${page.type ?? 'website'}"`,
          )
          html = replaceTag(
            html,
            /<meta property="og:image" content="[^"]*"/,
            `<meta property="og:image" content="${image}"`,
          )
          html = replaceTag(
            html,
            /<meta name="twitter:title" content="[^"]*"/,
            `<meta name="twitter:title" content="${escapeHtml(title)}"`,
          )
          html = replaceTag(
            html,
            /<meta name="twitter:description" content="[^"]*"/,
            `<meta name="twitter:description" content="${description}"`,
          )
          html = replaceTag(
            html,
            /<meta name="twitter:image" content="[^"]*"/,
            `<meta name="twitter:image" content="${image}"`,
          )
        }
        html = replaceTag(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
        html = replaceTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
        if (page.jsonLd?.length) {
          const script = `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>`
          html = html.replace('</head>', () => `${script}</head>`)
        }
        return html.replace('<div id="root"></div>', () => `<div id="root">${page.body}</div>`)
      }

      writeFileSync(join(dist, 'index.html'), render(home))
      for (const page of pages) {
        const dir = join(dist, page.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), render(page))
      }

      const urls = [home, ...pages]
        .map((page) => {
          const images = (page.images ?? [])
            .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
            .join('')
          return `  <url><loc>${origin}${page.path}</loc><lastmod>${page.lastmod ?? today}</lastmod><priority>${page.priority}</priority>${images}</url>`
        })
        .join('\n')
      writeFileSync(
        join(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`,
      )
      writeFileSync(
        join(dist, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order-success\nDisallow: /login\nDisallow: /register\nDisallow: /*?q=\n\nSitemap: ${origin}/sitemap.xml\n`,
      )
    },
  }
}
