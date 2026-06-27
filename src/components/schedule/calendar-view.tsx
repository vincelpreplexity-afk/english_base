'use client'

import { useState, useMemo, useCallback, useEffect, useTransition } from 'react'
import { Calendar, dateFnsLocalizer, type View, type SlotInfo } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMinutes, addWeeks } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { CaretLeft, CaretRight, X, Trash, Check, ArrowCounterClockwise } from '@phosphor-icons/react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import {
  createLesson,
  createRecurringLessons,
  updateLesson,
  cancelLesson,
  completeLesson,
  reopenLesson,
  toggleLessonPaid,
} from '@/app/(app)/schedule/actions'
import { Button } from '@/components/ui/button'
import { useScrollLock } from '@/lib/use-scroll-lock'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Lesson = {
  id: string
  student_id: string
  scheduled_at: string
  duration_min: number
  status: LessonStatus
  notes: string | null
  is_paid: boolean
  // Many-to-one FK (lessons.student_id → students) → PostgREST returns a
  // single object here, not an array, despite what supabase-js infers.
  students: { name: string } | null
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'cancelled_late'

type Student = { id: string; name: string; level: string | null }

type CalEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: { studentId: string; status: LessonStatus; notes: string | null; isPaid: boolean }
}

// ─── Localizer ───────────────────────────────────────────────────────────────

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: { ru },
})

