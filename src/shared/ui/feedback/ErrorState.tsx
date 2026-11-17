import { memo } from 'react'
import { ArrowRight, House, RefreshCw } from 'lucide-react'
import Button, { buttonClass } from '@/shared/ui/common/Button'
import { cn } from '@/shared/ui/lib/cn'
import { ERROR_ICONS } from '@/shared/ui/lib/errorIcons'
import { useErrorStateModel } from '@/shared/hooks/useErrorStateModel'
import type { ErrorTone } from '@/shared/domain/errors'

const TONES: Record<ErrorTone, string> = {
  primary: '[--tone:var(--color-primary)] [--tone-bg:var(--color-primary-50)]',
  warn: '[--tone:var(--color-warn)] [--tone-bg:var(--color-warn-50)]',
  danger: '[--tone:var(--color-danger)] [--tone-bg:var(--color-danger-50)]',
  info: '[--tone:var(--color-info)] [--tone-bg:var(--color-info-50)]',
}

interface ErrorStateProps {
  error?: unknown
  status?: number
  onRetry?: () => unknown
  compact?: boolean
  home?: boolean
}

const ErrorState = memo(function ErrorState({ error, status, onRetry, compact = false, home = true }: ErrorStateProps) {
  const { content, iconKey, message, goBack } = useErrorStateModel(error, status)
  const Icon = ERROR_ICONS[iconKey]
  return (
    <section
      className={cn(
        'mx-auto my-[clamp(32px,8vw,80px)] grid max-w-[620px] justify-items-center gap-3.5 px-5 text-center [--tone:var(--color-primary)] [--tone-bg:var(--color-primary-50)]',
        TONES[content.tone],
        compact && 'my-6 rounded-lg border border-line bg-surface px-4 py-7',
      )}
      role="alert"
    >
      <div
        className={cn(
          "relative grid aspect-square w-[clamp(200px,40vw,280px)] place-items-center before:absolute before:inset-0 before:animate-floaty before:rounded-full before:bg-(--tone-bg) before:content-[''] after:absolute after:inset-[14%] after:animate-floaty-reverse after:rounded-full after:bg-[color-mix(in_srgb,var(--tone)_14%,transparent)] after:content-['']",
          compact && 'w-[150px]',
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            'absolute top-[14%] z-[1] text-[clamp(44px,9vw,72px)] leading-none font-black tracking-[-1px] text-(--tone)',
            compact && 'text-[34px]',
          )}
        >
          {content.code}
        </span>
        <span
          className={cn(
            'absolute bottom-[14%] z-[2] grid size-[clamp(70px,14vw,96px)] -rotate-8 place-items-center rounded-[28px] bg-(--tone) text-white shadow-[0_16px_36px_color-mix(in_srgb,var(--tone)_45%,transparent)]',
            compact && 'size-[60px] rounded-[20px]',
          )}
        >
          <Icon size={compact ? 38 : 54} />
        </span>
      </div>
      <h1 className="text-[clamp(20px,3.2vw,28px)]">{content.title}</h1>
      <p className="max-w-[460px] leading-[2] text-muted">{content.text}</p>
      {message && import.meta.env.DEV && (
        <code className="max-w-full rounded-[10px] bg-bg-2 px-3 py-1.5 font-[monospace] text-[12px] [direction:ltr] [overflow-wrap:anywhere]">
          {message}
        </code>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        {onRetry && (
          <Button onClick={onRetry} icon={<RefreshCw size={18} />}>
            تلاش دوباره
          </Button>
        )}
        {content.login && (
          <Button to="/login" variant="accent">
            ورود به حساب
          </Button>
        )}
        {home && (
          <Button to="/" variant="outline" icon={<House size={18} />}>
            صفحهٔ اصلی
          </Button>
        )}
        {!compact && (
          <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={goBack}>
            <ArrowRight size={18} /> بازگشت
          </button>
        )}
      </div>
    </section>
  )
})

export default ErrorState
