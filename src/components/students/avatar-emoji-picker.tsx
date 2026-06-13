'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { setStudentEmoji } from '@/app/(app)/dashboard/actions'

const EMOJIS = [
  '😊','😄','🤩','😎','🥳','🤓','🧐','😴',
  '🐱','🐶','🦊','🐻','🦉','🐬','🦋','🐼',
  '⭐','🌟','🔥','🌈','🎯','🏆','💎','🚀',
]

type Props = {
  studentId: string
  emoji: string | null
  fallbackInitial: string
}

export function AvatarEmojiPicker({ studentId, emoji, fallbackInitial }: Props) {
  const [current, setCurrent] = useState(emoji)
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function select(e: string | null) {
    setCurrent(e)
    setOpen(false)
    startTransition(() => setStudentEmoji(studentId, e))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Изменить аватарку"
        className="size-12 rounded-full bg-accent-subtle flex items-center justify-center hover:ring-2 hover:ring-accent/30 transition-all cursor-pointer shrink-0"
      >
        {current ? (
          <span className="text-2xl leading-none">{current}</span>
        ) : (
          <span className="text-lg font-semibold text-accent">{fallbackInitial}</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-stone-200 rounded-xl shadow-lg p-3 w-60">
          <p className="text-xs font-medium text-stone-500 mb-2">Выберите эмодзи</p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map(em => (
              <button
                key={em}
                onClick={() => select(em)}
                className={`text-xl leading-none p-1 rounded-md hover:bg-accent-subtle transition-colors ${current === em ? 'bg-accent-subtle ring-1 ring-accent/40' : ''}`}
              >
                {em}
              </button>
            ))}
          </div>
          {current && (
            <button
              onClick={() => select(null)}
              className="mt-2 w-full text-xs text-stone-400 hover:text-red-500 transition-colors py-1"
            >
              Убрать аватарку
            </button>
          )}
        </div>
      )}
    </div>
  )
}
