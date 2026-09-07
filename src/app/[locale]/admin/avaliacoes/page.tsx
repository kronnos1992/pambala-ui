'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchAdminReviews, deleteReview, type ApiReview } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

export default function AdminReviewsPage() {
  const t = useTranslations('adminReviews')
  const [reviews, setReviews] = React.useState<ApiReview[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminReviews({ page, limit: 20 })
      .then((data) => { setReviews(data.reviews); setPagination(data.pagination) })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [page, t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      await deleteReview(reviewId)
      toast(t('deleteSuccess'), 'success')
      load()
    } catch {
      toast(t('deleteError'), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-300">{t('reviewsCount', { count: pagination.total })}</span>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">{t('user')}</th>
                  <th className="px-4 py-3">{t('product')}</th>
                  <th className="px-4 py-3">{t('store')}</th>
                  <th className="px-4 py-3">{t('rating')}</th>
                  <th className="px-4 py-3">{t('comment')}</th>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{review.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200 max-w-[150px] truncate">{review.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">{review.store?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-400')}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300 max-w-[200px] truncate">
                      {review.comment || <span className="italic dark:text-gray-400">{t('noComment')}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">{new Date(review.createdAt).toLocaleDateString('pt-AO')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-200">{t('pageInfo', { page: pagination.page, totalPages: pagination.totalPages })}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}