'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Store, ExternalLink, ShieldCheck, ImageIcon, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/auth-store'
import { fetchMyStore, createStore, updateStore, uploadFile, getApiErrorMessage, type ApiStore } from '@/lib/api-helpers'

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
]

export default function VendedorLojaPage() {
  const t = useTranslations('sellerStore')
  const tDash = useTranslations('sellerDashboard')
  const tr = useTranslations('routes')
  const refreshUser = useAuthStore((s) => s.refreshUser)

  const [store, setStore] = React.useState<ApiStore | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', description: '', phone: '', province: '', district: '', logo: '', banner: '' })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [uploadingMedia, setUploadingMedia] = React.useState<'logo' | 'banner' | null>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const bannerInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let active = true
    fetchMyStore()
      .then((data) => {
        if (!active) return
        if (data) {
          setStore(data)
          setForm({
            name: data.name,
            description: data.description || '',
            phone: data.phone || '',
            province: data.province,
            district: data.district || '',
            logo: data.logo || '',
            banner: data.banner || '',
          })
        }
      })
      .catch((e) => toast(getApiErrorMessage(e) || t('loadError'), 'error'))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t])

  const handleMediaChange = async (field: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast(t('photoError'), 'error')
      return
    }
    setUploadingMedia(field)
    try {
      const { url } = await uploadFile(file)
      setForm((p) => ({ ...p, [field]: url }))
    } catch {
      toast(t('photoError'), 'error')
    } finally {
      setUploadingMedia(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('nameRequired')
    if (!form.province) errs.province = t('provinceRequired')
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    const payload: { name: string; description?: string; phone?: string; logo?: string; banner?: string; province: string; district?: string } = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      phone: form.phone.trim() || undefined,
      province: form.province,
      district: form.district.trim() || undefined,
    }
    if (store) {
      payload.logo = form.logo
      payload.banner = form.banner
    } else {
      if (form.logo.trim()) payload.logo = form.logo.trim()
      if (form.banner.trim()) payload.banner = form.banner.trim()
    }
    try {
      if (store) {
        await updateStore(payload)
        toast(t('updateSuccess'), 'success')
        const updated = await fetchMyStore()
        if (updated) setStore(updated)
      } else {
        await createStore(payload)
        toast(t('createSuccess'), 'success')
        await refreshUser()
      }
    } catch (err) {
      toast(getApiErrorMessage(err) || (store ? t('updateError') : t('createError')), 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputLabel = (label: string) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">{tDash('breadcrumb')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{t('breadcrumb')}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        {store && (
          <Link href={`/lojas/${store.slug}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('publicPage')}
            </Button>
          </Link>
        )}
      </div>

      {!store && !loading && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-900/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{t('onboardingTitle')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboardingHint')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Store className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">
                {store ? t('editTitle') : t('onboardingTitle')}
              </h2>
            </div>

            {store && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3 text-sm">
                <code className="font-mono text-gray-600 dark:text-gray-300">{store.slug}</code>
                {store.isVerified ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('verified')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {t('pendingVerification')}
                  </span>
                )}
              </div>
            )}

            <Input
              label={t('storeName')}
              placeholder="Pambala Store"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                {inputLabel(t('storeCapa'))}
                <div className="relative h-36 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  {form.banner ? (
                    <Image src={form.banner} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs">{t('changeCapa')}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={!!uploadingMedia}
                    className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={t('changeCapa')}
                  />
                  {form.banner && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, banner: '' }))}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                      aria-label={t('removePhoto')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {uploadingMedia === 'banner' && <Loader2 className="absolute right-2 bottom-2 h-5 w-5 animate-spin text-emerald-500" />}
                </div>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaChange('banner', e)} />
              </div>
              <div>
                {inputLabel(t('storeLogo'))}
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  {form.logo ? (
                    <Image src={form.logo} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400">
                      <Store className="h-6 w-6" />
                      <span className="text-xs">{t('changeLogo')}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={!!uploadingMedia}
                    className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={t('changeLogo')}
                  />
                  {form.logo && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, logo: '' }))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                      aria-label={t('removePhoto')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {uploadingMedia === 'logo' && <Loader2 className="absolute right-1 bottom-1 h-5 w-5 animate-spin text-emerald-500" />}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaChange('logo', e)} />
              </div>
            </div>

            <Input
              label={t('storeDescription')}
              placeholder="Descrição da tua loja"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />

            <Input
              label={t('storePhone')}
              placeholder="+244 900 000 000"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />

            <div>
              {inputLabel(t('province'))}
              <select
                value={form.province}
                onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">{t('selectProvince')}</option>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
            </div>

            <Input
              label={t('district')}
              placeholder="Distrito / Município"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
            />

            <div className="pt-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                <Store className="h-4 w-4 mr-2" />
                {t('saveStore')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}