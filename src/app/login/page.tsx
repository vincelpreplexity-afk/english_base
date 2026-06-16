'use client'

import { BookOpen } from '@phosphor-icons/react'
import { useLoginTransition } from '@/hooks/useLoginTransition'

export default function LoginPage() {
  const { isSubmitting, error, handleSubmit, cardRef, formRef, sealRef, progressRef } =
    useLoginTransition()

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
              <BookOpen size={32} weight="duotone" className="text-accent" />
              <span className="font-heading text-[18px] font-semibold text-accent">
                English Base
              </span>
            </div>
          </div>

          {/* Progress bar — sweeps the bottom edge of the card */}
          <div
            ref={progressRef}
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] w-0 rounded-[1px] bg-accent"
          />
        </div>
      </div>
    </main>
  )
}
