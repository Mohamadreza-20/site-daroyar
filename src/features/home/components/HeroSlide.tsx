import { memo } from 'react'
import { ArrowLeft } from 'lucide-react'
import Button from '@/shared/ui/common/Button'
import { cn } from '@/shared/ui/lib/cn'
import type { HERO_SLIDES } from '@/features/home/domain/content'

type Slide = (typeof HERO_SLIDES)[number]

const SLIDE_TONES: Record<string, string> = {
  teal: 'bg-[linear-gradient(135deg,#096a5f_0%,#0b8576_100%)]',
  coral: 'bg-[linear-gradient(135deg,#b53b17_0%,#d1481f_100%)]',
  indigo: 'bg-[linear-gradient(135deg,#3a3eb5_0%,#4a4ecf_100%)]',
}

const HeroSlide = memo(function HeroSlide({ slide: s }: { slide: Slide }) {
  return (
    <div
      className={cn(
        'relative grid min-h-[clamp(420px,46vw,540px)] grid-cols-[1.15fr_0.85fr] items-center gap-6 overflow-hidden p-[clamp(28px,5vw,64px)] text-white max-[1025px]:grid-cols-1',
        SLIDE_TONES[s.tone],
      )}
    >
      <div className="pointer-events-none absolute -top-[140px] -end-[100px] size-[420px] rounded-full bg-white/12" />
      <div className="pointer-events-none absolute -bottom-[90px] start-1/4 size-[260px] rounded-full bg-white/8" />
      <div className="relative z-2 grid justify-items-start gap-[18px] [transition:opacity_0.3s_ease] group-data-[active=false]:opacity-0 group-data-[active=true]:[transition-delay:0.4s]">
        <span className="rounded-full bg-white/20 px-4 py-1.5 text-[13px] font-extrabold backdrop-blur-[6px]">
          {s.badge}
        </span>
        <h2 className="text-[clamp(28px,4.6vw,52px)] leading-[1.3] font-black">{s.title}</h2>
        <p className="max-w-[520px] text-[clamp(14px,1.6vw,17px)] leading-[2] opacity-92">{s.text}</p>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Button to={s.cta.to} variant="white" size="lg" icon={<ArrowLeft size={20} />}>
            {s.cta.label}
          </Button>
          <Button
            to={s.alt.to}
            variant="outline"
            size="lg"
            className="[--btn-bd:rgba(255,255,255,0.55)] [--btn-fg:#fff] not-disabled:hover:[--btn-bd:#fff] not-disabled:hover:[--btn-bg:rgba(255,255,255,0.14)] not-disabled:hover:[--btn-fg:#fff]"
          >
            {s.alt.label}
          </Button>
        </div>
      </div>
    </div>
  )
})

export default HeroSlide
