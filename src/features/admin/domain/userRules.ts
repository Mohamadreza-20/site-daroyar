import type { BadgeTone } from '@/shared/domain/constants'

const ROLE: Record<string, { label: string; tone: BadgeTone }> = {
  admin: { label: 'مدیر', tone: 'danger' },
  moderator: { label: 'ناظر', tone: 'warn' },
  user: { label: 'کاربر', tone: 'info' },
  customer: { label: 'مشتری', tone: 'info' },
}

export const roleBadge = (role: string) => ROLE[role] ?? ROLE.user

export const USERS_PAGE_SIZE = 10
