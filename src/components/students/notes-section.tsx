'use client'

import { useTransition, useState } from 'react'

interface NotesSectionProps {
  studentId: string
  defaultNotes: string
  action: (studentId: string, formData: FormData) => Promise<void>
}

export function NotesSection({ studentId, defaultNotes, action }: NotesSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSaved(false)
    startTransition(async () => {
      await action(studentId, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="notes"
        defaultValue={defaultNotes}
        rows={6}
        placeholder="Слабые места, прогресс, особенности, задания…"
        className="w-full resize-y rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 leading-relaxed"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-8 px-3 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Сохранение…' : 'Сохранить'}
        </button>
        {saved && (
          <span className="text-xs text-accent">Сохранено</span>
        )}
      </div>
    </form>
  )
}
