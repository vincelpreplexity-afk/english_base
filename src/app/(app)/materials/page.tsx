import { createClient } from '@/lib/supabase/server'
import MaterialsList from '@/components/materials/materials-list'

export default async function MaterialsPage() {
  const supabase = await createClient()

  const [{ data: rows }, { data: categoryRows }] = await Promise.all([
    supabase
      .from('materials')
      .select('id, title, category, level, type, url')
      .order('title', { ascending: true }),
    supabase
      .from('material_categories')
      .select('name, icon')
      .order('name', { ascending: true }),
  ])

  const materials = rows ?? []
  const categories = (categoryRows ?? []) as { name: string; icon: string }[]

  // Generate signed URLs for file-type materials (1-hour expiry)
  const withUrls = await Promise.all(
    materials.map(async m => {
      let signedUrl: string | null = null
      let downloadUrl: string | null = null

      if (m.type === 'file' && m.url) {
        const ext = m.url.split('.').pop() ?? 'bin'
        const filename = `${m.title}.${ext}`

        const [{ data: previewData }, { data: dlData }] = await Promise.all([
          supabase.storage.from('materials').createSignedUrl(m.url, 3600),
          supabase.storage.from('materials').createSignedUrl(m.url, 3600, { download: filename }),
        ])

        signedUrl = previewData?.signedUrl ?? null
        downloadUrl = dlData?.signedUrl ?? null
      }

      return { ...m, signedUrl, downloadUrl }
    })
  )

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
