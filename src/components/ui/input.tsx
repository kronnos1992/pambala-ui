'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  floating?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, icon, floating, value, ...props }, ref) => {
    const t = useTranslations('input')
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const [focused, setFocused] = React.useState(false)
    const hasValue = typeof value === 'string' && value.length > 0
    const active = floating && (focused || hasValue)

    if (floating) {
      return (
        <div className="w-full">
          <div
            className={cn(
              'relative h-[60px] rounded-[15px] transition-all duration-300',
            'bg-[#e0e5ec] dark:bg-[#1f242e]',
            'shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]',
            'dark:shadow-[inset_8px_8px_16px_#14171f,inset_-8px_-8px_16px_#2b313d]',
            focused &&
              'shadow-[inset_4px_4px_8px_#bec3cf,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#14171f,inset_-4px_-4px_8px_#2b313d]',
            error &&
              'shadow-[inset_8px_8px_16px_#ffb8c4,inset_-8px_-8px_16px_#ffffff,0_0_0_2px_#ff3b5c] dark:shadow-[inset_8px_8px_16px_rgba(255,59,92,0.45),inset_-8px_-8px_16px_#2b313d,0_0_0_2px_#ff3b5c]'
            )}
          >
            {icon && (
              <span
                className={cn(
                  'pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300',
                  focused ? 'text-[#6c7293] dark:text-[#aeb6cc]' : 'text-[#9499b7] dark:text-[#7c85a1]'
                )}
              >
                {icon}
              </span>
            )}
            <input
              {...props}
              type={type}
              id={inputId}
              ref={ref}
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
                'h-full w-full bg-transparent pt-5 pb-5 text-[16px] font-medium text-[#3d4468] outline-none dark:text-[#e6eaf4]',
                icon ? 'pl-14 pr-6' : 'px-6',
                className
              )}
            />
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute transition-all duration-300',
                icon ? 'left-[3.4rem]' : 'left-6',
                active || error
                  ? cn(
                      'top-2 text-xs font-medium',
                      error ? 'text-[#ff3b5c]' : 'text-[#6c7293] dark:text-[#aeb6cc]'
                    )
                  : 'top-1/2 -translate-y-1/2 text-[16px] text-[#9499b7] dark:text-[#7c85a1]'
              )}
            >
              {label || t('field')}
            </label>
          </div>
          {error && (
            <p className="mt-1.5 pl-2 text-xs font-medium text-[#ff3b5c]">{error}</p>
          )}
        </div>
      )
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </span>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 text-sm text-gray-950 dark:text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50',
              icon ? 'pl-10 pr-4' : 'pl-4 pr-4',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }