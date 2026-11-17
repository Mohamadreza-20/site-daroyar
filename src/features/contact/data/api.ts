import { api, totalOf } from '@/shared/data/client'
import type { ContactMessage, Paged } from '@/shared/domain/types'
import type { ContactForm } from '@/features/contact/domain/schemas'

export const sendContactMessage = (values: ContactForm) =>
  api.post<ContactMessage>('/messages', values).then((r) => r.data)

export const subscribeNewsletter = (values: { email: string }) => api.post('/subscribers', values).then((r) => r.data)

export const fetchMyMessages = (signal?: AbortSignal) =>
  api.get<ContactMessage[]>('/messages/mine', { signal }).then((r) => r.data)

export async function fetchAdminMessages(params: object, signal?: AbortSignal): Promise<Paged<ContactMessage>> {
  const response = await api.get<ContactMessage[]>('/messages', { params, signal })
  return { items: response.data, total: totalOf(response) }
}

export const replyToMessage = ({ id, reply }: { id: number; reply: string }) =>
  api.post<ContactMessage>(`/messages/${id}/reply`, { reply }).then((r) => r.data)
