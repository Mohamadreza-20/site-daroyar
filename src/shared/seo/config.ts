export const SITE_NAME = 'دارویار'
export const SITE_TITLE = 'دارویار | فروشگاه نمایشی محصولات مراقبتی'
export const SITE_DESCRIPTION =
  'دارویار یک فروشگاه نمایشی محصولات مراقبتی است که برای نمایش مهارت‌های طراحی و توسعهٔ فرانت‌اند ساخته شده؛ سفارش و پرداخت واقعی نیست.'
export const DEFAULT_IMAGE = '/og-image.png'
export const LOCALE = 'fa_IR'

const siteOrigin = (): string =>
  (import.meta.env.VITE_SITE_URL ?? (typeof window === 'undefined' ? '' : window.location.origin)).replace(/\/$/, '')

export const absoluteUrl = (path: string): string => new URL(path, `${siteOrigin()}/`).href
