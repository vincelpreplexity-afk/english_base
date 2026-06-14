'use client'

import { useState, useTransition } from 'react'
import { toggleLessonPaid } from '@/app/(app)/schedule/actions'

export default function TodayPayToggle({
  lessonId,
  isPaid: initial,
}: {
  lessonId: string
  isPaid: boolean
}) {
  const [isPaid, setIsPaid] = useState(initial)
  const [, startTransition] = useTransition()

  function toggle() {
    const next = !isPaid
    setIsPaid(next)
    startTransition(() => toggleLessonPaid(lessonId, next))
  }

  return (
    <button
      onClick={toggle}
      aria-label={isPaid ? 'Оплачено — нажмите чтобы снять' : 'Не оплачено — нажмите чтобы отметить'}
      aria-pressed={isPaid}
      title={isPaid ? 'Оплачено — нажмите чтобы снять' : 'Не оплачено — нажмите чтобы отметить'}
      className="group flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span
        className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
          isPaid
            ? 'bg-green-100 text-green-700 group-hover:bg-green-200'
            : 'bg-stone-100 text-stone-500 group-hover:bg-accent-subtle group-hover:text-accent'
        }`}
      >
        {isPaid ? '✓' : '₽'}
      </span>
    </button>
  )
}
