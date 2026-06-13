'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createLesson(
  studentId: string,
  startAt: string,
  endAt: string,
  notes?: string
) {
  const supabase = await createClient()
  const duration = Math.max(
    1,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
  )

  const { error } = await supabase.from('lessons').insert({
    student_id: studentId,
    scheduled_at: new Date(startAt).toISOString(),
    duration_min: duration,
    status: 'scheduled',
    notes: notes?.trim() || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/schedule')
}

export async function createRecurringLessons(
  studentId: string,
  startAt: string,
  endAt: string,
  untilDate: string,
  notes?: string
) {
  const supabase = await createClient()
  const startD = new Date(startAt)
  const endD = new Date(endAt)
  const until = new Date(`${untilDate}T23:59:59`)
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000
  const MAX_LESSONS = 52

  const rows = []
  let s = startD
  let e = endD

  while (s <= until && rows.length < MAX_LESSONS) {
    const duration = Math.max(1, Math.round((e.getTime() - s.getTime()) / 60000))
    rows.push({
      student_id: studentId,
      scheduled_at: s.toISOString(),
      duration_min: duration,
      status: 'scheduled',
      notes: notes?.trim() || null,
    })
    s = new Date(s.getTime() + WEEK_MS)
    e = new Date(e.getTime() + WEEK_MS)
  }

  if (rows.length === 0) throw new Error('Нет занятий для создания')
  const { error } = await supabase.from('lessons').insert(rows)
  if (error) throw new Error(error.message)
  revalidatePath('/schedule')
}

export async function updateLesson(
  lessonId: string,
  startAt: string,
  endAt: string
) {
  const supabase = await createClient()
  const duration = Math.max(
    1,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
  )

  await supabase
    .from('lessons')
    .update({
      scheduled_at: new Date(startAt).toISOString(),
      duration_min: duration,
    })
    .eq('id', lessonId)

  revalidatePath('/schedule')
}

export async function cancelLesson(lessonId: string) {
  const supabase = await createClient()
  await supabase
    .from('lessons')
    .update({ status: 'cancelled' })
    .eq('id', lessonId)

  revalidatePath('/schedule')
}

export async function toggleLessonPaid(lessonId: string, isPaid: boolean) {
  const supabase = await createClient()
  await supabase
    .from('lessons')
    .update({ is_paid: isPaid })
    .eq('id', lessonId)

  revalidatePath('/schedule')
  revalidatePath('/')
}
