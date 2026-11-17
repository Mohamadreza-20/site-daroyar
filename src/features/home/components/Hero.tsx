import { memo } from 'react'
import { Pause, Play } from 'lucide-react'
import { ICON_BTN } from '@/shared/ui/common/Button'
import { cn } from '@/shared/ui/lib/cn'
import { HERO_SLIDES } from '@/features/home/domain/content'
import { useHeroSlider } from '@/features/home/hooks/useHeroSlider'
import HeroSlide from '@/features/home/components/HeroSlide'
import HeroArt from '@/features/home/components/HeroArt'

const Hero = memo(function Hero() {
  const { index, select, playing, toggle, hold, release } = useHeroSlider(HERO_SLIDES.length)
  return (
    <section className="site-container relative pt-5" aria-label="بنرهای اصلی" aria-roledescription="carousel">
      <div className="relative" onFocus={hold} onBlur={release} onMouseEnter={hold} onMouseLeave={release}>
        <div className="relative grid overflow-hidden rounded-xl shadow-lg">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className={cn(
                'group col-start-1 row-start-1',
                i === index
                  ? 'z-1 opacity-100 [transition:opacity_0.7s_ease]'
                  : 'pointer-events-none z-0 opacity-0 [transition:opacity_0s_linear_0.7s]',
              )}
              data-active={i === index}
              inert={i !== index}
              aria-roledescription="slide"
            >
              <HeroSlide slide={slide} />
            </div>
          ))}
          <HeroArt />
        </div>
        <button
          type="button"
          className={cn(
            ICON_BTN,
            'absolute end-4 bottom-4 z-5 rounded-full bg-black/28 text-white hover:bg-black/45 hover:text-white',
          )}
          onClick={toggle}
          aria-label={playing ? 'توقف چرخش بنرها' : 'ادامهٔ چرخش بنرها'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="absolute inset-x-0 bottom-[18px] z-5 flex justify-center gap-1.5">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={cn(
                'relative h-[9px] rounded-full bg-white [transition:width_0.3s,opacity_0.3s] before:absolute before:-inset-x-1.5 before:-inset-y-2 before:content-[""]',
                i === index ? 'w-7 opacity-100' : 'w-[9px] opacity-50',
              )}
              onClick={() => select(i)}
              aria-label={`بنر ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      </div>
    </section>
  )
})

export default Hero
