import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  ScheduleAddButton,
  ScheduleAddButtonSmall,
  ScheduleIcon,
} from '@/components/layout/schedule-actions'

export default function SchedulePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold text-stone-900">
            Расписание
          </h1>
          <p className="text-stone-500 mt-0.5">Календарь занятий</p>
        </div>
        <ScheduleAddButton />
      </div>

      <Card>
        <EmptyState
          icon={<ScheduleIcon />}
          title="Занятий не запланировано"
          description="Добавьте первый урок, чтобы начать работу с расписанием"
          action={<ScheduleAddButtonSmall />}
        />
      </Card>
    </div>
  )
}
