import { memo } from 'react'
import { Pill, ShieldCheck, Truck } from 'lucide-react'
import { cn } from '@/shared/ui/lib/cn'

const FLOAT_BASE =
  'absolute grid size-[62px] animate-floaty-5 place-items-center rounded-[20px] bg-white text-primary-700 shadow-md will-change-transform'

const FLOATERS = [
  { icon: Pill, className: cn(FLOAT_BASE, 'start-[4%] top-[8%] [animation-delay:-1s]') },
  { icon: ShieldCheck, className: cn(FLOAT_BASE, 'start-0 bottom-[12%] text-accent-600 [animation-delay:-2.5s]') },
  { icon: Truck, className: cn(FLOAT_BASE, 'end-[2%] top-[20%] text-indigo [animation-delay:-3.5s]') },
]

const HeroArt = memo(function HeroArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-1 grid grid-cols-[1.15fr_0.85fr] items-center gap-6 p-[clamp(28px,5vw,64px)] max-[1025px]:hidden"
      aria-hidden="true"
    >
      <span />
      <div className="relative grid place-items-center">
        <div className="grid aspect-square w-[min(100%,340px)] animate-floaty place-items-center rounded-full border-2 border-white/35 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),rgba(255,255,255,0.1))] shadow-[inset_0_0_60px_rgba(255,255,255,0.2)] will-change-transform">
          <svg viewBox="0 0 64 64" width="46%" height="46%">
            <path d="M26 10h12v16h16v12H38v16H26V38H10V26h16z" fill="#fff" />
          </svg>
        </div>
        {FLOATERS.map(({ icon: Icon, className }) => (
          <span key={className} className={className}>
            <Icon size={26} />
          </span>
        ))}
      </div>
    </div>
  )
})

export default HeroArt
