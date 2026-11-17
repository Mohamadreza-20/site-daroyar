import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSubscribeNewsletter } from '@/features/contact/data/queries'
import { newsletterSchema, type NewsletterForm } from '@/features/home/domain/schemas'

export function useNewsletterForm() {
  const form = useForm<NewsletterForm>({ resolver: zodResolver(newsletterSchema), defaultValues: { email: '' } })
  const { reset } = form

  const mutation = useSubscribeNewsletter()
  const submit = (values: NewsletterForm) =>
    mutation.mutate(values, {
      onSuccess: (data: { already?: boolean }) => {
        toast.success(data.already ? 'این ایمیل قبلاً عضو شده است' : 'عضویت شما ثبت شد')
        reset()
      },
      onError: () => toast.error('ثبت عضویت انجام نشد؛ دوباره تلاش کنید'),
    })

  return {
    register: form.register,
    errors: form.formState.errors,
    onSubmit: form.handleSubmit(submit),
    isPending: mutation.isPending,
  }
}
