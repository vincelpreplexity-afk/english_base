import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DashboardTodayHeader,
  DashboardTasksHeader,
  DashboardActionsHeader,
} from '@/components/layout/dashboard-icons'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-stone-900">
          Дашборд
        </h1>
        <p className="text-stone-500 mt-0.5">Пятница, 13 июня 2026</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <DashboardTodayHeader />
            </CardHeader>
            <EmptyState
              title="Занятий на сегодня нет"
              description="Запланированные уроки появятся здесь"
            />
          </Card>

          <Card>
            <CardHeader>
              <DashboardTasksHeader />
            </CardHeader>
            <EmptyState
              title="Задач нет"
              description="Напоминания и дела по подготовке к урокам появятся здесь"
            />
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <DashboardActionsHeader />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <a
                href="/students"
                className="flex items-center rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                Добавить ученика
              </a>
              <a
                href="/schedule"
                className="flex items-center rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                Запланировать урок
              </a>
              <a
                href="/materials"
                className="flex items-center rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                Добавить материал
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
