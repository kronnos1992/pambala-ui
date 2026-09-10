'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  ChevronRight, FileText, Plus, RefreshCw, Store, Info, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import {
  fetchMyStore,
  fetchStoreFiscalProfile,
  updateStoreFiscalProfile,
  fetchStoreFiscalSeries,
  openInvoiceSeries,
  getApiErrorMessage,
  FISCAL_DOCUMENT_TYPES,
  type ApiStoreFiscalProfile,
  type ApiInvoiceSeries,
} from '@/lib/api-helpers'

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
]

const SERIES_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
}

export default function VendedorFiscalPage() {
  const t = useTranslations('sellerFiscal')
  const tr = useTranslations('routes')
  const tDash = useTranslations('sellerDashboard')

  const [storeId, setStoreId] = React.useState<string | null>(null)
  const [loadingStore, setLoadingStore] = React.useState(true)
  const [profile, setProfile] = React.useState<ApiStoreFiscalProfile | null>(null)
  const [series, setSeries] = React.useState<ApiInvoiceSeries[]>([])
  const [loadingProfile, setLoadingProfile] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [opening, setOpening] = React.useState(false)

  const [form, setForm] = React.useState({
    nif: '',
    legalName: '',
    address: '',
    province: '',
    district: '',
    industryCode: '',
    vatRegime: 'GERAL',
    vatExemptionCode: '',
    establishmentNumber: 'SEDE',
    establishmentRegistered: false,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [seriesForm, setSeriesForm] = React.useState({
    documentType: 'FT',
    establishmentNumber: 'SEDE',
    year: String(new Date().getFullYear()),
  })

  const fillForm = React.useCallback((p: ApiStoreFiscalProfile | null) => {
    setForm({
      nif: p?.nif || '',
      legalName: p?.legalName || '',
      address: p?.address || '',
      province: p?.province || '',
      district: p?.district || '',
      industryCode: p?.industryCode || '',
      vatRegime: p?.vatRegime || 'GERAL',
      vatExemptionCode: p?.vatExemptionCode || '',
      establishmentNumber: p?.establishmentNumber || 'SEDE',
      establishmentRegistered: p?.establishmentRegistered || false,
    })
  }, [])

  const loadProfile = React.useCallback(async (storesId: string) => {
    setLoadingProfile(true)
    try {
      const data = await fetchStoreFiscalProfile(storesId)
      setProfile(data)
      fillForm(data)
    } catch {
      setProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }, [fillForm])

  const loadSeries = React.useCallback(async (storesId: string) => {
    try {
      setSeries(await fetchStoreFiscalSeries(storesId))
    } catch {
      setSeries([])
    }
  }, [])

  React.useEffect(() => {
    let active = true
    fetchMyStore()
      .then((store) => {
        if (!active) return
        if (store?.id) {
          setStoreId(store.id)
          void loadProfile(store.id)
          void loadSeries(store.id)
        } else {
          setStoreId(null)
        }
      })
      .catch(() => setStoreId(null))
      .finally(() => {
        if (active) setLoadingStore(false)
      })
    return () => {
      active = false
    }
  }, [loadProfile, loadSeries])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return
    const errs: Record<string, string> = {}
    if (!form.nif.trim()) errs.nif = t('nifRequired')
    if (!form.legalName.trim()) errs.legalName = t('legalNameRequired')
    if (!form.address.trim()) errs.address = t('addressRequired')
    if (!form.province) errs.province = t('provinceRequired')
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      const saved = await updateStoreFiscalProfile(storeId, {
        nif: form.nif.trim(),
        legalName: form.legalName.trim(),
        address: form.address.trim(),
        province: form.province,
        district: form.district.trim() || undefined,
        industryCode: form.industryCode.trim() || undefined,
        vatRegime: form.vatRegime as ApiStoreFiscalProfile['vatRegime'],
        vatExemptionCode: form.vatExemptionCode.trim() || undefined,
        establishmentNumber: form.establishmentNumber.trim() || 'SEDE',
        establishmentRegistered: form.establishmentRegistered,
      })
      setProfile(saved)
      toast(t('saveSuccess'), 'success')
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenSeries = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return
    setOpening(true)
    try {
      const created = await openInvoiceSeries(storeId, {
        documentType: seriesForm.documentType,
        establishmentNumber: seriesForm.establishmentNumber.trim() || 'SEDE',
        year: parseInt(seriesForm.year, 10) || new Date().getFullYear(),
      })
      setSeries((prev) => [created, ...prev])
      toast(t('openSuccess'), 'success')
    } catch (err) {
      toast(getApiErrorMessage(err) || t('openError'), 'error')
    } finally {
      setOpening(false)
    }
  }

  const inputLabel = (label: string) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
  )

  if (!loadingStore && !storeId) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 text-center py-16">
        <Store className="mx-auto h-10 w-10 text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noStore')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('noStoreHint')}</p>
        <Link href="/vendedor/loja">
          <Button><Plus className="h-4 w-4 mr-2" />{tDash('createStore')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">{tDash('breadcrumb')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{t('breadcrumb')}</span>
      </nav>

      <div className="flex items-center gap-2 mb-8">
        <FileText className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil Fiscal */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profileTitle')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profileHint')}</p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="space-y-3">
              <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profile && !profile.isActive && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />{t('inactiveNote')}
                </p>
              )}
              <Input
                label={t('nif')}
                placeholder="5000000000"
                value={form.nif}
                onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
                error={errors.nif}
              />
              <Input
                label={t('legalName')}
                placeholder="Denominação social"
                value={form.legalName}
                onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
                error={errors.legalName}
              />
              <Input
                label={t('industryCode')}
                placeholder="CAE (ex.: 47110)"
                value={form.industryCode}
                onChange={(e) => setForm((p) => ({ ...p, industryCode: e.target.value }))}
              />
              <Input
                label={t('address')}
                placeholder="Endereço completo"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                error={errors.address}
              />
              <div className="grid grid-cols-2 gap-4">
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
                  value={form.district}
                  onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {inputLabel(t('vatRegime'))}
                  <select
                    value={form.vatRegime}
                    onChange={(e) => setForm((p) => ({ ...p, vatRegime: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-emerald-500"
                  >
                    {(['GERAL', 'SIMPLIFICADO', 'EXCLUIDO', 'ISENTO'] as const).map((r) => (
                      <option key={r} value={r}>{t(`regimes.${r}`)}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t('vatExemptionCode')}
                  placeholder="M10"
                  value={form.vatExemptionCode}
                  onChange={(e) => setForm((p) => ({ ...p, vatExemptionCode: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('establishmentNumber')}
                  value={form.establishmentNumber}
                  onChange={(e) => setForm((p) => ({ ...p, establishmentNumber: e.target.value }))}
                />
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.establishmentRegistered}
                      onChange={(e) => setForm((p) => ({ ...p, establishmentRegistered: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-emerald-600"
                    />
                    {t('establishmentRegistered')}
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? t('saving') : t('saveProfile')}
              </Button>
            </form>
          )}
        </div>

        {/* Séries */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('seriesTitle')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('seriesHint')}</p>
            </div>
          </div>

          <form onSubmit={handleOpenSeries} className="mb-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                {inputLabel(t('documentType'))}
                <select
                  value={seriesForm.documentType}
                  onChange={(e) => setSeriesForm((p) => ({ ...p, documentType: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-emerald-500"
                >
                  {FISCAL_DOCUMENT_TYPES.map((code) => <option key={code} value={code}>{code}</option>)}
                </select>
              </div>
              <Input
                label={t('year')}
                type="number"
                value={seriesForm.year}
                onChange={(e) => setSeriesForm((p) => ({ ...p, year: e.target.value }))}
              />
              <Input
                label={t('establishmentNumber')}
                value={seriesForm.establishmentNumber}
                onChange={(e) => setSeriesForm((p) => ({ ...p, establishmentNumber: e.target.value }))}
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={opening}>
              <Plus className="h-4 w-4 mr-1.5" />
              {opening ? t('opening') : t('openSeries')}
            </Button>
          </form>

          <div className="mt-5 mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('seriesList')}</h3>
            <Button variant="ghost" size="sm" onClick={() => storeId && loadSeries(storeId)} disabled={!storeId}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              {t('reload')}
            </Button>
          </div>

          {series.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">{t('noSeries')}</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {series.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {s.documentType} {s.year}
                      </span>
                      {s.agtSeriesCode && (
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">{s.agtSeriesCode}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('progress', {
                        next: s.nextNumber,
                        last: s.lastNumberUsed ?? s.nextNumber - 1,
                      })}
                    </p>
                  </div>
                  <span className={cn(
                    'shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    SERIES_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  )}>
                    {t(`seriesStatus.${s.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}