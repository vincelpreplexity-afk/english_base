'use server'

import { cookies } from 'next/headers'

export type LoginResult = { ok: true } | { ok: false; error: string }

export async function login(formData: FormData): Promise<LoginResult> {
  const password = formData.get('password')

  if (
    typeof password !== 'string' ||
    password !== process.env.SITE_PASSWORD
  ) {
    return { ok: false, error: 'Неверный пароль' }
  }

  const cookieStore = await cookies()
  cookieStore.set('site-auth', process.env.SITE_AUTH_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { ok: true }
}
