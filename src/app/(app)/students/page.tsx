import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { archiveStudent } from './actions'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: students } = await supabase
    .from('students')
    .select('id, name, level, avatar_emoji, created_at')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
            Ученики
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            {students?.length
              ? `${students.length} активных`
              : 'Список и карточки студентов'}
          </p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center h-9 px-4 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shrink-0"
        >
          + Добавить
        </Link>
      </div>

      {!students?.length ? (
        <Card>
          <EmptyState
            title="Учеников пока нет"
            description="Добавьте первого ученика, чтобы начать вести базу студентов"
            action={
              <Link
                href="/students/new"
                className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Добавить ученика
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <Card
              key={student.id}
              className="hover:border-stone-300 transition-colors"
            >
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-accent-subtle flex items-center justify-center shrink-0">
                      {student.avatar_emoji ? (
                        <span className="text-xl leading-none">{student.avatar_emoji}</span>
                      ) : (
                        <span className="text-sm font-semibold text-accent">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-sm font-medium text-stone-900 hover:text-accent transition-colors block"
                      >
                        {student.name}
                      </Link>
                      {student.level && (
                        <span className="text-xs text-stone-500">
                          {student.level}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/students/${student.id}`}
                      className="text-xs text-stone-500 hover:text-accent transition-colors px-2 py-1.5 rounded-md hover:bg-stone-100"
                    >
                      Открыть →
                    </Link>
                    <form action={archiveStudent.bind(null, student.id)}>
                      <button
                        type="submit"
                        className="text-xs text-stone-400 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50 cursor-pointer"
                      >
                        Архив
                      </button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
