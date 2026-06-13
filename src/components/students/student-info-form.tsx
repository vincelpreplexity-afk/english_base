'use client'

import { useTransition, useState } from 'react'
import { Input } from '@/components/ui/input'

interface StudentInfoFormProps {
  studentId: string
  defaultName: string
  defaultLevel: string
  defaultPhone: string
  defaultEmail: string
  defaultTelegram: string
  action: (studentId: string, formData: FormData) => Promise<void>
}

export function StudentInfoForm({
  studentId,
  defaultName,
  defaultLevel,
  defaultPhone,
  defaultEmail,
  defaultTelegram,
  action,
}: StudentInfoFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Имя"
          name="name"
          defaultValue={defaultName}
          required
        />
        <Input
          label="Уровень"
          name="level"
          defaultValue={defaultLevel}
          placeholder="B1, Upper-Intermediate…"
        />
      </div>

      <div className="border-t border-stone-100 pt-4">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
          Контакты
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Telegram"
            name="telegram"
            defaultValue={defaultTelegram}
            placeholder="@username"
          />
          <Input
            label="Телефон"
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            placeholder="+7 900 000 00 00"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="ivan@example.com"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
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
