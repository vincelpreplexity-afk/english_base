'use client'

import { BookOpen } from '@phosphor-icons/react'
import { useLoginTransition } from '@/hooks/useLoginTransition'

export default function LoginPage() {
  const {
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
  } = useLoginTransition()

  return (
    <main className="min-h-dvh flex items-center justify-center bg-accent-subtle px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-heading text-lg font-semibold text-stone-900">
            English Base
          </span>
        </div>

        <div
          ref={cardRef}
          className="relative overflow-hidden bg-white border border-stone-200 rounded-xl shadow-sm"
        >
          <div className="p-6">
            {/* Form fields — fade/lift out during Phase 1 */}
            <div ref={formRef} className="space-y-4">
              <h1 className="text-sm font-medium text-stone-700">Введите пароль</h1>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  required
                  autoFocus
                  disabled={isSubmitting}
                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-stone-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60"
                >
                  Войти
                </button>
              </form>

              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}
            </div>

            {/* Logo mark — fades in over the same space during Phase 1 */}
            <div
              ref={sealRef}
              aria-hidden
              className="invisible absolute inset-0 flex flex-col items-center justify-center gap-2"
            >
              <div className="relative flex items-center justify-center">
                {/* Pulsing accent halo behind the icon */}
                <div
                  ref={glowRef}
                  className="pointer-events-none absolute h-20 w-20 rounded-full bg-accent/40 opacity-0 blur-2xl"
                />
                <div ref={iconRef} className="relative opacity-0">
                  <BookOpen size={32} weight="duotone" className="text-accent" />
                </div>
              </div>
              <span
                ref={textRef}
                className="font-heading text-[18px] font-semibold text-accent opacity-0"
              >
                English Base
              </span>
            </div>
          </div>

          {/* Progress bar — glowing fill with a highlight glinting across it */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div
              ref={progressRef}
              aria-hidden
              className="relative h-full w-0 overflow-hidden rounded-[1px] bg-accent shadow-[0_0_10px_rgba(92,61,108,0.7)]"
            >
              <div
                ref={shimmerRef}
                className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
