'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMaterial } from '@/app/(app)/materials/actions'
import AddMaterialModal from './add-material-modal'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

type Material = {
  id: string
  title: string
  category: string | null
  level: string | null
  type: 'file' | 'link'
  url: string | null
  signedUrl: string | null
}

type Props = {
  materials: Material[]
  categories: string[]
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1: 'bg-blue-50 text-blue-700',
    A2: 'bg-indigo-50 text-indigo-700',
    B1: 'bg-yellow-50 text-yellow-700',
    B2: 'bg-orange-50 text-orange-700',
    C1: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[level] ?? 'bg-stone-100 text-stone-600'}`}>
      {level}
    </span>
  )
}

function MaterialCard({ material, onDelete }: { material: Material; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()

  const href = material.type === 'file' ? material.signedUrl : material.url

  function handleDelete() {
    if (!confirm(`Удалить «${material.title}»?`)) return
    setDeleting(true)
    startTransition(async () => {
      try {
        await deleteMaterial(material.id)
        onDelete(material.id)
      } catch {
        setDeleting(false)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-3 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 truncate">{material.title}</h3>
          {material.category && (
            <p className="text-xs text-stone-500 mt-0.5 truncate">{material.category}</p>
          )}
        </div>
        {material.level && <LevelBadge level={material.level} />}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center rounded-lg bg-accent/10 text-accent text-xs font-medium py-2 hover:bg-accent/20 transition-colors truncate"
          >
            {material.type === 'file' ? '📄 Открыть файл' : '🔗 Открыть ссылку'}
          </a>
        ) : (
          <span className="flex-1 text-center text-xs text-stone-400 py-2">Нет ссылки</span>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {deleting ? '…' : 'Удалить'}
        </button>
      </div>
    </div>
  )
}

export default function MaterialsList({ materials: initialMaterials, categories }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterLevel, setFilterLevel] = useState<string>('')
  const [localMaterials, setLocalMaterials] = useState(initialMaterials)

  // Sync when RSC re-renders (router.refresh)
  useMemo(() => { setLocalMaterials(initialMaterials) }, [initialMaterials])

  const filtered = useMemo(() => {
    return localMaterials.filter(m => {
      if (filterCategory && m.category !== filterCategory) return false
      if (filterLevel && m.level !== filterLevel) return false
      return true
    })
  }, [localMaterials, filterCategory, filterLevel])

  function handleDelete(id: string) {
    setLocalMaterials(prev => prev.filter(m => m.id !== id))
    router.refresh()
  }

  function handleModalClose() {
    setShowModal(false)
    router.refresh()
  }

  const hasFilters = filterCategory || filterLevel

  return (
    <>
      {/* Filter panel + Add button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2 flex-1 flex-wrap">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Все категории</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Все уровни</option>
            {LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterCategory(''); setFilterLevel('') }}
              className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors whitespace-nowrap"
        >
          + Добавить
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-stone-700 font-medium">
            {hasFilters ? 'Нет материалов с такими фильтрами' : 'Пока нет материалов'}
          </p>
          {!hasFilters && (
            <p className="text-sm text-stone-400 mt-1">Нажмите «Добавить», чтобы загрузить первый</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(m => (
            <MaterialCard key={m.id} material={m} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <AddMaterialModal categories={categories} onClose={handleModalClose} />
      )}
    </>
  )
}
