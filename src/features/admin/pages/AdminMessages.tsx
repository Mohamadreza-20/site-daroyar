import { MessageSquare } from 'lucide-react'
import MessageBody from '@/features/contact/components/MessageBody'
import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import { EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import { CARD, PANEL_TITLE, STACK, chipClass } from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { AdminTableSkeleton } from '@/shared/ui/loaders/AdminSkeletons'
import { formatNumber } from '@/shared/domain/format'
import { useAdminMessagesPage } from '@/features/admin/hooks/useAdminMessages'
import { MESSAGE_FILTERS } from '@/features/admin/domain/messageRules'
import ReplyForm from '@/features/admin/components/ReplyForm'

export default function AdminMessages() {
  const vm = useAdminMessagesPage()
  if (vm.isPending) return <AdminTableSkeleton label="در حال دریافت پیام‌ها…" />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>پیام‌ها ({formatNumber(vm.total)})</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="فیلتر وضعیت پیام">
        {MESSAGE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={chipClass(vm.status === f.value)}
            aria-pressed={vm.status === f.value}
            onClick={() => vm.setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {vm.messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="پیامی پیدا نشد"
          text="وقتی کاربران از صفحهٔ تماس پیام بفرستند، اینجا دیده می‌شود."
        />
      ) : (
        <>
          <BusyOverlay busy={vm.busy} label="در حال دریافت پیام‌ها…">
            <ul className={STACK}>
              {vm.messages.map((message) => (
                <li key={message.id} className={CARD}>
                  <MessageBody message={message} sender={`${message.name} — ${message.email}`} />
                  {message.status === 'pending' && <ReplyForm id={message.id} />}
                </li>
              ))}
            </ul>
          </BusyOverlay>
          <Pagination page={vm.page} totalPages={vm.totalPages} onChange={vm.setPage} />
        </>
      )}
    </div>
  )
}
