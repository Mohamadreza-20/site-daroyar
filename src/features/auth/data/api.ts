import { api } from '@/shared/data/client'
import type { Session, User } from '@/shared/domain/types'
import type { LoginForm, ProfileForm, RegisterForm } from '@/features/auth/domain/schemas'

export const login = (values: LoginForm) => api.post<Session>('/auth/login', values).then((r) => r.data)

export const register = (values: Omit<RegisterForm, 'confirm' | 'terms'>) =>
  api.post<Session>('/auth/register', values).then((r) => r.data)

export const logout = () => api.post('/auth/logout').then(() => null)

export const fetchMe = (signal?: AbortSignal) => api.get<{ user: User }>('/auth/me', { signal }).then((r) => r.data)

export const updateProfile = (values: ProfileForm) =>
  api.patch<{ user: User }>('/auth/me', values).then((r) => r.data.user)
