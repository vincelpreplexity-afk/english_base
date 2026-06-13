'use client'

import { useState, useTransition, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Book, GraduationCap, NotePencil, PenNib,
  Globe, Headphones, Microphone, Translate, Brain,
  Lightbulb, Trophy, MusicNote, VideoCamera, Newspaper,
  Palette, Star, Bookmark, Chalkboard, Backpack,
} from '@phosphor-icons/react'
import { deleteMaterial, setCategoryIcon } from '@/app/(app)/materials/actions'
import AddMaterialModal from './add-material-modal'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])
const NO_CATEGORY = '__none__'
const DEFAULT_ICON = 'BookOpen'

// ─── Icon registry ────────────────────────────────────────────────────────────

type PhosphorIcon = React.ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill' | 'duotone'; className?: string }>

const ICON_MAP: Record<string, PhosphorIcon> = {
  BookOpen, Book, GraduationCap, NotePencil, PenNib,
  Globe, Headphones, Microphone, Translate, Brain,
  Lightbulb, Trophy, MusicNote, VideoCamera, Newspaper,
  Palette, Star, Bookmark, Chalkboard, Backpack,
}

const ICON_NAMES = Object.keys(ICON_MAP)

function CategoryIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? ICON_MAP[DEFAULT_ICON]
  return <Icon size={size} weight="duotone" />
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Material = {
  id: string
  title: string
  category: string | null
  level: string | null
  type: 'file' | 'link'
  url: string | null
  signedUrl: string | null
  downloadUrl: string | null
}

type CategoryDef = { name: string; icon: string }
type ViewMode = 'folders' | 'list'

