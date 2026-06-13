'use client'

import { useState } from 'react'
import { DotsThree, X, SignOut } from '@phosphor-icons/react'

interface MobileMenuProps {
  action: () => Promise<void>
}

export function MobileMenu({ action }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {open ? <X size={18} /> : <DotsThree size={20} weight="bold" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-10 z-20 min-w-[160px] rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
            <form action={action}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <SignOut size={15} aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
