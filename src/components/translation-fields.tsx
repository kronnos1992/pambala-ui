'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Languages, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { localeNames } from '@/i18n/routing'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const TARGET_LOCALES = ['en', 'es', 'fr', 'zh', 'ar']

export interface TranslationFieldSpec {
  key: string
  label: string
  multiline?: boolean
  placeholder?: string
  dir?: 'ltr' | 'rtl'
}

export interface TranslationFieldsProps {
  fields: TranslationFieldSpec[]
  /** Map locale -> fieldKey -> value */
  value: Record<string, Record<string, string>>
  onChange: (value: Record<string, Record<string, string>>) => void
  /** Base (pt) content shown as reference context */
  source?: Record<string, string>
}

export function TranslationFields({ fields, value, onChange, source }: TranslationFieldsProps) {
  const t = useTranslations('translations')
  const [open, setOpen] = React.useState(false)

  const filledLocales = TARGET_LOCALES.filter((loc) =>
    fields.some((f) => (value[loc]?.[f.key] || '').trim().length > 0)
  ).length

  const setField = (locale: string, fieldKey: string, val: string) => {
    onChange({ ...value, [locale]: { ...(value[locale] || {}), [fieldKey]: val } })
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/40 dark:border-purple-800 dark:bg-purple-900/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {t('title')}
          {open && filledLocales > 0 && (
            <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full px-2 py-0.5">
              {filledLocales}/{TARGET_LOCALES.length}
            </span>
          )}
          {!open && <Sparkles className="h-3.5 w-3.5 text-purple-400" />}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-purple-100 dark:border-purple-800">
          <p className="pt-3 pb-3 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-500" />
            {t('note')}
          </p>
          <div className="space-y-5">
            {TARGET_LOCALES.map((locale) => {
              const isRtl = locale === 'ar'
              return (
                <div key={locale}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 w-24">
                      {localeNames[locale]}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">{locale}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((f) => {
                      const fieldDir = f.dir ?? (isRtl ? 'rtl' : 'ltr')
                      const showSource = source?.[f.key]
                      if (f.multiline) {
                        return (
                          <div key={f.key} dir={fieldDir} className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                              {f.label}
                            </label>
                            <textarea
                              value={value[locale]?.[f.key] || ''}
                              onChange={(e) => setField(locale, f.key, e.target.value)}
                              rows={3}
                              placeholder={f.placeholder}
                              className={cn(
                                'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-950 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none',
                                isRtl && 'text-right'
                              )}
                            />
                            {showSource && (
                              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                {t('baseContent')}: {showSource}
                              </p>
                            )}
                          </div>
                        )
                      }
                      return (
                        <div key={f.key}>
                          <Input
                            dir={fieldDir}
                            label={f.label}
                            value={value[locale]?.[f.key] || ''}
                            onChange={(e) => setField(locale, f.key, e.target.value)}
                            placeholder={f.placeholder}
                          />
                          {showSource && (
                            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500" dir="ltr">
                              {t('baseContent')}: {showSource}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function emptyTranslations(): Record<string, Record<string, string>> {
  return Object.fromEntries(TARGET_LOCALES.map((loc) => [loc, {}]))
}