'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SquaresFour,
  GraduationCap,
  CalendarDots,
  BookOpen,
} from '@phosphor-icons/react'

const links = [
  { href: '/', label: 'Дашборд', Icon: SquaresFour },
  { href: '/students', label: 'Ученики', Icon: GraduationCap },
  { href: '/schedule', label: 'Расписание', Icon: CalendarDots },
  { href: '/materials', label: 'Материалы', Icon: BookOpen },
]

export function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t border-stone-200 bg-white lg:hidden">
        {links.map(({ href, label, Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                active
                  ? 'text-accent'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Icon
                size={20}
                weight={active ? 'fill' : 'regular'}
                aria-hidden
              />
              {label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Навигация">
      {links.map(({ href, label, Icon }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent-subtle text-accent'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Icon size={16} weight={active ? 'fill' : 'regular'} aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
