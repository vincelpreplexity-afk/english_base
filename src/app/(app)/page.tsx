import Image from 'next/image'
import Link from 'next/link'
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
import { mskTodayDateString, mskDayRangeUtc } from '@/lib/time'

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStr = mskTodayDateString()
  const { start, end } = mskDayRangeUtc(todayStr)
  // First instant of the current Moscow month, as a UTC ISO bound.
  const monthStart = new Date(`${todayStr.slice(0, 7)}-01T00:00:00.000+03:00`).toISOString()

  const [
    { data: lessonRows },
    { data: taskRows },
    { data: studentRows },
    { data: materialRows },
    { data: monthPaymentRows },
    { data: debtorRows },
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
    supabase
      .from('payments')
      .select('amount')
      .gte('paid_at', monthStart),
    supabase
      .from('student_balances')
      .select('student_id, name, balance')
      .lt('balance', 0)
      .order('balance', { ascending: true }),
  ])

  const lessons = (lessonRows ?? []) as unknown as {
    id: string
    scheduled_at: string
    duration_min: number
    students: { name: string } | null
  }[]

  const monthIncome = (monthPaymentRows ?? []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const debtors = (debtorRows ?? []).map((d) => ({
    id: d.student_id as string,
    name: d.name as string,
    balance: Number(d.balance),
  }))

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
      {/* Small decorative flower in the bottom-left corner of the content area.
          Absolute (not fixed) so it stays inside the content box even though
          PageEnter establishes a transform containing block; -z-10 +
          pointer-events-none keep it behind the cards so it never overlaps the
          UI. Full opacity — a solid little illustration, not a watermark. */}
      <Image
        src="/flower.png"
        alt=""
        aria-hidden
        width={800}
        height={724}
        priority={false}
        draggable={false}
        className="pointer-events-none select-none absolute bottom-4 left-2 lg:left-3 w-24 lg:w-32 h-auto -z-10"
      />

      <div>
        <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
          Дашборд
        </h1>
        <p className="text-stone-500 mt-0.5 text-sm">{dateLabel}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card className="px-4 py-3">
          <p className="text-xs text-stone-500">Доход за месяц</p>
          <p className="font-heading text-xl font-semibold text-stone-900 mt-0.5">
            {fmtMoney(monthIncome)}
          </p>
        </Card>
        <Card className="px-4 py-3">
          <p className="text-xs text-stone-500">Активных учеников</p>
          <p className="font-heading text-xl font-semibold text-stone-900 mt-0.5">
            {students.length}
          </p>
        </Card>
        <Card className="px-4 py-3">
          <p className="text-xs text-stone-500">Должников</p>
          <p
            className={`font-heading text-xl font-semibold mt-0.5 ${
              debtors.length > 0 ? 'text-red-600' : 'text-stone-900'
            }`}
          >
            {debtors.length}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 lg:space-y-5">
          <Card>
            <CardHeader>
              <DashboardTodayHeader />
            </CardHeader>
            <TodayWidget lessons={lessons} />
          </Card>

          {debtors.length > 0 && (
            <Card>
              <CardHeader>
                <span className="text-sm font-medium text-stone-700">Должники</span>
                <span className="text-xs text-stone-400">{debtors.length}</span>
              </CardHeader>
              <ul className="divide-y divide-stone-100">
                {debtors.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/students/${d.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-stone-800 truncate">
                        {d.name}
                      </span>
                      <span className="text-sm font-semibold text-red-600 shrink-0">
                        {fmtMoney(Math.abs(d.balance))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

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

          <div className="rounded-xl overflow-hidden">
            <Image
              src="/mascot.png"
              alt=""
              width={1024}
              height={1024}
              className="w-full h-auto block"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
