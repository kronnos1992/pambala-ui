'use client'

import * as React from 'react'
import { useLocale } from 'next-intl'
import { Globe, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, localeNames } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={localeNames[locale]}
        title={localeNames[locale]}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:block text-xs uppercase font-semibold">{locale}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl glass-card py-1.5 z-[70]">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setOpen(false)
                router.replace(pathname, { locale: loc })
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                loc === locale
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
              }`}
            >
              <span>{localeNames[loc]}</span>
              {loc === locale && <span className="text-[10px] uppercase font-semibold">{loc}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}