import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import {
  DashboardTodayHeader,
  DashboardTasksHeader,
  DashboardActionsHeader,
} from '@/components/layout/dashboard-icons'
import { TodayWidget } from '@/components/dashboard/today-widget'
import { TasksWidget } from '@/components/dashboard/tasks-widget'
import { QuickActions } from '@/components/dashboard/quick-actions'
import HorseMascot from '@/components/dashboard/horse-mascot'
import { mskTodayDateString, mskDayRangeUtc } from '@/lib/time'

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStr = mskTodayDateString()
  const { start, end } = mskDayRangeUtc(todayStr)

  const [
    { data: lessonRows },
    { data: taskRows },
    { data: studentRows },
    { data: materialRows },
  ] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, scheduled_at, duration_min, is_paid, students(name)')
      .eq('status', 'scheduled')
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('tasks')
      .select('id, title, is_done')
      .eq('is_done', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('students')
      .select('id, name')
      .eq('is_archived', false)
      .order('name', { ascending: true }),
    supabase
      .from('materials')
      .select('category')
      .not('category', 'is', null),
  ])

  const lessons = (lessonRows ?? []) as unknown as {
    id: string
    scheduled_at: string
    duration_min: number
    is_paid: boolean
    students: { name: string } | null
  }[]

  const tasks = (taskRows ?? []) as {
    id: string
    title: string
    is_done: boolean
  }[]

  const students = studentRows ?? []

  const materialCategories = Array.from(
    new Set((materialRows ?? []).map(m => m.category).filter(Boolean) as string[])
  ).sort()

  const now = new Date()
  const dateLabel = now.toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).replace(' г.', '').replace(/^./, c => c.toUpperCase())

  return (
    <div className="relative min-h-full p-4 lg:p-6 space-y-5">
      {/* Decorative watermark in the bottom-left corner of the content area.
          Absolute (not fixed) so it stays inside the content box even though
          PageEnter establishes a transform containing block; -z-10 + low
          opacity + pointer-events-none keep it behind the UI and inert. */}
      <Image
        src="/flower.png"
        alt=""
        aria-hidden
        width={800}
        height={724}
        priority={false}
        draggable={false}
        className="pointer-events-none select-none absolute bottom-4 left-2 lg:left-3 w-28 lg:w-40 h-auto opacity-[0.13] -z-10"
      />

      <div>
        <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
          Дашборд
        </h1>
        <p className="text-stone-500 mt-0.5 text-sm">{dateLabel}</p>
      </div>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 lg:space-y-5">
          <Card>
            <CardHeader>
              <DashboardTodayHeader />
            </CardHeader>
            <TodayWidget lessons={lessons} />
          </Card>

          <Card>
            <CardHeader>
              <DashboardTasksHeader />
            </CardHeader>
            <TasksWidget tasks={tasks} />
          </Card>
        </div>

        <div className="space-y-4 lg:space-y-5">
          <Card>
            <CardHeader>
              <DashboardActionsHeader />
            </CardHeader>
            <CardContent>
              <QuickActions students={students} materialCategories={materialCategories} />
            </CardContent>
          </Card>

          <div className="rounded-xl overflow-hidden py-2">
            <HorseMascot />
          </div>
        </div>
      </div>
    </div>
  )
}
