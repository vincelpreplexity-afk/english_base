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
      title={isPaid ? 'Оплачено — нажмите чтобы снять' : 'Не оплачено — нажмите чтобы отметить'}
      className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
        isPaid
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-stone-100 text-stone-400 hover:bg-accent-subtle hover:text-accent'
      }`}
    >
      {isPaid ? '✓' : '₽'}
    </button>
  )
}
