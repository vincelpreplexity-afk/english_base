import { formatMskTime } from '@/lib/time'
import TodayPayToggle from './today-pay-toggle'

type Lesson = {
  id: string
  scheduled_at: string
  duration_min: number
  is_paid: boolean
  students: { name: string } | null
}

export function TodayWidget({ lessons }: { lessons: Lesson[] }) {
  if (lessons.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-stone-400 text-sm">Занятий на сегодня нет</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-stone-100">
      {lessons.map(l => {
        const endDate = new Date(
          new Date(l.scheduled_at).getTime() + l.duration_min * 60000
        )
        return (
          <li key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {l.students?.name ?? 'Ученик'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {formatMskTime(l.scheduled_at)} – {formatMskTime(endDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-stone-400">{l.duration_min} мин</span>
              <TodayPayToggle lessonId={l.id} isPaid={l.is_paid} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
