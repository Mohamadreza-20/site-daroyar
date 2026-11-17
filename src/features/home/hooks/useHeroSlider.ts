import { useCallback, useEffect, useState } from 'react'

const INTERVAL = 5200

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useHeroSlider(count: number) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !reducedMotion())
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!playing || held) return
    const id = setInterval(() => setIndex((current) => (current + 1) % count), INTERVAL)
    return () => clearInterval(id)
  }, [playing, held, count, index])

  const toggle = useCallback(() => setPlaying((value) => !value), [])
  const hold = useCallback(() => setHeld(true), [])
  const release = useCallback(() => setHeld(false), [])

  return { index, select: setIndex, playing, toggle, hold, release }
}
