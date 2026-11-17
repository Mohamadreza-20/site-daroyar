import { Link } from 'react-router'
import { Heart, Package, ShoppingBag, Wallet, type LucideIcon } from 'lucide-react'
import { useAccountOverview } from '@/features/account/hooks/useAccountOverview'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { PanelOverviewSkeleton } from '@/shared/ui/loaders/PanelSkeletons'
import { Badge } from '@/shared/ui/common/Primitives'
import Button from '@/shared/ui/common/Button'
import {
  CARD,
  CARD_ROW,
  CARD_TITLE,
  LINK_MORE,
  OLIST,
  OLIST_LI,
  PANEL_TITLE,
  STACK,
  STAT,
  STAT_ICON,
  STAT_TONES,
  STATGRID,
  WELCOME,
} from '@/shared/ui/common/styles'
import { ORDER_STATUS } from '@/shared/domain/constants'
import { cn } from '@/shared/ui/lib/cn'
import { formatDate, formatNumber, formatToman } from '@/shared/domain/format'

interface Stat {
  icon: LucideIcon
  label: string
  value: string
  tone: keyof typeof STAT_TONES
}

export default function AccountOverview() {
  const vm = useAccountOverview()
  if (vm.isPending) return <PanelOverviewSkeleton />
  if (vm.isError) return <ErrorState error={vm.error} onRetry={vm.refetch} compact home={false} />

  const stats: Stat[] = [
    { icon: Package, label: 'سفارش‌ها', value: formatNumber(vm.orderCount), tone: 'teal' },
    { icon: Wallet, label: 'مجموع خرید', value: formatToman(vm.spent), tone: 'coral' },
    { icon: Heart, label: 'علاقه‌مندی‌ها', value: formatNumber(vm.wishCount), tone: 'indigo' },
    { icon: ShoppingBag, label: 'در سبد خرید', value: formatNumber(vm.cartCount), tone: 'amber' },
  ]

  return (
    <div className={STACK}>
      <div className={WELCOME}>
        <div>
          <h1 className={cn(PANEL_TITLE, 'mb-1')}>سلام {vm.firstName} 👋</h1>
          <p className="max-w-[520px] opacity-90">
            به پنل کاربری دارویار خوش آمدید. از اینجا سفارش‌ها و اطلاعات حسابتان را مدیریت کنید.
          </p>
        </div>
        <Button to="/shop" variant="white">
          ادامهٔ خرید
        </Button>
      </div>
      <ul className={STATGRID}>
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <li key={label} className={cn(STAT, STAT_TONES[tone])}>
            <span className={STAT_ICON}>
              <Icon size={22} />
            </span>
            <div>
              <small className="block text-muted">{label}</small>
              <b className="text-[17px] leading-normal">{value}</b>
            </div>
          </li>
        ))}
      </ul>
      <section className={CARD}>
        <div className={CARD_ROW}>
          <h2 className={cn(CARD_TITLE, 'mb-0')}>آخرین سفارش‌ها</h2>
          <Link to="/account/orders" className={LINK_MORE}>
            همه
          </Link>
        </div>
        {vm.recent.length === 0 ? (
          <p className="text-muted">هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <ul className={OLIST}>
            {vm.recent.map((o) => (
              <li key={o.id} className={OLIST_LI}>
                <Link to={`/account/orders/${o.id}`} dir="ltr">
                  <b>{o.id}</b>
                </Link>
                <span>{formatDate(o.createdAt)}</span>
                <span>{formatToman(o.totals.total)}</span>
                <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
