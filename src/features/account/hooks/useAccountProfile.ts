import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { profileSchema, type ProfileForm, type ProfileFormInput } from '@/features/auth/domain/schemas'
import { useAuthStore } from '@/features/auth/data/store'
import { useUpdateProfile } from '@/features/auth/data/queries'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import { useSeo } from '@/shared/hooks/useSeo'

export function useAccountProfile() {
  useSeo({ title: 'اطلاعات حساب', noindex: true })
  const user = useAuthStore((s) => s.user)
  const update = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })
  const submit = useCallback(
    (values: ProfileForm) => {
      if (update.isPending) return
      update.mutate(values, {
        onSuccess: (saved) => {
          reset({ firstName: saved.firstName, lastName: saved.lastName, email: saved.email, phone: saved.phone })
          toast.success('اطلاعات حساب ذخیره شد')
        },
        onError: (error) => {
          if (!applyServerErrors(error, setError)) toast.error(error.message || 'ذخیرهٔ اطلاعات انجام نشد')
        },
      })
    },
    [update, reset, setError],
  )
  return {
    register,
    errors,
    isDirty,
    isPending: update.isPending,
    username: user?.username ?? '',
    onSubmit: handleSubmit(submit),
  }
}
