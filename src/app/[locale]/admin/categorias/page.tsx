'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TranslationFields, emptyTranslations, type TranslationFieldsProps } from '@/components/translation-fields'
import { fetchAdminCategories, createCategory, updateCategory, deleteCategory, type ApiCategory } from '@/lib/api-helpers'
import { getCategoryIcon } from '@/lib/category-icons'
import { toast } from '@/components/ui/toast'

export default function AdminCategoriesPage() {
  const t = useTranslations('adminCategories')
  const tc = useTranslations('common')
  const tt = useTranslations('translations')
  const [categories, setCategories] = React.useState<ApiCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: '', slug: '', icon: '' })
  const [translations, setTranslations] = React.useState<Record<string, Record<string, string>>>(emptyTranslations())
  const [saving, setSaving] = React.useState(false)

  const translationFields: TranslationFieldsProps['fields'] = React.useMemo(
    () => [{ key: 'name', label: tt('name') }],
    [tt]
  )

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminCategories()
      .then((cats) => setCategories(cats))
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  const openCreate = () => {
    setEditId(null)
    setForm({ name: '', slug: '', icon: '' })
    setTranslations(emptyTranslations())
    setShowForm(true)
  }

  const openEdit = (cat: ApiCategory) => {
    setEditId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '' })
    const tr: Record<string, Record<string, string>> = emptyTranslations()
    for (const locale of Object.keys(tr)) {
      const match = cat.translations?.find((x) => x.locale === locale)
      if (match?.name) tr[locale] = { name: match.name }
    }
    setTranslations(tr)
    setShowForm(true)
  }

  const toApiTranslations = () =>
    Object.entries(translations)
      .filter(([, v]) => v.name?.trim())
      .map(([locale, v]) => ({ locale, name: v.name.trim() }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast(t('nameRequired'), 'error')
      return
    }
    setSaving(true)
    try {
      const apiTranslations = toApiTranslations()
      if (editId) {
        await updateCategory(editId, { ...form, translations: apiTranslations })
        toast(t('updateSuccess'), 'success')
      } else {
        await createCategory({ ...form, translations: apiTranslations })
        toast(t('createSuccess'), 'success')
      }
      setShowForm(false)
      load()
    } catch {
      toast(t('saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (catId: string, name: string) => {
    if (!confirm(t('deleteConfirm', { name }))) return
    try {
      await deleteCategory(catId)
      toast(t('deleteSuccess'), 'success')
      load()
    } catch {
      toast(t('deleteError'), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newCategory')}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editId ? t('editCategory') : t('newCategory')}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label={t('name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t('namePlaceholder')} />
            <Input label={`${t('slug')} (${tc('optional')})`} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={t('slugPlaceholder')} />
            <Input label={t('iconLabel')} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder={t('iconPlaceholder')} />
          </div>
          <div className="mt-3">
            <TranslationFields
              fields={translationFields}
              value={translations}
              onChange={setTranslations}
              source={{ name: form.name }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4 mr-1" />
              {saving ? tc('saving') : tc('save')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{tc('cancel')}</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">{t('icon')}</th>
                  <th className="px-4 py-3">{t('name')}</th>
                  <th className="px-4 py-3">{t('slug')}</th>
                  <th className="px-4 py-3">{t('products')}</th>
                  <th className="px-4 py-3">{t('subcategories')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      {React.createElement(getCategoryIcon(cat.icon), {
                        className: 'h-6 w-6 text-gray-600 dark:text-gray-300',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{cat._count?.products || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{cat.children?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)} className="rounded-md p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}