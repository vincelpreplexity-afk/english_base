'use client'

import { SignOut } from '@phosphor-icons/react'

interface LogoutButtonProps {
  action: () => Promise<void>
}

export function LogoutButton({ action }: LogoutButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <SignOut size={16} aria-hidden />
        Выйти
      </button>
    </form>
  )
}