type Props = {
  materials: Material[]
  categories: CategoryDef[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExt(url: string | null) {
  return url?.split('.').pop()?.toLowerCase() ?? ''
}

function isImage(m: Material) {
  return m.type === 'file' && IMAGE_EXTS.has(getExt(m.url))
}

function fileIcon(m: Material) {
  if (m.type === 'link') return '🔗'
  const ext = getExt(m.url)
  if (ext === 'pdf') return '📕'
  if (ext === 'doc' || ext === 'docx') return '📝'
  if (ext === 'ppt' || ext === 'pptx') return '📊'
  return '📄'
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1: 'bg-blue-50 text-blue-700',
    A2: 'bg-indigo-50 text-indigo-700',
    B1: 'bg-yellow-50 text-yellow-700',
    B2: 'bg-orange-50 text-orange-700',
    C1: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${colors[level] ?? 'bg-stone-100 text-stone-600'}`}>
      {level}
    </span>
  )
}

// ─── Image lightbox ───────────────────────────────────────────────────────────

function ImageLightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full max-h-full" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
        >
          Закрыть ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          className="max-w-full max-h-[85vh] object-contain rounded-xl mx-auto block"
        />
      </div>
    </div>
  )
}

// ─── Material card ────────────────────────────────────────────────────────────

function MaterialCard({
  material,
  showCategory = true,
  onDelete,
}: {
  material: Material
  showCategory?: boolean
  onDelete: (id: string) => void
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()

  const img = isImage(material)
  const icon = fileIcon(material)
  const openUrl = material.type === 'file' ? material.signedUrl : material.url

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
    <>
      <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden hover:border-stone-300 transition-colors">
        {img && material.signedUrl ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full aspect-[4/3] overflow-hidden bg-stone-100 relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={material.signedUrl} alt={material.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
                Увеличить
              </span>
            </div>
          </button>
        ) : (
          <div className="w-full aspect-[4/3] bg-stone-50 flex flex-col items-center justify-center gap-2 border-b border-stone-100">
            <span className="text-4xl">{icon}</span>
            {openUrl ? (
              <a href={openUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-medium hover:underline">
                Открыть ↗
              </a>
            ) : null}
          </div>
        )}

        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-stone-900 leading-tight line-clamp-2 flex-1">{material.title}</p>
            {material.level && <LevelBadge level={material.level} />}
          </div>
          {showCategory && material.category && (
            <p className="text-xs text-stone-400 truncate">{material.category}</p>
          )}
        </div>

        <div className="px-3 pb-3 flex gap-2">
          {material.type === 'file' && material.downloadUrl ? (
            <a href={material.downloadUrl} className="flex-1 text-center rounded-lg bg-accent/10 text-accent text-xs font-medium py-2 hover:bg-accent/20 transition-colors">
              Скачать ↓
            </a>
          ) : material.type === 'link' && material.url ? (
            <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-lg bg-accent/10 text-accent text-xs font-medium py-2 hover:bg-accent/20 transition-colors">
              Открыть ↗
            </a>
          ) : (
            <span className="flex-1" />
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? '…' : 'Удалить'}
          </button>
        </div>
      </div>

      {lightboxOpen && material.signedUrl && (
        <ImageLightbox src={material.signedUrl} title={material.title} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}

// ─── Folder card ──────────────────────────────────────────────────────────────

function FolderCard({
  name,
  count,
  icon,
  onClick,
  onIconChange,
}: {
  name: string
  count: number
  icon: string
  onClick: () => void
  onIconChange?: (iconName: string) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [currentIcon, setCurrentIcon] = useState(icon)
  const [, startTransition] = useTransition()
  const pickerRef = useRef<HTMLDivElement>(null)
  const isSpecial = name === NO_CATEGORY

  useEffect(() => { setCurrentIcon(icon) }, [icon])

  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  function selectIcon(iconName: string) {
    setCurrentIcon(iconName)
    setPickerOpen(false)
    onIconChange?.(iconName)
    startTransition(() => setCategoryIcon(name, iconName))
  }

  return (
    <div className="relative group/folder">
      <button
        type="button"
        onClick={onClick}
        className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col items-start gap-3 hover:border-accent hover:shadow-sm transition-all text-left w-full"
      >
        <span className="text-accent group-hover/folder:scale-110 transition-transform inline-block">
          <CategoryIcon name={currentIcon} size={28} />
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-900 line-clamp-2">
            {name === NO_CATEGORY ? 'Без категории' : name}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {count} {count === 1 ? 'материал' : count < 5 ? 'материала' : 'материалов'}
          </p>
        </div>
      </button>

      {!isSpecial && (
        <div ref={pickerRef} className="absolute top-2 right-2 z-10">
          <button
            type="button"
            title="Сменить иконку"
            onClick={e => { e.stopPropagation(); setPickerOpen(v => !v) }}
            className="opacity-0 group-hover/folder:opacity-100 w-7 h-7 rounded-lg bg-stone-100 hover:bg-accent-subtle text-stone-400 hover:text-accent flex items-center justify-center text-xs transition-all"
          >
            ✎
          </button>

          {pickerOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-52">
              <p className="text-xs text-stone-500 font-medium mb-2">Иконка папки</p>
              <div className="grid grid-cols-5 gap-1">
                {ICON_NAMES.map(n => (
                  <button
                    key={n}
                    type="button"
                    title={n}
                    onClick={() => selectIcon(n)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-colors text-stone-500 hover:text-accent hover:bg-accent-subtle ${currentIcon === n ? 'bg-accent-subtle text-accent ring-1 ring-accent/30' : ''}`}
                  >
                    <CategoryIcon name={n} size={17} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-stone-200 overflow-hidden text-sm font-medium">
      {(['folders', 'list'] as const).map((m, i) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-4 py-2 transition-colors ${i > 0 ? 'border-l border-stone-200' : ''} ${
            mode === m ? 'bg-accent text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          {m === 'folders' ? '📁 Папки' : '☰ Список'}
        </button>
      ))}
    </div>
  )
}

// ─── Card grid ────────────────────────────────────────────────────────────────

