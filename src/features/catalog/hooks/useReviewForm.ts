import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { applyServerErrors } from '@/shared/hooks/useFormErrors'
import { useAddReview } from '@/features/catalog/data/queries'
import { reviewSchema, type ReviewForm } from '@/features/catalog/domain/schemas'

export function useReviewForm(productId: number) {
  const { mutate, isPending } = useAddReview(productId)
  const form = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, comment: '' } })
  const { reset, setError } = form

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        toast.success('نظر شما ثبت شد')
        reset({ rating: 0, comment: '' })
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError)) toast.error(error.message || 'ثبت نظر انجام نشد')
      },
    }),
  )

  return {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
    onSubmit,
    isPending,
  }
}
