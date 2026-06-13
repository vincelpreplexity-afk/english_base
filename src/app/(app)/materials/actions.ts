'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()

  const title = (formData.get('title') as string).trim()
  const category = (formData.get('category') as string | null)?.trim() || null
  const level = (formData.get('level') as string | null) || null
  const inputType = formData.get('inputType') as 'file' | 'link'
  const externalUrl = (formData.get('externalUrl') as string | null)?.trim() || null
  const file = formData.get('file') as File | null

  if (!title) throw new Error('Название обязательно')

  let url: string | null = null
  let type: 'file' | 'link' = 'link'

  if (inputType === 'file' && file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const key = `${crypto.randomUUID()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(key, buf, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    url = key
    type = 'file'
  } else if (inputType === 'link' && externalUrl) {
    url = externalUrl
    type = 'link'
  } else {
    throw new Error('Укажите файл или ссылку')
  }

  const { error } = await supabase.from('materials').insert({
    title,
    category,
    level,
    type,
    url,
    description: null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/materials')
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()

  const { data, error: fetchError } = await supabase
    .from('materials')
    .select('type, url')
    .eq('id', id)
    .single()

  if (fetchError || !data) throw new Error('Материал не найден')

  if (data.type === 'file' && data.url) {
    const { error: removeError } = await supabase.storage
      .from('materials')
      .remove([data.url])
    if (removeError) throw new Error(removeError.message)
  }

  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/materials')
}
