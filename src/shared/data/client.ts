import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/features/auth/data/store'

export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

interface ApiErrorOptions {
  code?: string
  fieldErrors?: Record<string, string> | null
  data?: unknown
}

export interface ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors: Record<string, string> | null
  readonly data: unknown
}

const API_ERROR_NAME = 'ApiError'

export function createApiError(
  message: string,
  status = 0,
  { code, fieldErrors, data }: ApiErrorOptions = {},
): ApiError {
  return Object.assign(new Error(message), {
    name: API_ERROR_NAME,
    status,
    code,
    fieldErrors: fieldErrors ?? null,
    data: data ?? null,
  })
}

export const isApiError = (error: unknown): error is ApiError => error instanceof Error && error.name === API_ERROR_NAME

export const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface ErrorBody {
  message?: unknown
  code?: string
  errors?: Record<string, string>
}

const emptyBody = (data: unknown) => data == null || data === ''

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isApiError(error) || axios.isCancel(error)) return Promise.reject(error)
    if (!axios.isAxiosError<ErrorBody>(error)) return Promise.reject(error)
    const { response } = error
    const data = response?.data
    const serverDown = !response || (response.status >= 500 && emptyBody(data))
    const status = serverDown ? (error.code === 'ECONNABORTED' ? 408 : 0) : response.status
    const code = data?.code
    const auth = useAuthStore.getState()
    if (status === 401 && (code === 'SESSION_EXPIRED' || code === 'UNAUTHENTICATED') && auth.token) auth.expireSession()
    const message = serverDown
      ? status === 408
        ? 'پاسخ سرور طول کشید'
        : 'Network Error'
      : (typeof data?.message === 'string' && data.message) || error.message
    return Promise.reject(createApiError(message, status, { code, fieldErrors: data?.errors, data }))
  },
)

export const totalOf = (response: AxiosResponse): number => Number(response.headers['x-total-count'] ?? 0)
