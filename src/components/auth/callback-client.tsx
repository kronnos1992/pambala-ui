'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { NeuCard } from '@/components/auth/neu-card'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

const ERROR_KEYS: Record<string, string> = {
  state_invalido: 'errorStateInvalid',
  sem_codigo: 'errorNoCode',
  erro_oauth: 'errorOauth',
}

export default function CallbackClient({
  token,
  error,
}: {
  token?: string
  error?: string
}) {
  const t = useTranslations('callbackClient')
  const router = useRouter()

  const errorMessage = error
    ? t(ERROR_KEYS[error] || 'errorGeneric')
    : !token
      ? t('errorMissingToken')
      : null

  const authed = React.useRef(false)
  React.useEffect(() => {
    if (error || !token || authed.current) return
    authed.current = true
    ;(async () => {
      try {
        useAuthStore.getState().setToken(token)
        await useAuthStore.getState().refreshUser()
        try {
          const { useCartStore } = await import('@/store/cart-store')
          await useCartStore.getState().syncWithApi()
        } catch {}
      } catch {
        useAuthStore.setState({ user: null, token: null })
        return
      }
      router.replace('/')
    })()
  }, [token, error, router])

  return (
    <NeuCard className="relative overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div
          className={cn(
            'mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-full',
            'bg-[#e0e5ec] shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff]',
            'dark:bg-[#1f242e] dark:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]',
            errorMessage ? 'text-[#ff3b5c]' : 'text-[#00c896]'
          )}
        >
          {errorMessage ? (
            <AlertCircle className="h-8 w-8" />
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#bec3cf] border-t-[#00c896] dark:border-[#2b313d]" />
          )}
        </div>

        <h3 className="text-xl font-bold tracking-tight text-[#3d4468] dark:text-[#e6eaf4]">
          {errorMessage ? t('errorTitle') : t('loggingIn')}
        </h3>

        {errorMessage ? (
          <>
            <p className="mt-1 text-xs text-[#9499b7] dark:text-[#7c85a1]">{errorMessage}</p>
            <Link
              href="/login"
              className="mt-4 rounded-[11px] bg-[#e0e5ec] px-4 py-2 text-xs font-semibold text-[#3d4468] shadow-[5px_5px_12px_#bec3cf,-5px_-5px_12px_#ffffff] transition-all duration-300 hover:-translate-y-0.5 dark:bg-[#1f242e] dark:text-[#e6eaf4] dark:shadow-[5px_5px_12px_#14171f,-5px_-5px_12px_#2b313d]"
            >
              {t('backToLogin')}
            </Link>
          </>
        ) : (
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#9499b7] dark:text-[#7c85a1]">
            <ShieldCheck className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70" />
            {t('redirecting')}
          </p>
        )}
      </div>
    </NeuCard>
  )
}
