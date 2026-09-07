'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { NeuCard } from '@/components/auth/neu-card'
import { useAuthStore } from '@/store/auth-store'
import { getApiErrorMessage, getRetryAfterSeconds } from '@/lib/api-helpers'
import { useCountdown } from '@/hooks/use-countdown'
import { startSocialLogin } from '@/lib/social'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const REMEMBER_KEY = 'pambala-remembered-email'

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const loginWithApi = useAuthStore((s) => s.loginWithApi)

  const emailInputRef = React.useRef<HTMLInputElement>(null)
  const passwordInputRef = React.useRef<HTMLInputElement>(null)

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const { remaining: cooldown, start: startCooldown } = useCountdown()

  const [emailFocused, setEmailFocused] = React.useState(false)
  const [passwordFocused, setPasswordFocused] = React.useState(false)

  React.useEffect(() => {
    try {
      const remembered = localStorage.getItem(REMEMBER_KEY)
      if (remembered) {
        setEmail(remembered)
        setRemember(true)
        if (emailInputRef.current) {
          emailInputRef.current.value = remembered
        }
      }
    } catch {}
  }, [])

  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      if (!value.trim()) return t('errors.emailRequired')
      if (!/\S+@\S+\.\S+/.test(value)) return t('errors.emailInvalid')
    }
    if (field === 'password') {
      if (!value) return t('errors.passwordRequired')
      if (value.length < 6) return t('errors.passwordMin')
    }
    return undefined
  }

  const handleFieldBlur = (field: 'email' | 'password') => {
    const value = field === 'email' ? (emailInputRef.current?.value ?? email) : (passwordInputRef.current?.value ?? password)
    if (field === 'email') {
      setEmailFocused(false)
      setErrors((prev) => ({ ...prev, email: validateField('email', value) }))
    } else {
      setPasswordFocused(false)
      setErrors((prev) => ({ ...prev, password: validateField('password', value) }))
    }
  }

  const handleFieldChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value)
    else setPassword(value)
    setFormError(null)
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev
      void _removed
      return rest
    })
  }

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setFormError(null)
    setLoading(true)
    try {
      await loginWithApi(loginEmail, loginPassword)
      if (remember) {
        try { localStorage.setItem(REMEMBER_KEY, loginEmail) } catch {}
      } else {
        try { localStorage.removeItem(REMEMBER_KEY) } catch {}
      }
      setSuccess(true)
      toast(t('welcomeBack'), 'success')
      setTimeout(() => {
        router.push('/')
      }, 1200)
    } catch (err) {
      const wait = getRetryAfterSeconds(err)
      if (wait) {
        startCooldown(wait)
        setFormError(null)
        toast(t('rateLimited', { seconds: wait }), 'error')
      } else {
        setFormError(getApiErrorMessage(err) || t('loginFailed'))
        toast(t('invalidCredentials'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0 || loading) return
    const currentEmail = (emailInputRef.current?.value ?? email).trim()
    const currentPassword = passwordInputRef.current?.value ?? password
    const nextErrors = {
      email: validateField('email', currentEmail),
      password: validateField('password', currentPassword),
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return
    doLogin(currentEmail, currentPassword)
  }

  return (
    <NeuCard className="relative overflow-hidden p-4 sm:p-5">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
          <div
            className={cn(
              'mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-full text-[#00c896]',
              'bg-[#e0e5ec] shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff]',
              'dark:bg-[#1f242e] dark:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]'
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-8 w-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[#3d4468] dark:text-[#e6eaf4]">
            {t('successTitle')}
          </h3>
          <p className="mt-1 text-xs text-[#9499b7] dark:text-[#7c85a1]">
            {t('redirecting')}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-center">
            <div
              className={cn(
                'group mx-auto mb-2 flex h-[50px] w-[50px] items-center justify-center rounded-full transition-all duration-300 hover:scale-105',
                'bg-[#e0e5ec] shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff]',
                'hover:shadow-[inset_4px_4px_10px_#bec3cf,inset_-4px_-4px_10px_#ffffff]',
                'dark:bg-[#1f242e] dark:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]',
                'dark:hover:shadow-[inset_4px_4px_10px_#14171f,inset_-4px_-4px_10px_#2b313d]'
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center text-[#3d4468] dark:text-[#e6eaf4]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#3d4468] dark:text-[#e6eaf4]">
              {t('welcomeBackTitle')}
            </h2>
            <p className="mt-0.5 text-xs text-[#9499b7] dark:text-[#7c85a1]">
              {t('signInToContinue')}
            </p>
          </div>

          {cooldown > 0 && (
            <div className="mb-2.5 flex items-center gap-2 rounded-[12px] border border-amber-500/30 bg-amber-50/80 p-2 dark:border-amber-400/40 dark:bg-amber-400/10">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('rateLimited', { seconds: cooldown })}
              </p>
            </div>
          )}

          {formError && (
            <div className="mb-2.5 flex items-start gap-2 rounded-[12px] border border-[#ff3b5c]/25 bg-[#ffe6ea]/80 p-2 dark:border-[#ff3b5c]/40 dark:bg-[#ff3b5c]/10">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff3b5c]" />
              <p className="text-xs text-[#c2253c] dark:text-[#ff8fa3]">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
            <div className="relative">
              <div
                className={cn(
                  'relative h-[48px] rounded-[14px] border border-transparent transition-all duration-300',
                  'bg-[#e0e5ec] dark:bg-[#1f242e]',
                  'shadow-[inset_4px_4px_8px_#bec3cf,inset_-4px_-4px_8px_#ffffff]',
                  'dark:shadow-[inset_4px_4px_8px_#14171f,inset_-4px_-4px_8px_#2b313d]',
                  emailFocused && 'border-emerald-500/30 dark:border-emerald-400/30 shadow-[inset_4px_4px_8px_#bec3cf,inset_-4px_-4px_8px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_4px_4px_8px_#14171f,inset_-4px_-4px_8px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
                  errors.email && 'border-[#ff3b5c] shadow-[inset_6px_6px_12px_#ffb8c4,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#ff3b5c] dark:shadow-[inset_6px_6px_12px_rgba(255,59,92,0.35),inset_-6px_-6px_12px_#2b313d,0_0_0_2px_#ff3b5c]'
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300',
                    emailFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]'
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>

                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  defaultValue={email}
                  placeholder=""
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => handleFieldBlur('email')}
                  className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-5 pt-3.5 pb-0.5 text-sm font-medium text-[#3d4468] outline-none transition-colors dark:text-[#e6eaf4]"
                />

                <label
                  htmlFor="email"
                  className={cn(
                    'pointer-events-none absolute left-12 top-1.5 select-none text-[10.5px] font-semibold transition-colors duration-200',
                    emailFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                    errors.email && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
                  )}
                >
                  {t('emailLabel')}
                </label>
              </div>

              {errors.email && (
                <span className="mt-0.5 block pl-3 text-[11px] font-medium text-[#ff3b5c] animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="relative">
              <div
                className={cn(
                  'relative h-[48px] rounded-[14px] border border-transparent transition-all duration-300',
                  'bg-[#e0e5ec] dark:bg-[#1f242e]',
                  'shadow-[inset_4px_4px_8px_#bec3cf,inset_-4px_-4px_8px_#ffffff]',
                  'dark:shadow-[inset_4px_4px_8px_#14171f,inset_-4px_-4px_8px_#2b313d]',
                  passwordFocused && 'border-emerald-500/30 dark:border-emerald-400/30 shadow-[inset_4px_4px_8px_#bec3cf,inset_-4px_-4px_8px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_4px_4px_8px_#14171f,inset_-4px_-4px_8px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
                  errors.password && 'border-[#ff3b5c] shadow-[inset_6px_6px_12px_#ffb8c4,inset_-6px_-6px_12px_#ffffff,0_0_0_2px_#ff3b5c] dark:shadow-[inset_6px_6px_12px_rgba(255,59,92,0.35),inset_-6px_-6px_12px_#2b313d,0_0_0_2px_#ff3b5c]'
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300',
                    passwordFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]'
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>

                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  defaultValue={password}
                  placeholder=""
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => handleFieldBlur('password')}
                  className="h-full w-full rounded-[14px] bg-transparent pl-12 pr-12 pt-3.5 pb-0.5 text-sm font-medium text-[#3d4468] outline-none transition-colors dark:text-[#e6eaf4]"
                />

                <label
                  htmlFor="password"
                  className={cn(
                    'pointer-events-none absolute left-12 top-1.5 select-none text-[10.5px] font-semibold transition-colors duration-200',
                    passwordFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                    errors.password && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
                  )}
                >
                  {t('passwordLabel')}
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  className={cn(
                    'absolute right-2 top-1/2 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[10px] transition-all duration-300',
                    'bg-[#e0e5ec] text-[#6c7293] dark:bg-[#1f242e] dark:text-[#aeb6cc]',
                    'shadow-[4px_4px_10px_#bec3cf,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#14171f,-4px_-4px_10px_#2b313d]',
                    'hover:text-[#3d4468] dark:hover:text-[#e6eaf4]',
                    'active:shadow-[inset_2px_2px_5px_#bec3cf,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_5px_#14171f,inset_-2px_-2px_5px_#2b313d]'
                  )}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="mt-0.5 block pl-3 text-[11px] font-medium text-[#ff3b5c] animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-[#6c7293] transition-transform duration-200 hover:scale-[1.02] dark:text-[#aeb6cc]">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] transition-all duration-300',
                    'bg-[#e0e5ec] dark:bg-[#1f242e]',
                    'shadow-[3px_3px_8px_#bec3cf,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#14171f,-3px_-3px_8px_#2b313d]',
                    'peer-checked:shadow-[inset_2px_2px_5px_#bec3cf,inset_-2px_-2px_5px_#ffffff] dark:peer-checked:shadow-[inset_2px_2px_5px_#14171f,inset_-2px_-2px_5px_#2b313d]'
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={cn(
                      'h-3 w-3 text-[#00c896] transition-all duration-300',
                      remember ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    )}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{t('rememberMe')}</span>
              </label>

              <Link
                href="/contacto"
                className="text-xs font-medium text-[#6c7293] transition-colors duration-300 hover:text-[#3d4468] dark:text-[#aeb6cc] dark:hover:text-[#e6eaf4]"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={cn(
                'group relative w-full overflow-hidden rounded-[13px] py-2.5 text-[15px] font-semibold transition-all duration-300',
                'bg-[#e0e5ec] text-[#3d4468] dark:bg-[#1f242e] dark:text-[#e6eaf4]',
                'shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] dark:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]',
                'hover:-translate-y-0.5 hover:shadow-[12px_12px_30px_#bec3cf,-12px_-12px_30px_#ffffff] dark:hover:shadow-[12px_12px_30px_#14171f,-12px_-12px_30px_#2b313d]',
                'active:translate-y-0 active:shadow-[inset_4px_4px_10px_#bec3cf,inset_-4px_-4px_10px_#ffffff] dark:active:shadow-[inset_4px_4px_10px_#14171f,inset_-4px_-4px_10px_#2b313d]',
                'disabled:pointer-events-none disabled:opacity-60'
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-500 ease-out group-hover:left-full dark:via-white/10"
              />

              {loading ? (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-[#bec3cf] border-t-[#6c7293] dark:border-[#2b313d] dark:border-t-[#aeb6cc]" />
                  <span>{t('signInLoading')}</span>
                </div>
              ) : cooldown > 0 ? (
                <span className="relative z-10">{t('rateLimitedShort', { seconds: cooldown })}</span>
              ) : (
                <span className="relative z-10">{t('signIn')}</span>
              )}
            </button>
          </form>

          <div className="my-2.5 flex items-center gap-3">
            <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#bec3cf] dark:to-[#2b313d]" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-[#9499b7] dark:text-[#7c85a1]">
              {t('orContinueWith')}
            </span>
            <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-[#bec3cf] dark:to-[#2b313d]" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => startSocialLogin('google')}
              aria-label={t('continueWithGoogle')}
              title={t('continueWithGoogle')}
              className={cn(
                'flex h-[38px] w-[38px] items-center justify-center rounded-[11px] transition-all duration-300',
                'bg-[#e0e5ec] text-[#4285F4] dark:bg-[#1f242e] dark:text-[#8ab4f8]',
                'shadow-[6px_6px_15px_#bec3cf,-6px_-6px_15px_#ffffff] dark:shadow-[6px_6px_15px_#14171f,-6px_-6px_15px_#2b313d]',
                'hover:-translate-y-0.5 hover:scale-105 hover:shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] dark:hover:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]',
                'active:translate-y-0 active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_8px_#14171f,inset_-3px_-3px_8px_#2b313d]'
              )}
            >
              <svg viewBox="0 0 48 48" className="h-[17px] w-[17px]">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
            </button>
          </div>

          <div className="mt-2.5 text-center">
            <p className="text-xs text-[#9499b7] dark:text-[#7c85a1]">
              {t('noAccount')}{' '}
              <Link
                href="/register"
                className="font-semibold text-[#6c7293] transition-colors duration-300 hover:text-[#3d4468] dark:text-[#aeb6cc] dark:hover:text-[#e6eaf4]"
              >
                {t('signUp')}
              </Link>
            </p>
          </div>

          <div className="mt-1 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#9499b7]/80 dark:text-[#7c85a1]/80">
            <ShieldCheck className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70" />
            <span>{t('adminDemo')}</span>
          </div>
        </>
      )}
    </NeuCard>
  )
}
