'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/login/actions'

/* Easing values — shared design tokens for the login → dashboard transition */
const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)'
const EASE_IN = 'cubic-bezier(0.4, 0.0, 1, 1)'
const EASE_IN_OUT = 'cubic-bezier(0.4, 0.0, 0.2, 1)'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Resolve when a WAAPI animation finishes; tolerant of null / cancelled. */
function settled(anim: Animation | undefined | null) {
  return anim ? anim.finished.catch(() => {}) : Promise.resolve()
}

/**
 * Drives the two-phase "Glowing Seal" animation on the login screen.
 *
 * Phase 1 — "Sealing": form fields fade out; a logo mark fades in over the same
 * space — the BookOpen icon scales in with a soft overshoot behind a pulsing
 * accent halo, the wordmark resolves out of a blur — while a glowing progress
 * bar fills the card's bottom edge with a highlight glinting across it.
 *
 * Phase 2 — "Opening": on success the whole card dissolves (fade + gentle
 * scale + blur) as the halo blooms outward, revealing the subtle root
 * background; we then navigate, and the dashboard fades in on mount.
 *
 * The hook owns the refs it animates and wraps the existing `login` server
 * action — the page only wires the refs and calls `handleSubmit`.
 */
export function useLoginTransition() {
  const router = useRouter()

  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Warm the dashboard route so the Phase 2 navigation resolves instantly.
  useEffect(() => {
    router.prefetch('/')
  }, [router])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isSubmitting) return

      const formData = new FormData(e.currentTarget)
      const reduced = prefersReducedMotion()

      setError(null)
      setIsSubmitting(true)

      const card = cardRef.current
      const form = formRef.current
      const seal = sealRef.current
      const glow = glowRef.current
      const icon = iconRef.current
      const text = textRef.current
      const bar = progressRef.current
      const shimmer = shimmerRef.current

      // Pin the card height so swapping form ↔ logo never shifts layout.
      if (card) card.style.height = `${card.offsetHeight}px`
      if (seal) seal.style.visibility = 'visible'

      let barAnim: Animation | undefined
      let shimmerAnim: Animation | undefined

      if (!reduced) {
        // Form fields fade out and lift slightly.
        form?.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-8px)' },
          ],
          { duration: 200, easing: EASE_OUT, fill: 'forwards' }
        )

        // Halo: appear, breathe, settle — a soft glow behind the mark.
        glow?.animate(
          [
            { opacity: 0, transform: 'scale(0.5)' },
            { opacity: 0.7, transform: 'scale(1.05)', offset: 0.45 },
            { opacity: 0.4, transform: 'scale(0.98)', offset: 0.75 },
            { opacity: 0.6, transform: 'scale(1.02)' },
          ],
          { duration: 1100, easing: EASE_IN_OUT, fill: 'both', delay: 120 }
        )

        // Icon: scale in with a gentle overshoot.
        icon?.animate(
          [
            { opacity: 0, transform: 'scale(0.7)' },
            { opacity: 1, transform: 'scale(1.08)', offset: 0.6 },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 400, easing: EASE_OUT, fill: 'both', delay: 140 }
        )

        // Wordmark: resolve out of a blur as it lifts into place.
        text?.animate(
          [
            { opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          ],
          { duration: 350, easing: EASE_OUT, fill: 'both', delay: 240 }
        )

        // Progress bar fills the bottom edge…
        barAnim = bar?.animate(
          [{ width: '0%' }, { width: '100%' }],
          { duration: 650, easing: EASE_IN_OUT, fill: 'forwards' }
        )

        // …with a highlight glinting across it while it fills.
        shimmerAnim = shimmer?.animate(
          [{ transform: 'translateX(-150%)' }, { transform: 'translateX(260%)' }],
          { duration: 700, easing: EASE_IN_OUT, iterations: Infinity }
        )
      }

      // Server action runs in parallel with Phase 1.
      let result: Awaited<ReturnType<typeof login>>
      try {
        result = await login(formData)
      } catch {
        result = { ok: false, error: 'Не удалось войти. Попробуйте ещё раз.' }
      }

      // Let the progress bar visibly complete before we branch.
      await settled(barAnim)

      if (!result.ok) {
        // Reverse Phase 1 and surface the error inline — no navigation.
        setError(result.error)
        shimmerAnim?.cancel()

        if (!reduced && seal) {
          await settled(
            seal.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 160,
              easing: EASE_IN,
              fill: 'forwards',
            })
          )
        }
        if (!reduced) {
          bar?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 160,
            fill: 'forwards',
          })
          form?.animate(
            [
              { opacity: 0, transform: 'translateY(-8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 220, easing: EASE_OUT, fill: 'forwards' }
          )
        }

        if (seal) {
          seal.style.visibility = 'hidden'
          // Clear retained end-states so the next attempt starts clean.
          seal.getAnimations().forEach((a) => a.cancel())
          glow?.getAnimations().forEach((a) => a.cancel())
          icon?.getAnimations().forEach((a) => a.cancel())
          text?.getAnimations().forEach((a) => a.cancel())
        }
        if (bar) bar.getAnimations().forEach((a) => a.cancel())
        if (card) card.style.height = ''
        setIsSubmitting(false)
        return
      }

      // PHASE 2 — "Opening".
      shimmerAnim?.cancel()

      if (!reduced) {
        // Halo blooms outward as the card lets go.
        glow?.animate(
          [
            { opacity: 0.6, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(2)' },
          ],
          { duration: 450, easing: EASE_OUT, fill: 'forwards' }
        )

        // The whole card dissolves: fade + gentle scale + blur.
        if (card) {
          await settled(
            card.animate(
              [
                { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
                { opacity: 0, transform: 'scale(1.04)', filter: 'blur(8px)' },
              ],
              { duration: 450, easing: EASE_IN_OUT, fill: 'forwards' }
            )
          )
        }
      }

      router.push('/')
    },
    [isSubmitting, router]
  )

  return {
    isSubmitting,
    error,
    handleSubmit,
    cardRef,
    formRef,
    sealRef,
    glowRef,
    iconRef,
    textRef,
    progressRef,
    shimmerRef,
  }
}
