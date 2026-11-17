const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

export const loopAutoplay = (delay: number) =>
  prefersReducedMotion() ? false : ({ delay, disableOnInteraction: false, pauseOnMouseEnter: true } as const)
