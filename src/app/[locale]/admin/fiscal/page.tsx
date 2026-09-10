'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileText, KeyRound, ShieldCheck, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import {
  fetchFiscalSettings,
  updateFiscalSettings,
  getApiErrorMessage,
  type ApiFiscalSettings,
} from '@/lib/api-helpers'

function toDateValue(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function AdminFiscalPage() {
  const t = useTranslations('adminFiscal')
  const [settings, setSettings] = React.useState<ApiFiscalSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    productId: '',
    productVersion: '',
    softwareValidationNumber: '',
    certificationDate: '',
    signatureVersion: '1',
    agtBaseUrl: '',
    agtUsername: '',
    agtPassword: '',
    timezone: 'Africa/Luanda',
  })

  React.useEffect(() => {
    fetchFiscalSettings()
      .then((data) => {
        setSettings(data)
        setForm({
          productId: data.productId || '',
          productVersion: data.productVersion || '',
          softwareValidationNumber: data.softwareValidationNumber || '',
          certificationDate: toDateValue(data.certificationDate),
          signatureVersion: String(data.signatureVersion || 1),
          agtBaseUrl: data.agtBaseUrl || '',
          agtUsername: data.agtUsername || '',
          agtPassword: data.agtPassword || '',
          timezone: data.timezone || 'Africa/Luanda',
        })
      })
      .catch((e) => toast(getApiErrorMessage(e) || t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [t])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateFiscalSettings({
        productId: form.productId.trim(),
        productVersion: form.productVersion.trim(),
        softwareValidationNumber: form.softwareValidationNumber.trim() || undefined,
        certificationDate: form.certificationDate ? new Date(form.certificationDate).toISOString() : undefined,
        signatureVersion: parseInt(form.signatureVersion, 10) || 1,
        agtBaseUrl: form.agtBaseUrl.trim() || undefined,
        agtUsername: form.agtUsername.trim() || undefined,
        agtPassword: form.agtPassword || undefined,
        timezone: form.timezone.trim() || 'Africa/Luanda',
      })
      setSettings(updated)
      toast(t('saveSuccess'), 'success')
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputLabel = (label: string) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-2 mb-8">
        <FileText className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      {settings && !settings.agtBaseUrl && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-900/20 p-4 mb-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{t('devModeNote')}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">{t('settingsTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('productId')}
                value={form.productId}
                onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
              />
              <Input
                label={t('productVersion')}
                value={form.productVersion}
                onChange={(e) => setForm((p) => ({ ...p, productVersion: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('softwareValidationNumber')}
                placeholder="C_134"
                value={form.softwareValidationNumber}
                onChange={(e) => setForm((p) => ({ ...p, softwareValidationNumber: e.target.value }))}
              />
              <div>
                {inputLabel(t('certificationDate'))}
                <input
                  type="date"
                  value={form.certificationDate}
                  onChange={(e) => setForm((p) => ({ ...p, certificationDate: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm text-gray-950 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('signatureVersion')}
                type="number"
                min={1}
                value={form.signatureVersion}
                onChange={(e) => setForm((p) => ({ ...p, signatureVersion: e.target.value }))}
              />
              <Input
                label={t('timezone')}
                value={form.timezone}
                onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
              />
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('agtTitle')}</p>
              <Input
                label={t('agtBaseUrl')}
                placeholder="https://sifp.minfin.gov.ao"
                value={form.agtBaseUrl}
                onChange={(e) => setForm((p) => ({ ...p, agtBaseUrl: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label={t('agtUsername')}
                  value={form.agtUsername}
                  onChange={(e) => setForm((p) => ({ ...p, agtUsername: e.target.value }))}
                />
                <Input
                  label={t('agtPassword')}
                  type="password"
                  value={form.agtPassword}
                  onChange={(e) => setForm((p) => ({ ...p, agtPassword: e.target.value }))}
                />
              </div>
            </div>

            {settings && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3 text-sm">
                <KeyRound className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('signatureKey')}</span>
                {settings.signatureKeyPem ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('signatureKeySet')}</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{t('signatureKeyMissing')}</span>
                )}
                <span className="ml-auto text-xs text-gray-400">{t('schemaVersion', { v: settings.schemaVersion })}</span>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}