const messages = {
  allDay: 'Весь день',
  previous: '‹',
  next: '›',
  today: 'Сегодня',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Список',
  date: 'Дата',
  time: 'Время',
  event: 'Занятие',
  noEventsInRange: 'Нет занятий',
  showMore: (n: number) => `+${n} ещё`,
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function toInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toDateValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const INPUT_CLS =
  'h-9 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-900 ' +
  'outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15'

// ─── Custom Toolbar ───────────────────────────────────────────────────────────

type NavAction = 'PREV' | 'NEXT' | 'TODAY' | 'DATE'

interface ToolbarProps {
  label: string
  view: View
  onNavigate: (action: NavAction) => void
  onView: (view: View) => void
}

function Toolbar({ label, view, onNavigate, onView }: ToolbarProps) {
  const views: { key: View; ru: string }[] = [
    { key: 'month', ru: 'Месяц' },
    { key: 'week', ru: 'Неделя' },
    { key: 'day', ru: 'День' },
  ]

  return (
    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={() => onNavigate('TODAY')}
          className="h-10 px-3 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Сегодня
        </button>
        <button
          onClick={() => onNavigate('PREV')}
          aria-label="Назад"
          className="size-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <CaretLeft size={14} weight="bold" />
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          aria-label="Вперёд"
          className="size-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <CaretRight size={14} weight="bold" />
        </button>
        <span className="text-sm font-medium text-stone-900 ml-1 truncate capitalize">
          {label}
        </span>
      </div>

      <div className="flex rounded-lg border border-stone-200 overflow-hidden shrink-0">
        {views.map(({ key, ru: label }) => (
          <button
            key={key}
            onClick={() => onView(key)}
            className={`h-10 px-3 text-xs font-medium transition-colors border-r border-stone-200 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 ${
              view === key
                ? 'bg-accent text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useScrollLock()
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full sm:w-[420px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 sticky top-0 bg-white rounded-t-2xl sm:rounded-t-2xl">
          <h2 className="font-heading text-base font-semibold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="size-10 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({
  start,
  end,
  students,
  onClose,
  onDone,
}: {
  start: Date
  end: Date
  students: Student[]
  onClose: () => void
  onDone: () => void
}) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [startVal, setStartVal] = useState(toInputValue(start))
  const [endVal, setEndVal] = useState(toInputValue(end))
  const [notes, setNotes] = useState('')
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  // Default the "until" date 4 weeks out so checking "repeat weekly" actually
  // produces a series. Defaulting to the start day would yield a single lesson
  // (next occurrence already exceeds `until`), which looks like the feature is
  // broken. Only read when repeatWeekly is true, so harmless when unchecked.
  const [untilDate, setUntilDate] = useState(toDateValue(addWeeks(start, 4)))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId) { setError('Выберите ученика'); return }
    if (new Date(endVal) <= new Date(startVal)) {
      setError('Время окончания должно быть позже начала')
      return
    }
    if (repeatWeekly && !untilDate) {
      setError('Укажите дату окончания повторений')
      return
    }
    if (repeatWeekly && new Date(untilDate) < new Date(startVal.split('T')[0])) {
      setError('Дата окончания не может быть раньше начала')
      return
    }
    setPending(true)
    setError('')
    try {
      if (repeatWeekly) {
        await createRecurringLessons(studentId, startVal, endVal, untilDate, notes)
      } else {
        await createLesson(studentId, startVal, endVal, notes)
      }
      onDone()
      onClose()
    } catch {
      setError('Не удалось сохранить занятие')
      setPending(false)
    }
  }

  return (
    <Modal title="Новое занятие" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-stone-600 block">Ученик</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={INPUT_CLS}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.level ? ` — ${s.level}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 block">Начало</label>
            <input
              type="datetime-local"
              value={startVal}
              onChange={(e) => setStartVal(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 block">Конец</label>
            <input
              type="datetime-local"
              value={endVal}
              onChange={(e) => setEndVal(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-stone-600 block">
            Заметка <span className="text-stone-400 font-normal">(необязательно)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Тема урока, задание..."
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 resize-none placeholder:text-stone-400"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={repeatWeekly}
            onChange={(e) => setRepeatWeekly(e.target.checked)}
            className="size-4 rounded border-stone-300 text-accent accent-[--color-accent] cursor-pointer"
          />
          <span className="text-sm text-stone-700">Повторять еженедельно</span>
        </label>

        {repeatWeekly && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 block">До какой даты</label>
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
              min={startVal.split('T')[0]}
              className={INPUT_CLS}
              required={repeatWeekly}
            />
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? 'Сохранение…' : repeatWeekly ? 'Создать серию' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<LessonStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Запланирован', cls: 'bg-stone-100 text-stone-600' },
  completed: { label: 'Проведён', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменён', cls: 'bg-stone-100 text-stone-500' },
  cancelled_late: { label: 'Поздняя отмена · оплачивается', cls: 'bg-amber-100 text-amber-700' },
}

function StatusBadge({ status }: { status: LessonStatus }) {
  const b = STATUS_BADGE[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${b.cls}`}>
      {b.label}
    </span>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

type BusyAction = 'complete' | 'cancel' | 'cancel_late' | 'reopen'

function EditModal({
  event,
  onClose,
  onDone,
}: {
  event: CalEvent
  onClose: () => void
  onDone: () => void
}) {
  const status = event.resource.status
  const [startVal, setStartVal] = useState(toInputValue(event.start))
  const [endVal, setEndVal] = useState(toInputValue(event.end))
  const [isPaid, setIsPaid] = useState(event.resource.isPaid)
  const [pending, setPending] = useState(false)
  const [busy, setBusy] = useState<BusyAction | null>(null)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const locked = pending || busy !== null

  function handleTogglePaid() {
    const next = !isPaid
    setIsPaid(next)
    startTransition(() => toggleLessonPaid(event.id, next))
  }

  // Run a lifecycle transition (complete / cancel / cancel_late / reopen),
  // then refresh and close on success.
  async function runAction(kind: BusyAction, fn: () => Promise<void>) {
    setBusy(kind)
    setError('')
    try {
      await fn()
      onDone()
      onClose()
    } catch {
      setError('Не удалось выполнить действие')
      setBusy(null)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (new Date(endVal) <= new Date(startVal)) {
      setError('Время окончания должно быть позже начала')
      return
    }
    setPending(true)
    setError('')
    try {
      await updateLesson(event.id, startVal, endVal)
      onDone()
      onClose()
    } catch {
      setError('Не удалось обновить занятие')
      setPending(false)
    }
  }

  const paidToggle = (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={isPaid}
        onChange={handleTogglePaid}
        className="size-4 rounded border-stone-300 cursor-pointer accent-[--color-accent]"
      />
      <span className="text-sm text-stone-700">Оплачено</span>
      {isPaid && <span className="text-xs text-green-600 font-medium">✓</span>}
    </label>
  )

  const notesBlock = event.resource.notes && (
    <p className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 leading-relaxed">
      {event.resource.notes}
    </p>
  )

  // ── Settled lesson (completed / cancelled / cancelled_late): read-only
  //    summary + a way back to "scheduled" to undo a mis-click. ──────────────
  if (status !== 'scheduled') {
    return (
      <Modal title={event.title} onClose={onClose}>
        <div className="space-y-4">
          <StatusBadge status={status} />
          <p className="text-sm text-stone-600">
            {format(event.start, 'EEEE, d MMMM, HH:mm', { locale: ru })
              .replace(/^./, (c) => c.toUpperCase())}
            {' – '}
            {format(event.end, 'HH:mm', { locale: ru })}
          </p>
          {notesBlock}
          {paidToggle}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => runAction('reopen', () => reopenLesson(event.id))}
              disabled={locked}
            >
              <ArrowCounterClockwise size={13} />
              {busy === 'reopen' ? '…' : 'Вернуть в запланированные'}
            </Button>
            <div className="flex-1" />
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={locked}>
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // ── Scheduled lesson: edit time (= reschedule on Save) + lifecycle actions ──
  return (
    <Modal title={event.title} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 block">Начало</label>
            <input
              type="datetime-local"
              value={startVal}
              onChange={(e) => setStartVal(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 block">Конец</label>
            <input
              type="datetime-local"
              value={endVal}
              onChange={(e) => setEndVal(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
        </div>

        {notesBlock}
        {paidToggle}

        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* Lifecycle actions */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            className="w-full"
            size="md"
            onClick={() => runAction('complete', () => completeLesson(event.id))}
            disabled={locked}
          >
            <Check size={15} weight="bold" />
            {busy === 'complete' ? '…' : 'Провести'}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => runAction('cancel_late', () => cancelLesson(event.id, true))}
              disabled={locked}
            >
              {busy === 'cancel_late' ? '…' : 'Поздняя отмена'}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => runAction('cancel', () => cancelLesson(event.id, false))}
              disabled={locked}
            >
              <Trash size={13} />
              {busy === 'cancel' ? '…' : 'Отменить'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
          <p className="text-xs text-stone-400 flex-1 leading-tight">
            Изменили время — сохраните перенос
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={locked}>
            Закрыть
          </Button>
          <Button type="submit" size="sm" disabled={locked}>
            {pending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CalendarView({
  lessons,
  students,
}: {
  lessons: Lesson[]
  students: Student[]
}) {
  const router = useRouter()
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [createSlot, setCreateSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null)

  // Default to day view on narrow screens
  useEffect(() => {
    if (window.innerWidth < 1024) setView('day')
  }, [])

  const events = useMemo<CalEvent[]>(
    () =>
      lessons.map((l) => ({
        id: l.id,
        title: `${l.status === 'completed' ? '✓ ' : ''}${l.students?.name ?? 'Ученик'}`,
        start: new Date(l.scheduled_at),
        end: addMinutes(new Date(l.scheduled_at), l.duration_min),
        resource: {
          studentId: l.student_id,
          status: l.status,
          notes: l.notes,
          isPaid: l.is_paid,
        },
      })),
    [lessons]
  )

  const handleSelectSlot = useCallback(
    (slot: SlotInfo) => {
      if (students.length === 0) return
      let { start, end } = slot
      // Month view gives midnight–midnight; normalise to 10:00–11:00
      if (start.getHours() === 0 && start.getMinutes() === 0) {
        start = new Date(start)
        start.setHours(10, 0, 0, 0)
        end = new Date(start)
        end.setHours(11, 0, 0, 0)
      } else if (end.getTime() - start.getTime() < 60000) {
        end = addMinutes(start, 60)
      }
      setCreateSlot({ start, end })
    },
    [students.length]
  )

  const handleSelectEvent = useCallback((event: object) => {
    setEditEvent(event as CalEvent)
  }, [])

  const handleDone = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <div className="flex flex-col h-full">
      {students.length === 0 && (
        <p className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Добавьте хотя бы одного ученика, чтобы планировать занятия
        </p>
      )}

      <div className="flex-1 min-h-0 rbc-wrap">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(d) => setDate(d)}
          selectable={students.length > 0}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          culture="ru"
          messages={messages}
          style={{ height: '100%' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          components={{ toolbar: Toolbar as any }}
          eventPropGetter={(event) => {
            const ev = event as CalEvent
            const bg = ev.resource.isPaid ? '#3B7A57' : '#5C3D6C'
            const style: React.CSSProperties = {
              backgroundColor: bg,
              borderColor: bg,
              color: '#fff',
              borderRadius: '6px',
              fontSize: '12px',
              border: 'none',
            }
            // Completed: muted so "done" reads differently from "upcoming".
            // Late cancellation: still on the calendar (billable) but amber +
            // struck-through to signal the lesson didn't actually happen.
            if (ev.resource.status === 'completed') {
              style.opacity = 0.5
            } else if (ev.resource.status === 'cancelled_late') {
              style.backgroundColor = '#B45309'
              style.borderColor = '#B45309'
              style.opacity = 0.75
              style.textDecoration = 'line-through'
            }
            return { style }
          }}
        />
      </div>

      {createSlot && students.length > 0 && (
        <CreateModal
          start={createSlot.start}
          end={createSlot.end}
          students={students}
          onClose={() => setCreateSlot(null)}
          onDone={handleDone}
        />
      )}

      {editEvent && (
        <EditModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onDone={handleDone}
        />
      )}
    </div>
  )
}
