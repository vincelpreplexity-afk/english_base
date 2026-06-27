import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StudentInfoForm } from '@/components/students/student-info-form'
import { TrackSection } from '@/components/students/track-section'
import { NotesSection } from '@/components/students/notes-section'
import { AvatarEmojiPicker } from '@/components/students/avatar-emoji-picker'
import { PaymentsSection, type PaymentRow } from '@/components/students/payments-section'
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

  const [{ data: student }, { data: rawTopics }, { data: balanceRow }, { data: rawPayments }] =
    await Promise.all([
      supabase
        .from('students')
        .select('id, name, level, contacts, notes, avatar_emoji, rate')
        .eq('id', id)
        .single(),
      supabase
        .from('student_topics')
        .select('id, status, topics(title)')
        .eq('student_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('student_balances')
        .select('balance')
        .eq('student_id', id)
        .maybeSingle(),
      supabase
        .from('payments')
        .select('id, amount, note, paid_at')
        .eq('student_id', id)
        .order('paid_at', { ascending: false }),
    ])

  if (!student) notFound()

  const rate = student.rate != null ? Number(student.rate) : null
  const balance = balanceRow?.balance != null ? Number(balanceRow.balance) : 0
  const payments: PaymentRow[] = (rawPayments ?? []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    note: p.note,
    paid_at: p.paid_at,
  }))

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
        <div className="flex items-center gap-3 min-w-0">
          <AvatarEmojiPicker
            studentId={id}
            emoji={student.avatar_emoji ?? null}
            fallbackInitial={student.name.charAt(0).toUpperCase()}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href="/students"
                className="text-sm text-stone-500 hover:text-stone-700 transition-colors shrink-0"
              >
                ← Ученики
              </Link>
              <span className="text-stone-300 text-sm">/</span>
            </div>
            <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl truncate">
              {student.name}
            </h1>
          </div>
        </div>
        <form action={archiveStudent.bind(null, id)}>
          <button
            type="submit"
            className="inline-flex min-h-[40px] items-center text-xs text-stone-500 hover:text-red-600 transition-colors px-3 rounded-md hover:bg-red-50 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
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

      {/* Block 2: Payments */}
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-stone-700">Оплаты</span>
        </CardHeader>
        <CardContent>
          <PaymentsSection
            studentId={id}
            rate={rate}
            balance={balance}
            payments={payments}
          />
        </CardContent>
      </Card>

      {/* Block 3: Learning track */}
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

      {/* Block 4: Notes */}
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
