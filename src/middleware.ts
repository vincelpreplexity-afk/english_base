import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_COOKIE = 'site-auth'
const LOGIN_PATH = '/login'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Password guard — skip for login page itself
  if (pathname !== LOGIN_PATH) {
    const authCookie = request.cookies.get(AUTH_COOKIE)
    if (!authCookie || authCookie.value !== process.env.SITE_AUTH_SECRET) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }
  }

  // Supabase session refresh
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '').map(
            ({ name, value }) => ({ name, value: value ?? '' })
          )
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
