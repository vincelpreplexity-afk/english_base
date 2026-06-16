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
function settled(anim: Animation | undefined) {
  return anim ? anim.finished.catch(() => {}) : Promise.resolve()
}

/**
 * Drives the two-phase "entering the system" animation on the login screen.
 *
 * Phase 1 — "Sealing": form fields fade out, a logo mark fades in over the same
 * space, and a progress bar sweeps the bottom edge of the card. Fires the moment
 * the form is submitted, in parallel with the server action request.
 *
 * Phase 2 — "Opening": on a successful response the card scales down and fades
 * away (revealing the subtle root background beneath it), then we navigate to
 * the dashboard, whose own mount animation completes the "opening" feel.
 *
 * The hook owns the refs it animates and wraps the existing `login` server
 * action — the page only wires the refs and calls `handleSubmit`.
 */
export function useLoginTransition() {
  const router = useRouter()

  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

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
      const bar = progressRef.current

      // Pin the card height so swapping form ↔ logo never shifts layout.
      if (card) card.style.height = `${card.offsetHeight}px`

      let barAnim: Animation | undefined

      if (!reduced) {
        // Form fields fade out and lift slightly.
        form?.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-8px)' },
          ],
          { duration: 200, easing: EASE_OUT, fill: 'forwards' }
        )

        // Logo mark fades in over the same space.
        if (seal) {
          seal.style.visibility = 'visible'
          seal.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 250, easing: EASE_OUT, fill: 'forwards', delay: 120 }
          )
        }

        // Progress bar sweeps the bottom edge of the card.
        barAnim = bar?.animate(
          [{ width: '0%' }, { width: '100%' }],
          { duration: 600, easing: EASE_IN_OUT, fill: 'forwards' }
        )
      } else if (seal) {
        seal.style.visibility = 'visible'
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

        if (!reduced) {
          if (seal) {
            await settled(
              seal.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 150,
                easing: EASE_IN,
                fill: 'forwards',
              })
            )
          }
          bar?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 150,
            fill: 'forwards',
          })
          form?.animate(
            [
              { opacity: 0, transform: 'translateY(-8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 200, easing: EASE_OUT, fill: 'forwards' }
          )
        }

        if (seal) seal.style.visibility = 'hidden'
        if (card) card.style.height = ''
        setIsSubmitting(false)
        return
      }

      // PHASE 2 — "Opening": card scales down and fades away, revealing the
      // subtle root background. The dashboard then fades in on mount.
      if (!reduced && card) {
        await settled(
          card.animate(
            [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'scale(0.96)' },
            ],
            { duration: 350, easing: EASE_IN, fill: 'forwards' }
          )
        )
      }

      router.push('/')
    },
    [isSubmitting, router]
  )

  return { isSubmitting, error, handleSubmit, cardRef, formRef, sealRef, progressRef }
}
