import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/schedule/calendar-view'

export default async function SchedulePage() {
  const supabase = await createClient()

  const [{ data: lessons }, { data: students }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, student_id, scheduled_at, duration_min, status, notes, students(name)')
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('students')
      .select('id, name, level')
      .eq('is_archived', false)
      .order('name', { ascending: true }),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b border-stone-200 bg-white">
        <div>
          <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
            Расписание
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">Календарь занятий</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 lg:p-6">
        <CalendarView
          lessons={lessons ?? []}
          students={students ?? []}
        />
      </div>
    </div>
  )
}
