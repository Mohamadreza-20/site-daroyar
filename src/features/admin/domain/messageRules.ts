import { MESSAGE_STATUS } from '@/shared/domain/constants'
import type { MessageStatus } from '@/shared/domain/types'

export const MESSAGES_PAGE_SIZE = 6

export const MESSAGE_FILTERS = [
  { value: '', label: 'همه' },
  ...Object.entries(MESSAGE_STATUS).map(([value, { label }]) => ({ value, label })),
]

export const parseMessageStatus = (value: string | null): MessageStatus | '' =>
  value && value in MESSAGE_STATUS ? (value as MessageStatus) : ''
