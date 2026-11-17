const numberFormat = new Intl.NumberFormat('fa-IR')
const dateFormat = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type Nullable<T> = T | null | undefined

export const formatNumber = (n: Nullable<number>): string => numberFormat.format(n ?? 0)
export const formatToman = (n: Nullable<number>): string => `${numberFormat.format(Math.round(n ?? 0))} تومان`

function safeFormat(formatter: Intl.DateTimeFormat, value: string | number | Date): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date)
}

export const formatDate = (value: string | number | Date): string => safeFormat(dateFormat, value)
export const formatDateTime = (value: string | number | Date): string => safeFormat(dateTimeFormat, value)

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export const toEnglishDigits = (value: string): string =>
  value.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))

export const initials = (first = '', last = ''): string => `${first.charAt(0)}${last.charAt(0)}`.trim() || 'د'
