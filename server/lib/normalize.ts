const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

function normalizeText(value: unknown = ''): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[آأإ]/g, 'ا')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(new RegExp('[\\u200B-\\u200F\\u202A-\\u202E]', 'g'), '')
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export const toEnglishDigits = (value = ''): string => normalizeText(value).replace(/\s/g, '')

export function buildSearchText(...parts: unknown[]): string {
  const text = normalizeText(parts.flat().filter(Boolean).join(' '))
  return `${text} ${text.replace(/ /g, '')}`
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function buildSearchPattern(query: unknown): string | null {
  const words = normalizeText(query).split(' ').filter(Boolean)
  if (!words.length) return null
  return `^${words.map((word) => `(?=.*${escapeRegExp(word)})`).join('')}`
}

export function matchesQuery(text: string, query: unknown): boolean {
  const pattern = buildSearchPattern(query)
  return !pattern || new RegExp(pattern, 'i').test(normalizeText(text))
}
