'use client'

import { useTransition, useState, useRef } from 'react'
import { X, Plus, ArrowRight, ArrowLeft } from '@phosphor-icons/react'

type TopicStatus = 'planned' | 'in_progress' | 'done'

interface StudentTopic {
  id: string
  status: TopicStatus
  topicTitle: string
}

interface TrackSectionProps {
  studentId: string
  studentTopics: StudentTopic[]
  addAction: (studentId: string, topicTitle: string, status: TopicStatus) => Promise<void>
  removeAction: (studentTopicId: string, studentId: string) => Promise<void>
  updateStatusAction: (studentTopicId: string, newStatus: TopicStatus, studentId: string) => Promise<void>
}

const COLUMNS: { status: TopicStatus; label: string; color: string }[] = [
  { status: 'planned', label: 'Запланировано', color: 'text-stone-500' },
  { status: 'in_progress', label: 'В процессе', color: 'text-amber-600' },
  { status: 'done', label: 'Пройдено', color: 'text-accent' },
]

const NEXT_STATUS: Record<TopicStatus, TopicStatus> = {
  planned: 'in_progress',
  in_progress: 'done',
  done: 'planned',
}

const PREV_STATUS: Record<TopicStatus, TopicStatus> = {
  planned: 'done',
  in_progress: 'planned',
  done: 'in_progress',
}

export function TrackSection({
  studentId,
  studentTopics,
  addAction,
  removeAction,
  updateStatusAction,
}: TrackSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [addingIn, setAddingIn] = useState<TopicStatus | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = (status: TopicStatus) => {
    const title = newTitle.trim()
    if (!title) return
    setNewTitle('')
    setAddingIn(null)
    startTransition(async () => {
      await addAction(studentId, title, status)
    })
  }

  const handleRemove = (id: string) => {
    startTransition(async () => {
      await removeAction(id, studentId)
    })
  }

  const handleMove = (id: string, newStatus: TopicStatus) => {
    startTransition(async () => {
      await updateStatusAction(id, newStatus, studentId)
    })
  }

  const openAdd = (status: TopicStatus) => {
    setAddingIn(status)
    setNewTitle('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map(({ status, label, color }) => {
        const items = studentTopics.filter((t) => t.status === status)
        const isAdding = addingIn === status

        return (
          <div
            key={status}
            className="flex flex-col gap-2 rounded-xl bg-stone-50 border border-stone-200 p-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
                {label}
              </span>
              <span className="text-xs text-stone-400">{items.length}</span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1.5 min-h-[2rem]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-1.5 rounded-lg bg-white border border-stone-200 px-2.5 py-2"
                >
                  <span className="flex-1 text-xs text-stone-700 leading-snug break-words min-w-0">
                    {item.topicTitle}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {status !== 'planned' && (
                      <button
                        onClick={() => handleMove(item.id, PREV_STATUS[status])}
                        disabled={isPending}
                        title="Переместить назад"
                        className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer disabled:opacity-40 rounded"
                      >
                        <ArrowLeft size={12} weight="bold" />
                      </button>
                    )}
                    {status !== 'done' && (
                      <button
                        onClick={() => handleMove(item.id, NEXT_STATUS[status])}
                        disabled={isPending}
                        title="Переместить вперёд"
                        className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer disabled:opacity-40 rounded"
                      >
                        <ArrowRight size={12} weight="bold" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isPending}
                      title="Удалить"
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 rounded"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty column hint */}
              {items.length === 0 && !isAdding && (
                <p className="text-xs text-stone-400 italic px-1">Пусто</p>
              )}
            </div>

            {/* Add form */}
            {isAdding ? (
              <div className="flex flex-col gap-1.5">
                <input
                  ref={inputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd(status)
                    if (e.key === 'Escape') {
                      setAddingIn(null)
                      setNewTitle('')
                    }
                  }}
                  placeholder="Название темы…"
                  className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAdd(status)}
                    disabled={!newTitle.trim() || isPending}
                    className="flex-1 h-7 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => {
                      setAddingIn(null)
                      setNewTitle('')
                    }}
                    className="h-7 px-2 text-xs text-stone-500 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAdd(status)}
                disabled={isPending}
                className="flex items-center gap-1 h-7 px-2 text-xs text-stone-500 hover:text-stone-700 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 border border-transparent hover:border-stone-200"
              >
                <Plus size={12} weight="bold" />
                Добавить
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
