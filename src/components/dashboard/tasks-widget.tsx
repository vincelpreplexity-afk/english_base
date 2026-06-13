'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTask, completeTask } from '@/app/(app)/dashboard/actions'

type Task = { id: string; title: string; is_done: boolean }

const INPUT_CLS =
  'w-full px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none border-b border-stone-100 focus:border-accent transition-colors'

export function TasksWidget({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial)
  const [input, setInput] = useState('')
  const [, startTransition] = useTransition()
  const router = useRouter()
  const counter = useRef(0)

  useEffect(() => { setTasks(initial) }, [initial])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const val = input.trim()
    if (!val) return
    setInput('')
    const tempId = `tmp-${++counter.current}`
    setTasks(prev => [...prev, { id: tempId, title: val, is_done: false }])
    startTransition(async () => {
      await createTask(val)
      router.refresh()
    })
  }

  function handleComplete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (!id.startsWith('tmp-')) {
      startTransition(async () => {
        await completeTask(id)
        router.refresh()
      })
    }
  }

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Добавить задачу… (Enter)"
        className={INPUT_CLS}
      />
      {tasks.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-stone-400">Задач нет</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {tasks.map(t => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleComplete(t.id)}
                className="size-4 rounded border-stone-300 accent-accent cursor-pointer shrink-0"
              />
              <span className="text-sm text-stone-800 min-w-0 truncate">{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
