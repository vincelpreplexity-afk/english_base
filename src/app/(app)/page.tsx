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

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStr = new Date().toISOString().split('T')[0]
  const start = `${todayStr}T00:00:00.000Z`
  const end = `${todayStr}T23:59:59.999Z`

  const [
    { data: lessonRows },
    { data: taskRows },
    { data: studentRows },
    { data: materialRows },
  ] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, scheduled_at, duration_min, students(name)')
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

  const lessons = (lessonRows ?? []) as {
    id: string
    scheduled_at: string
    duration_min: number
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).replace(' г.', '').replace(/^./, c => c.toUpperCase())

  return (
    <div className="p-4 lg:p-6 space-y-5">
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

        <div>
          <Card>
            <CardHeader>
              <DashboardActionsHeader />
            </CardHeader>
            <CardContent>
              <QuickActions students={students} materialCategories={materialCategories} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
