'use client'

import { useRef, useState, useTransition } from 'react'
import { X } from '@phosphor-icons/react'
import { createMaterial } from '@/app/(app)/materials/actions'
import { useScrollLock } from '@/lib/use-scroll-lock'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

const INPUT_CLS =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

type Props = {
  categories: string[]
  onClose: () => void
}

export default function AddMaterialModal({ categories, onClose }: Props) {
  useScrollLock()
  const formRef = useRef<HTMLFormElement>(null)
  const [inputType, setInputType] = useState<'file' | 'link'>('file')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const form = formRef.current!
    const fd = new FormData(form)
    fd.set('inputType', inputType)

    startTransition(async () => {
      try {
        await createMaterial(fd)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
          <h2 className="font-heading font-semibold text-stone-900 text-base">Новый материал</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Название *</label>
            <input name="title" required placeholder="Название материала" className={INPUT_CLS} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Категория</label>
            <input
              name="category"
              list="category-list"
              placeholder="Грамматика, Лексика, ..."
              className={INPUT_CLS}
            />
            <datalist id="category-list">
              {categories.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Уровень</label>
            <select name="level" className={INPUT_CLS} defaultValue="">
              <option value="">Без уровня</option>
              {LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* File or Link toggle */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-2">Тип</label>
            <div className="flex rounded-lg border border-stone-200 overflow-hidden text-sm font-medium">
              <button
                type="button"
                onClick={() => setInputType('file')}
                className={`flex-1 py-2 transition-colors ${
                  inputType === 'file'
                    ? 'bg-accent text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Файл
              </button>
              <button
                type="button"
                onClick={() => setInputType('link')}
                className={`flex-1 py-2 transition-colors border-l border-stone-200 ${
                  inputType === 'link'
                    ? 'bg-accent text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Ссылка
              </button>
            </div>
          </div>

          {inputType === 'file' ? (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Файл *</label>
              <input
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.ppt,.pptx"
                required
                className="w-full text-sm text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer"
              />
              <p className="mt-1 text-xs text-stone-400">PDF, изображение, Word, PowerPoint — до 10 МБ</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Ссылка *</label>
              <input
                name="externalUrl"
                type="url"
                required={inputType === 'link'}
                placeholder="https://..."
                className={INPUT_CLS}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
