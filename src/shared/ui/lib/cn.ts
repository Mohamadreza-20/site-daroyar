import { twMerge } from 'tailwind-merge'

export const cn = (...parts: unknown[]): string => twMerge(parts.filter(Boolean).join(' '))
