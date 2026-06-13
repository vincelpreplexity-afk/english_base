import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  MaterialsAddButton,
  MaterialsAddButtonSmall,
  MaterialsIcon,
} from '@/components/layout/materials-actions'

export default function MaterialsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
            Материалы
          </h1>
          <p className="text-stone-500 mt-0.5">Библиотека учебных файлов и ссылок</p>
        </div>
        <MaterialsAddButton />
      </div>

      <Card>
        <EmptyState
          icon={<MaterialsIcon />}
          title="Материалов пока нет"
          description="Добавьте пособия, статьи и упражнения для работы с учениками"
          action={<MaterialsAddButtonSmall />}
        />
      </Card>
    </div>
  )
}
