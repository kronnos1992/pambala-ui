'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Star } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { createReview, getApiErrorMessage } from '@/lib/api-helpers'
import { useAuthStore } from '@/store/auth-store'

interface ReviewFormProps {
  productId?: string
  storeId?: string
  onSubmitted?: () => void
}

export function ReviewForm({ productId, storeId, onSubmitted }: ReviewFormProps) {
  const t = useTranslations('reviewForm')
  const tc = useTranslations('common')
  const user = useAuthStore((s) => s.user)
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('ratingRequired'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createReview({
        rating,
        comment: comment.trim() || undefined,
        productId,
        storeId,
      })
      toast(t('submittedToast'), 'success')
      setRating(0)
      setComment('')
      onSubmitted?.()
    } catch (e) {
      setError(getApiErrorMessage(e) || t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('wantToReview')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {t('loginPrompt')}
        </p>
        <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          {t('login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {productId ? t('rateProduct') : t('rateStore')}
      </p>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1
          const active = value <= (hover || rating)
          return (
            <button
              key={value}
              type="button"
              aria-label={t('starAriaLabel', { count: value })}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={cn('h-7 w-7', active ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600')} />
            </button>
          )
        })}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('commentPlaceholder', { optional: tc('optional') })}
        rows={3}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
      <Button
        className="mt-3"
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
      >
        {submitting ? t('submitting') : t('submitReview')}
      </Button>
    </div>
  )
}