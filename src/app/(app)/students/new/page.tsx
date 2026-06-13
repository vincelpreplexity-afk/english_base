import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createStudent } from '../actions'

export default function NewStudentPage() {
  return (
    <div className="p-4 lg:p-6 max-w-lg space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/students"
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          ← Ученики
        </Link>
        <span className="text-stone-300 text-sm">/</span>
        <h1 className="font-heading text-lg font-semibold text-stone-900">
          Новый ученик
        </h1>
      </div>

      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-stone-700">Основная информация</span>
        </CardHeader>
        <CardContent>
          <form action={createStudent} className="space-y-4">
            <Input
              label="Имя"
              name="name"
              placeholder="Иван Иванов"
              required
              autoFocus
            />
            <Input
              label="Уровень"
              name="level"
              placeholder="B1, Upper-Intermediate, A2…"
            />

            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                Контакты
              </p>
              <div className="space-y-3">
                <Input
                  label="Telegram"
                  name="telegram"
                  placeholder="@username"
                />
                <Input
                  label="Телефон"
                  name="phone"
                  type="tel"
                  placeholder="+7 900 000 00 00"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="ivan@example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="h-9 px-4 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.98] cursor-pointer"
              >
                Создать ученика
              </button>
              <Link
                href="/students"
                className="h-9 px-4 inline-flex items-center bg-stone-100 text-stone-700 border border-stone-200 text-sm font-medium rounded-lg hover:bg-stone-200 transition-colors"
              >
                Отмена
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
