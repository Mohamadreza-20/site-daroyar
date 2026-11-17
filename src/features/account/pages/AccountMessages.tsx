import { MessageSquare } from 'lucide-react'
import { useAccountMessages } from '@/features/account/hooks/useAccountMessages'
import MessageBody from '@/features/contact/components/MessageBody'
import { EmptyState } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import { CARD, PANEL_TITLE, STACK } from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { PanelOrdersSkeleton } from '@/shared/ui/loaders/PanelSkeletons'

export default function AccountMessages() {
  const { messages, isPending, isError, error, refetch } = useAccountMessages()

  if (isPending) return <PanelOrdersSkeleton />
  if (isError) return <ErrorState error={error} onRetry={refetch} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>پیام‌های من</h1>
      {messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="هنوز پیامی نفرستاده‌اید"
          text="پیام‌هایی که از صفحهٔ «تماس با ما» می‌فرستید و پاسخ پشتیبانی را اینجا می‌بینید."
        >
          <Button to="/contact">ارسال پیام</Button>
        </EmptyState>
      ) : (
        <ul className={STACK}>
          {messages.map((message) => (
            <li key={message.id} className={CARD}>
              <MessageBody message={message} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
