import BusyOverlay from '@/shared/ui/common/BusyOverlay'
import { memo } from 'react'
import { Search, Users } from 'lucide-react'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { roleBadge } from '@/features/admin/domain/userRules'
import { Badge, EmptyState, Pagination } from '@/shared/ui/common/Primitives'
import {
  SEARCHFIELD,
  CELL_USER,
  CELL_USER_NAME,
  PANEL_TITLE,
  SEARCH_ICON,
  SEARCH_INPUT,
  STACK,
  TABLE,
  TABLE_WRAP,
  TD,
  TH,
  TR,
} from '@/shared/ui/common/styles'
import { AVATAR } from '@/shared/ui/common/Primitives'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { AdminTableSkeleton } from '@/shared/ui/loaders/AdminSkeletons'
import { cn } from '@/shared/ui/lib/cn'
import { formatNumber } from '@/shared/domain/format'
import { handleImgError } from '@/shared/ui/lib/image'
import type { User } from '@/shared/domain/types'

const Row = memo(function Row({ user }: { user: User }) {
  const { label, tone } = roleBadge(user.role)
  return (
    <tr className={TR}>
      <td className={TD}>
        <div className={CELL_USER}>
          {user.image ? (
            <img
              onError={handleImgError}
              className={cn(AVATAR, 'shrink-0')}
              src={user.image}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className={cn(AVATAR, 'shrink-0')} aria-hidden="true">
              {user.firstName?.charAt(0)}
            </span>
          )}
          <div>
            <b dir="auto" className={CELL_USER_NAME}>
              {user.firstName} {user.lastName}
            </b>
            <small dir="ltr" className="text-muted">
              @{user.username}
            </small>
          </div>
        </div>
      </td>
      <td dir="ltr" className={cn(TD, 'text-start')}>
        {user.email}
      </td>
      <td dir="ltr" className={cn(TD, 'text-start')}>
        {user.phone}
      </td>
      <td className={TD}>
        <Badge tone={tone}>{label}</Badge>
      </td>
    </tr>
  )
})

export default function AdminUsers() {
  const vm = useAdminUsers()
  if (vm.isPending) return <AdminTableSkeleton label="در حال دریافت کاربران…" variant="orbit" />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  return (
    <div className={STACK}>
      <h1 className={PANEL_TITLE}>مدیریت کاربران ({formatNumber(vm.total)})</h1>
      <label className={SEARCHFIELD}>
        <Search size={18} className={SEARCH_ICON} aria-hidden="true" />
        <input
          className={SEARCH_INPUT}
          type="search"
          value={vm.search.text}
          onChange={(event) => vm.search.onChange(event.target.value)}
          placeholder="جستجو در نام، نام کاربری یا ایمیل…"
          aria-label="جستجو در کاربران"
        />
      </label>
      {vm.users.length ? (
        <>
          <BusyOverlay busy={vm.busy} label="در حال دریافت کاربران…" variant="orbit">
            <div className={TABLE_WRAP}>
              <table className={TABLE}>
                <caption className="sr-only">فهرست کاربران</caption>
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      کاربر
                    </th>
                    <th scope="col" className={TH}>
                      ایمیل
                    </th>
                    <th scope="col" className={TH}>
                      تلفن
                    </th>
                    <th scope="col" className={TH}>
                      نقش
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vm.users.map((user) => (
                    <Row key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          </BusyOverlay>
          <Pagination page={vm.page} totalPages={vm.totalPages} onChange={vm.setPage} />
        </>
      ) : (
        <EmptyState icon={Users} title="کاربری پیدا نشد" />
      )}
    </div>
  )
}
