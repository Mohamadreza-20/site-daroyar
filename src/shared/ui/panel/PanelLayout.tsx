import { lazy, memo, Suspense, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { LogOut, type LucideIcon } from 'lucide-react'
import type { User } from '@/shared/domain/types'
import { usePanelModel } from '@/shared/hooks/usePanelModel'
import Deferred from '@/shared/ui/common/Deferred'
import { cn } from '@/shared/ui/lib/cn'
import { initials } from '@/shared/domain/format'
import { AVATAR, Breadcrumb } from '@/shared/ui/common/Primitives'
import { handleImgError } from '@/shared/ui/lib/image'

const LogoutDialog = lazy(() => import('@/features/auth/components/LogoutDialog'))

const AVATAR_LG = cn(AVATAR, 'size-[54px] text-[18px]')
const LINK =
  'flex min-h-[46px] w-full items-center gap-3 rounded-[14px] px-3.5 text-start font-bold [transition:background_0.2s,color_0.2s] max-[1025px]:min-h-[42px] max-[1025px]:w-auto max-[1025px]:shrink-0 max-[1025px]:whitespace-nowrap'
const LINK_IDLE = 'text-ink-2 hover:bg-primary-50 hover:text-primary-700'
const LINK_ACTIVE = 'bg-primary text-white'
const LINK_OUT = 'mt-1.5 text-danger hover:bg-danger-50 hover:text-danger max-[1025px]:mt-0'

interface PanelLink {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

interface SidebarProps {
  links: readonly PanelLink[]
  user: User
  roleLabel: string
  onLogout: () => void
}

const Sidebar = memo(function Sidebar({ links, user, roleLabel, onLogout }: SidebarProps) {
  return (
    <aside className="sticky top-[calc(var(--header-h)+16px)] grid gap-4 rounded-lg border border-line bg-surface p-[18px] max-[1025px]:static max-[1025px]:p-3">
      <div className="flex items-center gap-3 border-b border-dashed border-line px-2 pt-2 pb-4 max-[1025px]:px-1.5 max-[1025px]:pt-1 max-[1025px]:pb-3">
        {user.image ? (
          <img
            onError={handleImgError}
            className={AVATAR_LG}
            src={user.image}
            alt=""
            width={54}
            height={54}
            decoding="async"
          />
        ) : (
          <span className={AVATAR_LG}>{initials(user.firstName, user.lastName)}</span>
        )}
        <div>
          <b className="block leading-normal">
            {user.firstName} {user.lastName}
          </b>
          <small className="block leading-normal text-muted">{roleLabel}</small>
        </div>
      </div>
      <nav
        className="grid gap-1 max-[1025px]:flex max-[1025px]:gap-1.5 max-[1025px]:overflow-x-auto max-[1025px]:pb-1 max-[1025px]:[scrollbar-width:none] max-[1025px]:[&::-webkit-scrollbar]:hidden"
        aria-label="منوی پنل"
      >
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(LINK, isActive ? LINK_ACTIVE : LINK_IDLE)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button type="button" className={cn(LINK, LINK_IDLE, LINK_OUT)} onClick={onLogout}>
          <LogOut size={19} />
          <span>خروج از حساب</span>
        </button>
      </nav>
    </aside>
  )
})

interface PanelLayoutProps {
  links: readonly PanelLink[]
  roleLabel: string
  crumb: string
  fallback: ReactNode
}

export default function PanelLayout({ links, roleLabel, crumb, fallback }: PanelLayoutProps) {
  const { user, confirming, openConfirm, closeConfirm } = usePanelModel()

  if (!user) return null

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: crumb }]} />
      <div className="grid grid-cols-[280px_minmax(0,1fr)] items-start gap-6 pb-6 max-[1025px]:grid-cols-[minmax(0,1fr)]">
        <Sidebar links={links} user={user} roleLabel={roleLabel} onLogout={openConfirm} />
        <section className="min-w-0">
          <Suspense fallback={fallback}>
            <Outlet />
          </Suspense>
        </section>
      </div>
      <Deferred when={confirming}>
        <LogoutDialog open={confirming} onClose={closeConfirm} />
      </Deferred>
    </div>
  )
}
