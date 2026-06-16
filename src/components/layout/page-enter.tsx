'use client'

import { useEffect, useRef } from 'react'

const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)'

/**
 * Completes the login → dashboard "opening": fades the app content in on mount.
 *
 * Lives in the (app) layout, which persists across internal navigation, so the
 * animation fires once when entering the app section (including the post-login
 * push) and not on every route change within it. Also gives direct navigations
 * the same deliberate "entering the system" feel.
 */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const anim = el.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 400, easing: EASE_OUT, fill: 'both', delay: 200 }
    )

    return () => anim.cancel()
  }, [])

  return (
    <div ref={ref} data-page-enter className="h-full">
      {children}
    </div>
  )
}
