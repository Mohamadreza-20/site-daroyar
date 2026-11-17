import { memo } from 'react'
import { Send } from 'lucide-react'
import { Textarea } from '@/shared/ui/common/Fields'
import Button from '@/shared/ui/common/Button'
import { useReplyForm } from '@/features/admin/hooks/useReplyForm'

const ReplyForm = memo(function ReplyForm({ id }: { id: number }) {
  const { register, errors, isPending, onSubmit } = useReplyForm(id)
  return (
    <form className="mt-4 grid gap-3 border-t border-dashed border-line pt-4" onSubmit={onSubmit} noValidate>
      <Textarea label="پاسخ شما" error={errors.reply?.message} {...register('reply')} />
      <Button type="submit" size="sm" loading={isPending} icon={<Send size={16} />} className="justify-self-start">
        ارسال پاسخ
      </Button>
    </form>
  )
})

export default ReplyForm
