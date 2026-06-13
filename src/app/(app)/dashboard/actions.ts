'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createTask(title: string) {
  const t = title.trim()
  if (!t) return
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert({ title: t })
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function completeTask(id: string) {
  const supabase = await createClient()
  await supabase.from('tasks').update({ is_done: true }).eq('id', id)
  revalidatePath('/')
}

export async function createStudentQuick(formData: FormData) {
  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const level = (formData.get('level') as string)?.trim() || null
  if (!name) throw new Error('Укажите имя ученика')
  const { error } = await supabase
    .from('students')
    .insert({ name, level, contacts: {} })
  if (error) throw new Error(error.message)
  revalidatePath('/students')
  revalidatePath('/')
}

export async function setStudentEmoji(studentId: string, emoji: string | null) {
  const supabase = await createClient()
  await supabase
    .from('students')
    .update({ avatar_emoji: emoji })
    .eq('id', studentId)
  revalidatePath(`/students/${studentId}`)
  revalidatePath('/students')
}
