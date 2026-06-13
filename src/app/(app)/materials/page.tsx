import { createClient } from '@/lib/supabase/server'
import MaterialsList from '@/components/materials/materials-list'

export default async function MaterialsPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('materials')
    .select('id, title, category, level, type, url')
    .order('title', { ascending: true })

  const materials = rows ?? []

  // Generate signed URLs for file-type materials (1-hour expiry)
  const withUrls = await Promise.all(
    materials.map(async m => {
      let signedUrl: string | null = null
      if (m.type === 'file' && m.url) {
        const { data } = await supabase.storage
          .from('materials')
          .createSignedUrl(m.url, 3600)
        signedUrl = data?.signedUrl ?? null
      }
      return { ...m, signedUrl }
    })
  )

  // Distinct non-null categories, sorted
  const categories = Array.from(
    new Set(materials.map(m => m.category).filter(Boolean) as string[])
  ).sort()

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5">
        <h1 className="font-heading text-lg font-semibold text-stone-900 lg:text-xl">
          Материалы
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">Библиотека учебных файлов и ссылок</p>
      </div>

      <MaterialsList materials={withUrls} categories={categories} />
    </div>
  )
}
