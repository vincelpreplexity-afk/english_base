import { NextResponse, type NextRequest } from 'next/server'

const AUTH_COOKIE = 'site-auth'
const LOGIN_PATH = '/login'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname !== LOGIN_PATH) {
    const authCookie = request.cookies.get(AUTH_COOKIE)
    if (!authCookie || authCookie.value !== process.env.SITE_AUTH_SECRET) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
