'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  floating?: boolean
}

export function PasswordInput({ label, error, className, id, floating, value, ...props }: PasswordInputProps) {
  const t = useTranslations('passwordInput')
  const [visible, setVisible] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const hasValue = typeof value === 'string' && value.length > 0
  const active = floating && (focused || hasValue)

  const resolvedLabel = label ?? t('defaultLabel')

  if (floating) {
    return (
      <div className="w-full">
        <div
          className={cn(
            'relative h-[60px] rounded-[15px] transition-all duration-300',
            'bg-[#d8dde7] dark:bg-[#262c38]',
            'shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] dark:shadow-[8px_8px_20px_#14171f,-8px_-8px_20px_#2b313d]',
            focused &&
              'shadow-[inset_4px_4px_10px_#bec3cf,inset_-4px_-4px_10px_#ffffff] dark:shadow-[inset_4px_4px_10px_#14171f,inset_-4px_-4px_10px_#2b313d]',
            error &&
              'shadow-[inset_4px_4px_10px_#bec3cf,inset_-4px_-4px_10px_#ffffff,0_0_0_2px_#ff3b5c] dark:shadow-[inset_4px_4px_10px_#14171f,inset_-4px_-4px_10px_#2b313d,0_0_0_2px_#ff3b5c]'
          )}
        >
          <Lock
            className={cn(
              'pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300',
              focused ? 'text-[#6c7293] dark:text-[#aeb6cc]' : 'text-[#9499b7] dark:text-[#7c85a1]'
            )}
          />
          <input
            {...props}
            id={id}
            type={visible ? 'text' : 'password'}
            value={value}
            placeholder=" "
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'h-full w-full bg-transparent pt-5 pb-5 pl-14 pr-14 text-[16px] font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]',
              className
            )}
          />
          <label
            htmlFor={id}
            className={cn(
              'pointer-events-none absolute left-[3.4rem] transition-all duration-300',
              active || error
                ? cn(
                    'top-2 text-xs font-medium',
                    error ? 'text-[#ff3b5c]' : 'text-[#6c7293] dark:text-[#aeb6cc]'
                  )
                : 'top-1/2 -translate-y-1/2 text-[16px] text-[#9499b7] dark:text-[#7c85a1]'
            )}
          >
            {resolvedLabel}
          </label>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t('hidePassword') : t('showPassword')}
            className={cn(
              'absolute right-[15px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[10px] transition-all duration-300',
              'bg-[#e0e5ec] text-[#9499b7] dark:bg-[#1f242e] dark:text-[#7c85a1]',
              'shadow-[4px_4px_10px_#bec3cf,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#14171f,-4px_-4px_10px_#2b313d]',
              'hover:scale-105 hover:text-[#6c7293] dark:hover:text-[#aeb6cc]',
              'active:shadow-[inset_2px_2px_5px_#bec3cf,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_5px_#14171f,inset_-2px_-2px_5px_#2b313d]'
            )}
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 pl-2 text-xs font-medium text-[#ff3b5c]">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {resolvedLabel && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {resolvedLabel}
        </label>
      )}
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(
            'flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-11 text-sm text-gray-950 dark:text-white transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}
