import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSeo } from '@/shared/hooks/useSeo'
import { useAuthStore } from '@/features/auth/data/store'
import { useSendMessage } from '@/features/contact/data/queries'
import { contactSchema, type ContactForm, type ContactFormInput } from '@/features/contact/domain/schemas'

export function useContactForm() {
  useSeo({
    title: 'تماس با ما',
    description:
      'راه‌های ارتباط با دارویار؛ پیام خود را بفرستید. این فروشگاه نمایشی است و پشتیبانی واقعی ارائه نمی‌شود.',
    breadcrumbs: [
      { name: 'خانه', path: '/' },
      { name: 'تماس با ما', path: '/contact' },
    ],
  })
  const user = useAuthStore((s) => s.user)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email ?? '',
      subject: '',
      message: '',
    },
  })
  const { mutate, isPending } = useSendMessage()
  const submit = useCallback(
    (values: ContactForm) =>
      mutate(values, {
        onSuccess: () => {
          toast.success(user ? 'پیام شما ثبت شد؛ پاسخ را در «پیام‌های من» ببینید' : 'پیام شما ثبت شد')
          reset({ ...values, subject: '', message: '' })
        },
        onError: () => toast.error('ارسال پیام انجام نشد؛ دوباره تلاش کنید'),
      }),
    [mutate, reset, user],
  )
  return {
    register,
    errors,
    isPending,
    onSubmit: handleSubmit(submit),
    isCustomer: user?.role === 'customer',
  }
}
