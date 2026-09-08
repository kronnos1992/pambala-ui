'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { use } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { ChevronRight, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TranslationFields, emptyTranslations, TARGET_LOCALES, type TranslationFieldsProps } from '@/components/translation-fields'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { updateProduct, fetchCategories, fetchProductBySlug, uploadFile, getApiErrorMessage, type ApiCategory, type ApiProduct } from '@/lib/api-helpers'

function translationsFromProduct(product: ApiProduct): Record<string, Record<string, string>> {
  const t = emptyTranslations()
  for (const tr of product.translations || []) {
    if (TARGET_LOCALES.includes(tr.locale)) {
      t[tr.locale] = { name: tr.name || '', description: tr.description || '' }
    }
  }
  return t
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('sellerProductForm')
  const tc = useTranslations('common')
  const tt = useTranslations('translations')
  const tr = useTranslations('routes')
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [notFound, setNotFound] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [images, setImages] = React.useState<string[]>([])
  const [categories, setCategories] = React.useState<ApiCategory[]>([])
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    condition: 'NEW',
    stock: '',
  })
  const [translations, setTranslations] = React.useState<Record<string, Record<string, string>>>(emptyTranslations())
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const translationFields: TranslationFieldsProps['fields'] = React.useMemo(
    () => [
      { key: 'name', label: tt('name') },
      { key: 'description', label: tt('description'), multiline: true },
    ],
    [tt]
  )

  const conditions = [
    { value: 'NEW', label: t('conditions.new') },
    { value: 'USED', label: t('conditions.used') },
    { value: 'REFURBISHED', label: t('conditions.refurbished') },
  ]

  const load = React.useCallback(() => {
    Promise.all([fetchProductBySlug(id), fetchCategories()])
      .then(([product, cats]) => {
        setCategories(cats)
        setForm({
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          comparePrice: product.comparePrice ? String(product.comparePrice) : '',
          category: product.categoryId,
          condition: product.condition || 'NEW',
          stock: String(product.stock),
        })
        setImages(Array.isArray(product.images) ? product.images : [])
        setTranslations(translationsFromProduct(product))
      })
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true)
        } else {
          setLoadError(getApiErrorMessage(err) || t('loadError'))
        }
      })
      .finally(() => setLoading(false))
  }, [id, t])

  React.useEffect(() => {
    load()
  }, [load])

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    setUploadingImages(true)
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const { url } = await uploadFile(file)
        uploaded.push(url)
      }
      setImages((prev) => [...prev, ...uploaded])
    } catch {
      toast(t('uploadError'), 'error')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('errors.nameRequired')
    if (!form.price || parseFloat(form.price) <= 0) errs.price = t('errors.priceInvalid')
    if (!form.category) errs.category = t('errors.categoryRequired')
    if (!form.stock || parseInt(form.stock) < 0) errs.stock = t('errors.stockInvalid')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const apiTranslations = Object.entries(translations)
      .filter(([, v]) => v.name?.trim() || v.description?.trim())
      .map(([locale, v]) => ({
        locale,
        name: v.name?.trim() || undefined,
        description: v.description?.trim() || undefined,
      }))
    try {
      await updateProduct(id, {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        images: images.length > 0 ? images : undefined,
        condition: form.condition,
        stock: parseInt(form.stock),
        categoryId: form.category,
        translations: apiTranslations.length > 0 ? apiTranslations : undefined,
      })
      toast(t('updateSuccess'), 'success')
      router.push('/vendedor/produtos')
    } catch (err) {
      toast(getApiErrorMessage(err) || t('updateError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
          <div className="h-8 bg-gray-100 rounded w-40 mb-8" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{t('notFound')}</p>
        <Link href="/vendedor/produtos">
          <Button variant="outline">{t('products')}</Button>
        </Link>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{loadError}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => { setLoading(true); setNotFound(false); setLoadError(null); load() }}>{tc('retry')}</Button>
          <Link href="/vendedor/produtos">
            <Button variant="outline">{t('products')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">{t('vendor')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor/produtos" className="hover:text-emerald-600 transition-colors">{t('products')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{t('editTitle')}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('editTitle')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('section.images')}</h2>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                <Image src={img} alt="" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImages}
              className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-[10px]">{uploadingImages ? t('uploading') : t('addImage')}</span>
              </div>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('section.basicInfo')}</h2>
          <div className="space-y-4">
            <Input
              label={t('fields.name')}
              placeholder="Ex: iPhone 15 Pro Max 256GB"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              error={errors.name}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fields.description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={4}
                placeholder={t('fields.descriptionPlaceholder')}
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fields.category')}</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fields.condition')}</label>
                <div className="flex gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateForm('condition', c.value)}
                      className={`flex-1 h-11 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.condition === c.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('section.priceStock')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={`${t('fields.price')} (${tc('currency')})`}
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => updateForm('price', e.target.value)}
              error={errors.price}
            />
            <Input
              label={`${t('fields.comparePrice')} (${tc('currency')})`}
              type="number"
              placeholder={t('optionalPlaceholder')}
              value={form.comparePrice}
              onChange={(e) => updateForm('comparePrice', e.target.value)}
            />
            <Input
              label={t('fields.stock')}
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(e) => updateForm('stock', e.target.value)}
              error={errors.stock}
            />
          </div>
        </div>

        <TranslationFields
          fields={translationFields}
          value={translations}
          onChange={setTranslations}
          source={{ name: form.name, description: form.description }}
        />

        <div className="flex justify-end gap-3">
          <Link href="/vendedor/produtos">
            <Button variant="outline" type="button">{tc('cancel')}</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? t('updating') : t('updateProduct')}
          </Button>
        </div>
      </form>
    </div>
  )
}