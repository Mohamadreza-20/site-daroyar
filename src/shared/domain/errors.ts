export type ErrorTone = 'primary' | 'warn' | 'danger' | 'info'

export interface ErrorContent {
  code: string
  tone: ErrorTone
  title: string
  text: string
  login?: boolean
}

export const ERROR_CONTENT: Record<number | 'default', ErrorContent> = {
  0: {
    code: '!',
    tone: 'warn',
    title: 'ارتباط با اینترنت برقرار نیست',
    text: 'اتصال شما قطع شده یا سرور در دسترس نیست. اینترنت را بررسی کنید و دوباره تلاش کنید.',
  },
  400: {
    code: '۴۰۰',
    tone: 'warn',
    title: 'درخواست نامعتبر است',
    text: 'اطلاعات ارسال‌شده درست نبود. لطفاً دوباره تلاش کنید.',
  },
  401: {
    code: '۴۰۱',
    tone: 'info',
    title: 'ابتدا وارد حساب خود شوید',
    text: 'برای دیدن این بخش باید وارد حساب کاربری شوید.',
    login: true,
  },
  403: {
    code: '۴۰۳',
    tone: 'danger',
    title: 'اجازهٔ دسترسی ندارید',
    text: 'حساب شما به این بخش دسترسی ندارد. اگر فکر می‌کنید اشتباه است با پشتیبانی تماس بگیرید.',
  },
  404: {
    code: '۴۰۴',
    tone: 'primary',
    title: 'صفحه‌ای که دنبالش بودید پیدا نشد',
    text: 'ممکن است نشانی را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.',
  },
  408: {
    code: '۴۰۸',
    tone: 'warn',
    title: 'پاسخ سرور طول کشید',
    text: 'اتصال بیش از حد کند بود. چند لحظه بعد دوباره تلاش کنید.',
  },
  429: {
    code: '۴۲۹',
    tone: 'warn',
    title: 'درخواست‌ها بیش از حد مجاز است',
    text: 'کمی صبر کنید و دوباره امتحان کنید.',
  },
  500: {
    code: '۵۰۰',
    tone: 'danger',
    title: 'مشکلی در سرور رخ داد',
    text: 'متأسفیم! خطایی غیرمنتظره پیش آمد. تیم فنی در جریان است؛ کمی بعد دوباره تلاش کنید.',
  },
  503: {
    code: '۵۰۳',
    tone: 'info',
    title: 'سرویس موقتاً در دسترس نیست',
    text: 'در حال به‌روزرسانی هستیم. به‌زودی برمی‌گردیم.',
  },
  default: {
    code: '!',
    tone: 'danger',
    title: 'خطایی رخ داد',
    text: 'مشکلی پیش آمد. دوباره تلاش کنید یا به صفحهٔ اصلی بروید.',
  },
}

export function resolveErrorStatus(error: unknown): number | 'default' {
  if (!error) return 'default'
  if (typeof error === 'object' && 'status' in error && typeof error.status === 'number') return error.status
  if (error instanceof Error && error.message === 'Network Error') return 0
  return 500
}

export function fieldErrorsOf(error: unknown): Record<string, string> | null {
  if (typeof error !== 'object' || error === null || !('fieldErrors' in error)) return null
  const { fieldErrors } = error
  return typeof fieldErrors === 'object' && fieldErrors !== null ? (fieldErrors as Record<string, string>) : null
}

export const errorCodeOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined

export const statusOf = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined

export const isOfflineError = (error: unknown): boolean => statusOf(error) === 0

export const messageOf = (error: unknown): string => (error instanceof Error ? error.message : '')
