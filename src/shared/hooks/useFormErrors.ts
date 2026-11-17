import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { fieldErrorsOf } from '@/shared/domain/errors'

export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const fieldErrors = fieldErrorsOf(error)
  if (!fieldErrors) return false
  const entries = Object.entries(fieldErrors)
  for (const [field, message] of entries) {
    setError(field.replace(/^shipping\./, '') as Path<T>, { type: 'server', message })
  }
  return entries.length > 0
}
