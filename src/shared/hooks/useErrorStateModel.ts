import { useNavigate } from 'react-router'
import { ERROR_CONTENT, resolveErrorStatus } from '@/shared/domain/errors'

export function useErrorStateModel(error: unknown, status?: number) {
  const navigate = useNavigate()
  const goBack = () => (Number(window.history.state?.idx) > 0 ? navigate(-1) : navigate('/', { replace: true }))
  const code = status ?? resolveErrorStatus(error)
  const content = ERROR_CONTENT[code] ?? ERROR_CONTENT.default
  const iconKey = code in ERROR_CONTENT ? code : 'default'
  const message = error instanceof Error ? error.message : ''
  return { content, iconKey, message, goBack }
}
