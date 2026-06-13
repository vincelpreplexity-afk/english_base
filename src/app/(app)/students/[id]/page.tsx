import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StudentInfoForm } from '@/components/students/student-info-form'
import { TrackSection } from '@/components/students/track-section'
import { NotesSection } from '@/components/students/notes-section'
import {
  archiveStudent,
  updateStudentInfo,
  updateStudentNotes,
  addTopicToStudent,
  removeTopicFromStudent,
  updateTopicStatus,
} from '../actions'

type Contacts = { phone?: string; email?: string; telegram?: string }

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: student }, { data: rawTopics }] = await Promise.all([
    supabase
      .from('students')
      .select('id, name, level, contacts, notes')
      .eq('id', id)
      .single(),
    supabase
      .from('student_topics')
      .select('id, status, topics(title)')
      .eq('student_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!student) notFound()

  const contacts = (student.contacts ?? {}) as Contacts

  const studentTopics = (rawTopics ?? []).map((st) => ({
    id: st.id,
    status: st.status as 'planned' | 'in_progress' | 'done',
    topicTitle: (st.topics as unknown as { title: string } | null)?.title ?? '',
  }))

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/students"
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors shrink-0"
          >
            ← Ученики
          </Link>
          <span className="text-stone-300 text-sm">/</span>
          <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl truncate">
            {student.name}
          </h1>
        </div>
        <form action={archiveStudent.bind(null, id)}>
          <button
            type="submit"
            className="text-xs text-stone-400 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50 cursor-pointer shrink-0"
          >
            Архивировать
          </button>
        </form>
      </div>

      {/* Block 1: Basic info */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-stone-700">Основная информация</span>
        </CardHeader>
        <CardContent>
          <StudentInfoForm
            studentId={id}
            defaultName={student.name}
            defaultLevel={student.level ?? ''}
            defaultPhone={contacts.phone ?? ''}
            defaultEmail={contacts.email ?? ''}
            defaultTelegram={contacts.telegram ?? ''}
            action={updateStudentInfo}
          />
        </CardContent>
      </Card>

      {/* Block 2: Learning track */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-stone-700">Учебный трек</span>
          <span className="text-xs text-stone-400">
            {studentTopics.length > 0 ? `${studentTopics.length} тем` : 'нет тем'}
          </span>
        </CardHeader>
        <CardContent>
          <TrackSection
            studentId={id}
            studentTopics={studentTopics}
            addAction={addTopicToStudent}
            removeAction={removeTopicFromStudent}
            updateStatusAction={updateTopicStatus}
          />
        </CardContent>
      </Card>

      {/* Block 3: Notes */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-stone-700">Заметки</span>
        </CardHeader>
        <CardContent>
          <NotesSection
            studentId={id}
            defaultNotes={student.notes ?? ''}
            action={updateStudentNotes}
          />
        </CardContent>
      </Card>
    </div>
  )
}
