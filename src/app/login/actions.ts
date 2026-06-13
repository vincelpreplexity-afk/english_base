'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password')

  if (
    typeof password !== 'string' ||
    password !== process.env.SITE_PASSWORD
  ) {
    redirect('/login?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set('site-auth', process.env.SITE_AUTH_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect('/')
}
