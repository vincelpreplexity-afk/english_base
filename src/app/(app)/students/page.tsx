import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  StudentsAddButton,
  StudentsAddButtonSmall,
  StudentsIcon,
} from '@/components/layout/students-actions'

export default function StudentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold text-stone-900">
            Ученики
          </h1>
          <p className="text-stone-500 mt-0.5">Список и карточки студентов</p>
        </div>
        <StudentsAddButton />
      </div>

      <Card>
        <EmptyState
          icon={<StudentsIcon />}
          title="Учеников пока нет"
          description="Добавьте первого ученика, чтобы начать вести базу студентов"
          action={<StudentsAddButtonSmall />}
        />
      </Card>
    </div>
  )
}
