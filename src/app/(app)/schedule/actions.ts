'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { mskNaiveToDate } from '@/lib/time'

export async function createLesson(
  studentId: string,
  startAt: string,
  endAt: string,
  notes?: string
) {
  const supabase = await createClient()
  const startD = mskNaiveToDate(startAt)
  const endD = mskNaiveToDate(endAt)
  const duration = Math.max(
    1,
    Math.round((endD.getTime() - startD.getTime()) / 60000)
  )

  const { error } = await supabase.from('lessons').insert({
    student_id: studentId,
    scheduled_at: startD.toISOString(),
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
  const startD = mskNaiveToDate(startAt)
  const endD = mskNaiveToDate(endAt)
  const until = mskNaiveToDate(`${untilDate}T23:59:59`)
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
  const startD = mskNaiveToDate(startAt)
  const endD = mskNaiveToDate(endAt)
  const duration = Math.max(
    1,
    Math.round((endD.getTime() - startD.getTime()) / 60000)
  )

  await supabase
    .from('lessons')
    .update({
      scheduled_at: startD.toISOString(),
      duration_min: duration,
    })
    .eq('id', lessonId)

  revalidatePath('/schedule')
}

// Mark a lesson completed and snapshot the student's current rate onto it
// (lessons.price), so it counts toward the student's balance even if the rate
// changes later. A null rate snapshots null and is COALESCE'd to 0 in balance.
export async function completeLesson(lessonId: string) {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('student_id')
    .eq('id', lessonId)
    .single()

  let price: number | null = null
  if (lesson) {
    const { data: student } = await supabase
      .from('students')
      .select('rate')
      .eq('id', lesson.student_id)
      .single()
    price = student?.rate ?? null
  }

  await supabase
    .from('lessons')
    .update({ status: 'completed', price })
    .eq('id', lessonId)

  revalidatePath('/schedule')
  revalidatePath('/')
  if (lesson) revalidatePath(`/students/${lesson.student_id}`)
}

// Return a completed/cancelled lesson back to "scheduled" — undo a mis-click.
// Clears the price snapshot so it no longer counts toward the balance.
export async function reopenLesson(lessonId: string) {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('student_id')
    .eq('id', lessonId)
    .single()

  await supabase
    .from('lessons')
    .update({ status: 'scheduled', price: null })
    .eq('id', lessonId)

  revalidatePath('/schedule')
  revalidatePath('/')
  if (lesson) revalidatePath(`/students/${lesson.student_id}`)
}

// `late` → student cancelled < 24h. Kept visible on the calendar
// (struck-through) rather than hidden. Does not bill the balance for now.
export async function cancelLesson(lessonId: string, late = false) {
  const supabase = await createClient()
  await supabase
    .from('lessons')
    .update({ status: late ? 'cancelled_late' : 'cancelled', price: null })
    .eq('id', lessonId)

  revalidatePath('/schedule')
  revalidatePath('/')
}
