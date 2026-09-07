'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { User, UserPlus, Mail, Phone, Store, ShoppingBag, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { NeuCard } from '@/components/auth/neu-card'
import { useAuthStore } from '@/store/auth-store'
import { getApiErrorMessage, getRetryAfterSeconds } from '@/lib/api-helpers'
import { useCountdown } from '@/hooks/use-countdown'
import { startSocialLogin } from '@/lib/social'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type Role = 'buyer' | 'seller'

const ROLE_ICONS: Record<Role, typeof User> = {
  buyer: ShoppingBag,
  seller: Store,
}

const ROLE_KEYS: Record<Role, string> = {
  buyer: 'roleBuyer',
  seller: 'roleSeller',
}

function getPasswordStrength(pw: string, t: (key: string) => string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  score = Math.min(score, 4)
  const map = [
    { label: '', color: 'bg-gray-300 dark:bg-gray-600' },
    { label: t('strengthWeak'), color: 'bg-[#ff3b5c]' },
    { label: t('strengthMedium'), color: 'bg-amber-500' },
    { label: t('strengthGood'), color: 'bg-lime-500' },
    { label: t('strengthStrong'), color: 'bg-emerald-500' },
  ]
  return { score, ...map[score] }
}

export default function RegisterPage() {
  const t = useTranslations('register')
  const tc = useTranslations('common')
  const router = useRouter()
  const registerWithApi = useAuthStore((s) => s.registerWithApi)

  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const emailInputRef = React.useRef<HTMLInputElement>(null)
  const phoneInputRef = React.useRef<HTMLInputElement>(null)
  const passwordInputRef = React.useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = React.useRef<HTMLInputElement>(null)

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [role, setRole] = React.useState<Role>('buyer')
  const [acceptTerms, setAcceptTerms] = React.useState(false)
  const [aiConsent, setAiConsent] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const { remaining: cooldown, start: startCooldown } = useCountdown()

  const [focusedField, setFocusedField] = React.useState<string | null>(null)

  const strength = getPasswordStrength(password, t)

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return t('errors.nameRequired')
        if (value.trim().length < 3) return t('errors.nameMin')
        return
      case 'email':
        if (!value.trim()) return t('errors.emailRequired')
        if (!/\S+@\S+\.\S+/.test(value)) return t('errors.emailInvalid')
        return
      case 'phone':
        if (value && !/^[+\d][\d ()-]{8,}$/.test(value.trim())) return t('errors.phoneInvalid')
        return
      case 'password':
        if (value.length < 6) return t('errors.passwordMin')
        return
      case 'confirmPassword':
        if (value !== (passwordInputRef.current?.value ?? password)) return t('errors.passwordMismatch')
        return
    }
  }

  const handleFieldBlur = (field: string) => {
    setFocusedField(null)
    let value = ''
    if (field === 'name') value = nameInputRef.current?.value ?? name
    else if (field === 'email') value = emailInputRef.current?.value ?? email
    else if (field === 'phone') value = phoneInputRef.current?.value ?? phone
    else if (field === 'password') value = passwordInputRef.current?.value ?? password
    else if (field === 'confirmPassword') value = confirmPasswordInputRef.current?.value ?? confirmPassword

    const msg = validateField(field, value)
    setErrors((prev) => {
      if (!msg) {
        const { [field]: _removed, ...rest } = prev
        void _removed
        return rest
      }
      return { ...prev, [field]: msg }
    })
  }

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'name') setName(value)
    else if (field === 'email') setEmail(value)
    else if (field === 'phone') setPhone(value)
    else if (field === 'password') setPassword(value)
    else if (field === 'confirmPassword') setConfirmPassword(value)
    setFormError(null)
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev
      void _removed
      return rest
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0 || loading) return
    const curName = nameInputRef.current?.value ?? name
    const curEmail = emailInputRef.current?.value ?? email
    const curPhone = phoneInputRef.current?.value ?? phone
    const curPassword = passwordInputRef.current?.value ?? password
    const curConfirm = confirmPasswordInputRef.current?.value ?? confirmPassword

    const nextErrors: Record<string, string> = {}
    const nameErr = validateField('name', curName)
    if (nameErr) nextErrors.name = nameErr

    const emailErr = validateField('email', curEmail)
    if (emailErr) nextErrors.email = emailErr

    const phoneErr = validateField('phone', curPhone)
    if (phoneErr) nextErrors.phone = phoneErr

    const passErr = validateField('password', curPassword)
    if (passErr) nextErrors.password = passErr

    const confErr = validateField('confirmPassword', curConfirm)
    if (confErr) nextErrors.confirmPassword = confErr

    if (!acceptTerms) nextErrors.terms = t('errors.acceptTerms')
    if (!aiConsent) nextErrors.aiConsent = t('errors.aiConsentRequired')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await registerWithApi({
        name: curName.trim(),
        email: curEmail.trim(),
        password: curPassword,
        phone: curPhone.trim() || undefined,
        role: role === 'seller' ? 'SELLER' : 'BUYER',
        aiValidationConsent: aiConsent,
      })
      toast(t('accountCreated'), 'success')
      router.push(role === 'seller' ? '/vendedor' : '/')
    } catch (err) {
      const wait = getRetryAfterSeconds(err)
      if (wait) {
        startCooldown(wait)
        setFormError(null)
        toast(t('rateLimited', { seconds: wait }), 'error')
      } else {
        setFormError(getApiErrorMessage(err) || t('createAccountError'))
        toast(t('createAccountError'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <NeuCard className="p-3.5 sm:p-4">
      <div className="mb-2.5 text-center">
        <div
          className={cn(
            'mx-auto mb-1.5 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[#6c7293] transition-transform duration-300 hover:scale-105 dark:text-[#aeb6cc]',
            'bg-[#e0e5ec] shadow-[6px_6px_14px_#bec3cf,-6px_-6px_14px_#ffffff]',
            'dark:bg-[#1f242e] dark:shadow-[6px_6px_14px_#14171f,-6px_-6px_14px_#2b313d]'
          )}
        >
          <UserPlus className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-[#3d4468] dark:text-[#e6eaf4]">
          {t('title')}
        </h1>
        <p className="text-[11px] text-[#9499b7] dark:text-[#7c85a1]">
          {t('subtitle')}
        </p>
      </div>

      {cooldown > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-amber-500/30 bg-amber-50/80 px-2.5 py-1.5 dark:border-amber-400/40 dark:bg-amber-400/10">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300">
            {t('rateLimited', { seconds: cooldown })}
          </p>
        </div>
      )}

      {formError && (
        <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-[#ff3b5c]/25 bg-[#ffe6ea]/80 px-2.5 py-1.5 dark:border-[#ff3b5c]/40 dark:bg-[#ff3b5c]/10">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#ff3b5c]" />
          <p className="text-[11px] text-[#c2253c] dark:text-[#ff8fa3]">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2" noValidate>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ROLE_KEYS) as Role[]).map((value) => {
            const active = role === value
            const Icon = ROLE_ICONS[value]
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={active}
                className={cn(
                  'flex h-[36px] items-center justify-center gap-1.5 rounded-[11px] px-2 text-xs font-semibold transition-all duration-300',
                  active
                    ? 'bg-[#e0e5ec] text-emerald-600 shadow-[inset_3px_3px_6px_#bec3cf,inset_-3px_-3px_6px_#ffffff] dark:bg-[#1f242e] dark:text-emerald-400 dark:shadow-[inset_3px_3px_6px_#14171f,inset_-3px_-3px_6px_#2b313d]'
                    : 'bg-[#e0e5ec] text-[#6c7293] shadow-[4px_4px_10px_#bec3cf,-4px_-4px_10px_#ffffff] hover:text-[#3d4468] dark:bg-[#1f242e] dark:text-[#aeb6cc] dark:shadow-[4px_4px_10px_#14171f,-4px_-4px_10px_#2b313d] dark:hover:text-[#e6eaf4]'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9499b7] dark:text-[#7c85a1]')} />
                <span className="truncate">{t(ROLE_KEYS[value] as 'roleBuyer' | 'roleSeller')}</span>
              </button>
            )
          })}
        </div>

        <div className="relative">
          <div
            className={cn(
              'relative h-[42px] rounded-[13px] border border-transparent transition-all duration-300',
              'bg-[#e0e5ec] dark:bg-[#1f242e]',
              'shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff]',
              'dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d]',
              focusedField === 'name' && 'border-emerald-500/30 shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
              errors.name && 'border-[#ff3b5c] shadow-[inset_4px_4px_8px_#ffb8c4,inset_-4px_-4px_8px_#ffffff,0_0_0_1.5px_#ff3b5c] dark:shadow-[inset_4px_4px_8px_rgba(255,59,92,0.35),inset_-4px_-4px_8px_#2b313d,0_0_0_1.5px_#ff3b5c]'
            )}
          >
            <User className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors', focusedField === 'name' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]')} />
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              defaultValue={name}
              placeholder=""
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => handleFieldBlur('name')}
              className="h-full w-full rounded-[13px] bg-transparent pl-10 pr-4 pt-3 pb-0.5 text-xs font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]"
            />
            <label
              htmlFor="name"
              className={cn(
                'pointer-events-none absolute left-10 top-1 select-none text-[10px] font-semibold transition-colors duration-200',
                focusedField === 'name' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                errors.name && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
              )}
            >
              {t('nameLabel')}
            </label>
          </div>
          {errors.name && <span className="mt-0.5 block pl-3 text-[10px] font-medium text-[#ff3b5c]">{errors.name}</span>}
        </div>

        <div className="relative">
          <div
            className={cn(
              'relative h-[42px] rounded-[13px] border border-transparent transition-all duration-300',
              'bg-[#e0e5ec] dark:bg-[#1f242e]',
              'shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff]',
              'dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d]',
              focusedField === 'email' && 'border-emerald-500/30 shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
              errors.email && 'border-[#ff3b5c] shadow-[inset_4px_4px_8px_#ffb8c4,inset_-4px_-4px_8px_#ffffff,0_0_0_1.5px_#ff3b5c] dark:shadow-[inset_4px_4px_8px_rgba(255,59,92,0.35),inset_-4px_-4px_8px_#2b313d,0_0_0_1.5px_#ff3b5c]'
            )}
          >
            <Mail className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors', focusedField === 'email' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]')} />
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              defaultValue={email}
              placeholder=""
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => handleFieldBlur('email')}
              className="h-full w-full rounded-[13px] bg-transparent pl-10 pr-4 pt-3 pb-0.5 text-xs font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]"
            />
            <label
              htmlFor="email"
              className={cn(
                'pointer-events-none absolute left-10 top-1 select-none text-[10px] font-semibold transition-colors duration-200',
                focusedField === 'email' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                errors.email && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
              )}
            >
              {t('emailLabel')}
            </label>
          </div>
          {errors.email && <span className="mt-0.5 block pl-3 text-[10px] font-medium text-[#ff3b5c]">{errors.email}</span>}
        </div>

        <div className="relative">
          <div
            className={cn(
              'relative h-[42px] rounded-[13px] border border-transparent transition-all duration-300',
              'bg-[#e0e5ec] dark:bg-[#1f242e]',
              'shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff]',
              'dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d]',
              focusedField === 'phone' && 'border-emerald-500/30 shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
              errors.phone && 'border-[#ff3b5c] shadow-[inset_4px_4px_8px_#ffb8c4,inset_-4px_-4px_8px_#ffffff,0_0_0_1.5px_#ff3b5c] dark:shadow-[inset_4px_4px_8px_rgba(255,59,92,0.35),inset_-4px_-4px_8px_#2b313d,0_0_0_1.5px_#ff3b5c]'
            )}
          >
            <Phone className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors', focusedField === 'phone' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]')} />
            <input
              ref={phoneInputRef}
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              defaultValue={phone}
              placeholder=""
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => handleFieldBlur('phone')}
              className="h-full w-full rounded-[13px] bg-transparent pl-10 pr-4 pt-3 pb-0.5 text-xs font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]"
            />
            <label
              htmlFor="phone"
              className={cn(
                'pointer-events-none absolute left-10 top-1 select-none text-[10px] font-semibold transition-colors duration-200',
                focusedField === 'phone' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                errors.phone && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
              )}
            >
              {t('phoneLabel')} {tc('optional')}
            </label>
          </div>
          {errors.phone && <span className="mt-0.5 block pl-3 text-[10px] font-medium text-[#ff3b5c]">{errors.phone}</span>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <div
              className={cn(
                'relative h-[42px] rounded-[13px] border border-transparent transition-all duration-300',
                'bg-[#e0e5ec] dark:bg-[#1f242e]',
                'shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff]',
                'dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d]',
                focusedField === 'password' && 'border-emerald-500/30 shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
                errors.password && 'border-[#ff3b5c] shadow-[inset_4px_4px_8px_#ffb8c4,inset_-4px_-4px_8px_#ffffff,0_0_0_1.5px_#ff3b5c] dark:shadow-[inset_4px_4px_8px_rgba(255,59,92,0.35),inset_-4px_-4px_8px_#2b313d,0_0_0_1.5px_#ff3b5c]'
              )}
            >
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="new-password"
                defaultValue={password}
                placeholder=""
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => handleFieldBlur('password')}
                className="h-full w-full rounded-[13px] bg-transparent pl-3 pr-8 pt-3 pb-0.5 text-xs font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]"
              />
              <label
                htmlFor="password"
                className={cn(
                  'pointer-events-none absolute left-3 top-1 select-none text-[10px] font-semibold transition-colors duration-200',
                  focusedField === 'password' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                  errors.password && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
                )}
              >
                {t('passwordLabel')}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9499b7] hover:text-[#3d4468] dark:text-[#7c85a1] dark:hover:text-[#e6eaf4]"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <span className="mt-0.5 block pl-2 text-[10px] font-medium text-[#ff3b5c]">{errors.password}</span>}
          </div>

          <div className="relative">
            <div
              className={cn(
                'relative h-[42px] rounded-[13px] border border-transparent transition-all duration-300',
                'bg-[#e0e5ec] dark:bg-[#1f242e]',
                'shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff]',
                'dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d]',
                focusedField === 'confirmPassword' && 'border-emerald-500/30 shadow-[inset_3px_3px_7px_#bec3cf,inset_-3px_-3px_7px_#ffffff,0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_3px_3px_7px_#14171f,inset_-3px_-3px_7px_#2b313d,0_0_0_1px_rgba(16,185,129,0.2)]',
                errors.confirmPassword && 'border-[#ff3b5c] shadow-[inset_4px_4px_8px_#ffb8c4,inset_-4px_-4px_8px_#ffffff,0_0_0_1.5px_#ff3b5c] dark:shadow-[inset_4px_4px_8px_rgba(255,59,92,0.35),inset_-4px_-4px_8px_#2b313d,0_0_0_1.5px_#ff3b5c]'
              )}
            >
              <input
                ref={confirmPasswordInputRef}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                defaultValue={confirmPassword}
                placeholder=""
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => handleFieldBlur('confirmPassword')}
                className="h-full w-full rounded-[13px] bg-transparent pl-3 pr-8 pt-3 pb-0.5 text-xs font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]"
              />
              <label
                htmlFor="confirmPassword"
                className={cn(
                  'pointer-events-none absolute left-3 top-1 select-none text-[10px] font-semibold transition-colors duration-200',
                  focusedField === 'confirmPassword' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3d4468] dark:text-[#e6eaf4]',
                  errors.confirmPassword && 'text-[#ff3b5c] dark:text-[#ff8fa3]'
                )}
              >
                {t('confirmPasswordLabel')}
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9499b7] hover:text-[#3d4468] dark:text-[#7c85a1] dark:hover:text-[#e6eaf4]"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="mt-0.5 block pl-2 text-[10px] font-medium text-[#ff3b5c]">{errors.confirmPassword}</span>}
          </div>
        </div>

        {password.length > 0 && (
          <div className="flex items-center gap-2 px-1 pt-0.5">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    i < strength.score ? strength.color : 'bg-[#c9cfda] dark:bg-[#2b313d]'
                  )}
                />
              ))}
            </div>
            <span className={cn('text-[10px] font-semibold', strength.score <= 1 ? 'text-[#ff3b5c]' : strength.score === 2 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400')}>
              {strength.label}
            </span>
          </div>
        )}

        <div>
          <label className="flex cursor-pointer select-none items-start gap-2 pt-0.5 text-[11px] text-[#6c7293] dark:text-[#aeb6cc]">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked)
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: '' }))
              }}
              className="peer sr-only"
            />
            <span
              className={cn(
                'mt-0.5 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] transition-all duration-300',
                'bg-[#e0e5ec] hover:scale-105 dark:bg-[#1f242e]',
                'shadow-[2px_2px_5px_#bec3cf,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#14171f,-2px_-2px_5px_#2b313d]',
                'peer-checked:shadow-[inset_2px_2px_4px_#bec3cf,inset_-2px_-2px_4px_#ffffff] dark:peer-checked:shadow-[inset_2px_2px_4px_#14171f,inset_-2px_-2px_4px_#2b313d]'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={cn('h-2.5 w-2.5 text-emerald-600 transition-all duration-200 dark:text-emerald-400', acceptTerms ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="leading-tight">
              {t('acceptTermsText')}{' '}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('terms')}</span> {t('and')}{' '}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('privacyPolicy')}</span>.
            </span>
          </label>
          {errors.terms && <p className="mt-0.5 pl-2 text-[10px] font-medium text-[#ff3b5c]">{errors.terms}</p>}
        </div>

        <div>
          <label className="flex cursor-pointer select-none items-start gap-2 pt-1 text-[11px] text-[#6c7293] dark:text-[#aeb6cc]">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => {
                setAiConsent(e.target.checked)
                if (e.target.checked) setErrors((prev) => ({ ...prev, aiConsent: '' }))
              }}
              className="peer sr-only"
            />
            <span
              className={cn(
                'mt-0.5 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] transition-all duration-300',
                'bg-[#e0e5ec] hover:scale-105 dark:bg-[#1f242e]',
                'shadow-[2px_2px_5px_#bec3cf,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#14171f,-2px_-2px_5px_#2b313d]',
                'peer-checked:shadow-[inset_2px_2px_4px_#bec3cf,inset_-2px_-2px_4px_#ffffff] dark:peer-checked:shadow-[inset_2px_2px_4px_#14171f,inset_-2px_-2px_4px_#2b313d]'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={cn('h-2.5 w-2.5 text-emerald-600 transition-all duration-200 dark:text-emerald-400', aiConsent ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="leading-tight">{t('aiConsentLabel')}</span>
          </label>
          {errors.aiConsent && <p className="mt-0.5 pl-2 text-[10px] font-medium text-[#ff3b5c]">{errors.aiConsent}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className={cn(
            'group relative mt-1 w-full overflow-hidden rounded-[13px] py-2 text-sm font-semibold transition-all duration-300',
            'bg-[#e0e5ec] text-[#3d4468] dark:bg-[#1f242e] dark:text-[#e6eaf4]',
            'shadow-[6px_6px_16px_#bec3cf,-6px_-6px_16px_#ffffff] dark:shadow-[6px_6px_16px_#14171f,-6px_-6px_16px_#2b313d]',
            'hover:-translate-y-0.5 hover:shadow-[10px_10px_24px_#bec3cf,-10px_-10px_24px_#ffffff] dark:hover:shadow-[10px_10px_24px_#14171f,-10px_-10px_24px_#2b313d]',
            'active:translate-y-0 active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff] dark:active:shadow-[inset_3px_3px_8px_#14171f,inset_-3px_-3px_8px_#2b313d]',
            'disabled:pointer-events-none disabled:opacity-60'
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-500 ease-out group-hover:left-full dark:via-white/10"
          />
          {loading ? (
            <span className="relative z-10 inline-flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#bec3cf] border-t-[#6c7293] dark:border-[#2b313d] dark:border-t-[#aeb6cc]" />
              {t('creatingAccount')}
            </span>
          ) : cooldown > 0 ? (
            <span className="relative z-10">{t('rateLimitedShort', { seconds: cooldown })}</span>
          ) : (
            <span className="relative z-10">{t('createAccount')}</span>
          )}
        </button>

        <div className="relative my-2 flex items-center gap-3">
          <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#bec3cf] dark:to-[#2b313d]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9499b7] dark:text-[#7c85a1]">
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
      </form>

      <p className="mt-2 text-center text-xs text-[#9499b7] dark:text-[#7c85a1]">
        {t('hasAccount')}{' '}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
        >
          {t('signIn')}
        </Link>
      </p>
    </NeuCard>
  )
}
