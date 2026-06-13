import { addMinutes, format } from 'date-fns'

type Lesson = {
  id: string
  scheduled_at: string
  duration_min: number
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
        const start = new Date(l.scheduled_at)
        const end = addMinutes(start, l.duration_min)
        return (
          <li key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {l.students?.name ?? 'Ученик'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </p>
            </div>
            <span className="text-xs text-stone-400 shrink-0">{l.duration_min} мин</span>
          </li>
        )
      })}
    </ul>
  )
}