function CardGrid({ items, showCategory = true, onDelete }: { items: Material[]; showCategory?: boolean; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-stone-600 font-medium">Нет материалов</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {items.map(m => (
        <MaterialCard key={m.id} material={m} showCategory={showCategory} onDelete={onDelete} />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MaterialsList({ materials: initialMaterials, categories: initialCategories }: Props) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('folders')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [localMaterials, setLocalMaterials] = useState(initialMaterials)
  const [localCategories, setLocalCategories] = useState(initialCategories)

  useEffect(() => { setLocalMaterials(initialMaterials) }, [initialMaterials])
  useEffect(() => { setLocalCategories(initialCategories) }, [initialCategories])

  const iconMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const c of localCategories) m[c.name] = c.icon
    return m
  }, [localCategories])

  function handleDelete(id: string) {
    setLocalMaterials(prev => prev.filter(m => m.id !== id))
    router.refresh()
  }

  function handleModalClose() {
    setShowModal(false)
    router.refresh()
  }

  function handleIconChange(catName: string, iconName: string) {
    setLocalCategories(prev => prev.map(c => c.name === catName ? { ...c, icon: iconName } : c))
  }

  // ── Folders ───────────────────────────────────────────────────────────────

  const folderMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of localMaterials) {
      const key = m.category ?? NO_CATEGORY
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [localMaterials])

  const folderKeys = useMemo(() => {
    return Array.from(folderMap.keys()).sort((a, b) => {
      if (a === NO_CATEGORY) return 1
      if (b === NO_CATEGORY) return -1
      return a.localeCompare(b)
    })
  }, [folderMap])

  const folderContents = useMemo(() => {
    if (selectedCategory === null) return []
    const cat = selectedCategory === NO_CATEGORY ? null : selectedCategory
    return localMaterials.filter(m => m.category === cat)
  }, [localMaterials, selectedCategory])

  // ── List ─────────────────────────────────────────────────────────────────

  const categoryNames = useMemo(() => localCategories.map(c => c.name), [localCategories])

  const filteredList = useMemo(() => {
    return localMaterials.filter(m => {
      if (filterCategory && m.category !== filterCategory) return false
      if (filterLevel && m.level !== filterLevel) return false
      return true
    })
  }, [localMaterials, filterCategory, filterLevel])

  const hasFilters = filterCategory || filterLevel

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <ViewToggle mode={viewMode} onChange={m => { setViewMode(m); setSelectedCategory(null) }} />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors whitespace-nowrap"
        >
          + Добавить
        </button>
      </div>

      {/* ── Folders grid ─────────────────────────────────────────────────── */}
      {viewMode === 'folders' && selectedCategory === null && (
        localMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-stone-600 font-medium">Пока нет материалов</p>
            <p className="text-sm text-stone-400 mt-1">Нажмите «Добавить», чтобы загрузить первый</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folderKeys.map(key => (
              <FolderCard
                key={key}
                name={key}
                count={folderMap.get(key) ?? 0}
                icon={iconMap[key] ?? DEFAULT_ICON}
                onClick={() => setSelectedCategory(key)}
                onIconChange={iconName => handleIconChange(key, iconName)}
              />
            ))}
          </div>
        )
      )}

      {/* ── Folder contents ──────────────────────────────────────────────── */}
      {viewMode === 'folders' && selectedCategory !== null && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1"
            >
              ← Назад
            </button>
            <span className="text-stone-300">/</span>
            {selectedCategory !== NO_CATEGORY && (
              <span className="text-accent">
                <CategoryIcon name={iconMap[selectedCategory] ?? DEFAULT_ICON} size={16} />
              </span>
            )}
            <h2 className="text-sm font-semibold text-stone-900">
              {selectedCategory === NO_CATEGORY ? 'Без категории' : selectedCategory}
            </h2>
            <span className="text-xs text-stone-400">({folderContents.length})</span>
          </div>
          <CardGrid items={folderContents} showCategory={false} onDelete={handleDelete} />
        </>
      )}

      {/* ── List mode ────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Все категории</option>
              {categoryNames.map(c => (
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

          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-stone-600 font-medium">
                {hasFilters ? 'Нет материалов с такими фильтрами' : 'Пока нет материалов'}
              </p>
              {!hasFilters && (
                <p className="text-sm text-stone-400 mt-1">Нажмите «Добавить», чтобы загрузить первый</p>
              )}
            </div>
          ) : (
            <CardGrid items={filteredList} onDelete={handleDelete} />
          )}
        </>
      )}

      {showModal && (
        <AddMaterialModal categories={categoryNames} onClose={handleModalClose} />
      )}
    </>
  )
}
