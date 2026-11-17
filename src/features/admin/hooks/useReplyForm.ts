import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { replySchema, type ReplyForm } from '@/features/admin/domain/schemas'
import { useReplyMessage } from '@/features/contact/data/queries'

export function useReplyForm(id: number) {
  const { mutate, isPending } = useReplyMessage()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReplyForm>({ resolver: zodResolver(replySchema), defaultValues: { reply: '' } })
  const submit = useCallback(
    ({ reply }: ReplyForm) =>
      mutate(
        { id, reply },
        {
          onSuccess: () => toast.success('پاسخ ثبت شد'),
          onError: (error) => toast.error(error.message || 'ثبت پاسخ انجام نشد'),
        },
      ),
    [mutate, id],
  )
  return { register, errors, isPending, onSubmit: handleSubmit(submit) }
}
