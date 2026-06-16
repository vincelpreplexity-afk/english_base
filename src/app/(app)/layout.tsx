import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NavLinks } from '@/components/layout/nav-links'
import { LogoutButton } from '@/components/layout/logout-button'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { PageEnter } from '@/components/layout/page-enter'

async function logout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete('site-auth')
  redirect('/login')
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh bg-stone-50">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="px-5 py-4 border-b border-stone-200">
          <span className="font-heading text-base font-semibold text-stone-900">
            English Base
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-stone-200 p-3">
          <LogoutButton action={logout} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-12 items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur-sm px-4 lg:hidden">
        <span className="font-heading text-sm font-semibold text-stone-900">
          English Base
        </span>
        <MobileMenu action={logout} />
      </div>

      {/* Page content — offset for mobile top bar */}
      <main className="flex-1 overflow-y-auto pt-12 pb-24 lg:pt-0 lg:pb-0">
        <PageEnter>{children}</PageEnter>
      </main>

      {/* Bottom nav — mobile only */}
      <NavLinks mobile />
    </div>
  )
}
