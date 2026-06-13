import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NavLinks } from '@/components/layout/nav-links'
import { LogoutButton } from '@/components/layout/logout-button'

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
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="px-5 py-4 border-b border-stone-200">
          <span className="font-heading text-[13px] font-semibold tracking-tight text-stone-900">
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

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <NavLinks mobile />
    </div>
  )
}
