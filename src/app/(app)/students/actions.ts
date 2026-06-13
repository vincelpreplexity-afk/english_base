'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createStudent(formData: FormData) {
  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const level = (formData.get('level') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || ''
  const telegram = (formData.get('telegram') as string)?.trim() || ''

  if (!name) return

  const contacts: Record<string, string> = {}
  if (phone) contacts.phone = phone
  if (email) contacts.email = email
  if (telegram) contacts.telegram = telegram

  const { data, error } = await supabase
    .from('students')
    .insert({ name, level, contacts })
    .select('id')
    .single()

  if (error || !data) throw new Error('Не удалось создать ученика')

  redirect(`/students/${data.id}`)
}

export async function updateStudentInfo(studentId: string, formData: FormData) {
  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const level = (formData.get('level') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || ''
  const telegram = (formData.get('telegram') as string)?.trim() || ''

  if (!name) return

  const contacts: Record<string, string> = {}
  if (phone) contacts.phone = phone
  if (email) contacts.email = email
  if (telegram) contacts.telegram = telegram

  await supabase
    .from('students')
    .update({ name, level, contacts })
    .eq('id', studentId)

  revalidatePath(`/students/${studentId}`)
  revalidatePath('/students')
}

export async function archiveStudent(studentId: string) {
  const supabase = await createClient()
  await supabase
    .from('students')
    .update({ is_archived: true })
    .eq('id', studentId)

  revalidatePath('/students')
  redirect('/students')
}

export async function addTopicToStudent(
  studentId: string,
  topicTitle: string,
  status: 'planned' | 'in_progress' | 'done'
) {
  const supabase = await createClient()
  const title = topicTitle.trim()
  if (!title) return

  const { data: existing } = await supabase
    .from('topics')
    .select('id')
    .ilike('title', title)
    .limit(1)
    .maybeSingle()

  let topicId: string
  if (existing) {
    topicId = existing.id
  } else {
    const { data: created, error } = await supabase
      .from('topics')
      .insert({ title })
      .select('id')
      .single()
    if (error || !created) return
    topicId = created.id
  }

  await supabase
    .from('student_topics')
    .upsert(
      { student_id: studentId, topic_id: topicId, status },
      { onConflict: 'student_id,topic_id' }
    )

  revalidatePath(`/students/${studentId}`)
}

export async function removeTopicFromStudent(studentTopicId: string, studentId: string) {
  const supabase = await createClient()
  await supabase.from('student_topics').delete().eq('id', studentTopicId)
  revalidatePath(`/students/${studentId}`)
}

export async function updateTopicStatus(
  studentTopicId: string,
  newStatus: 'planned' | 'in_progress' | 'done',
  studentId: string
) {
  const supabase = await createClient()
  await supabase
    .from('student_topics')
    .update({ status: newStatus })
    .eq('id', studentTopicId)
  revalidatePath(`/students/${studentId}`)
}

export async function updateStudentNotes(studentId: string, formData: FormData) {
  const supabase = await createClient()
  const notes = (formData.get('notes') as string) || null
  await supabase.from('students').update({ notes }).eq('id', studentId)
  revalidatePath(`/students/${studentId}`)
}
