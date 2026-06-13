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
