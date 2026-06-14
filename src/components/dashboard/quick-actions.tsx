'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from '@phosphor-icons/react'
import { createStudentQuick } from '@/app/(app)/dashboard/actions'
import { createLesson } from '@/app/(app)/schedule/actions'
import AddMaterialModal from '@/components/materials/add-material-modal'
import { mskTodayDateString } from '@/lib/time'
import { useScrollLock } from '@/lib/use-scroll-lock'

type Student = { id: string; name: string }

type Props = {
  students: Student[]
  materialCategories: string[]
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const BTN =
  'flex items-center gap-2 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors text-left'

const INPUT_CLS =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

function today() {
  return mskTodayDateString()
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useScrollLock()
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
          <h2 className="font-heading font-semibold text-stone-900 text-base">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AddStudentModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createStudentQuick(fd)
        router.refresh()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка')
      }
    })
  }

  return (
    <Modal title="Новый ученик" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Имя *</label>
          <input name="name" required placeholder="Имя ученика" className={INPUT_CLS} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Уровень</label>
          <select name="level" className={INPUT_CLS} defaultValue="">
            <option value="">Не указан</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
            Отмена
          </button>
          <button type="submit"
            className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            Добавить
          </button>
        </div>
      </form>
    </Modal>
  )
}

function AddLessonModal({ students, onClose }: { students: Student[]; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const studentId = fd.get('studentId') as string
    const date = fd.get('date') as string
    const startTime = fd.get('startTime') as string
    const endTime = fd.get('endTime') as string
    if (!studentId || !date || !startTime || !endTime) {
      setError('Заполните все поля')
      return
    }
    const startAt = `${date}T${startTime}:00`
    const endAt = `${date}T${endTime}:00`
    startTransition(async () => {
      try {
        await createLesson(studentId, startAt, endAt)
        router.refresh()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка')
      }
    })
  }

  return (
    <Modal title="Новый урок" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Ученик *</label>
          <select name="studentId" required className={INPUT_CLS} defaultValue="">
            <option value="" disabled>Выберите ученика</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Дата *</label>
          <input name="date" type="date" required defaultValue={today()} className={INPUT_CLS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Начало *</label>
            <input name="startTime" type="time" required defaultValue="10:00" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Конец *</label>
            <input name="endTime" type="time" required defaultValue="11:00" className={INPUT_CLS} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
            Отмена
          </button>
          <button type="submit"
            className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            Добавить
          </button>
        </div>
      </form>
    </Modal>
  )
}

type ModalType = 'student' | 'lesson' | 'material' | null

export function QuickActions({ students, materialCategories }: Props) {
  const [open, setOpen] = useState<ModalType>(null)
  const close = () => setOpen(null)

  return (
    <div className="flex flex-col gap-2">
      <button className={BTN} onClick={() => setOpen('student')}>
        <span>👤</span> Добавить ученика
      </button>
      <button className={BTN} onClick={() => setOpen('lesson')}>
        <span>📅</span> Запланировать урок
      </button>
      <button className={BTN} onClick={() => setOpen('material')}>
        <span>📎</span> Добавить материал
      </button>

      {open === 'student' && <AddStudentModal onClose={close} />}
      {open === 'lesson' && <AddLessonModal students={students} onClose={close} />}
      {open === 'material' && (
        <AddMaterialModal categories={materialCategories} onClose={close} />
      )}
    </div>
  )
}
