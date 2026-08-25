'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Trash2, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchAdminReviews, deleteReview } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<any[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminReviews({ page, limit: 20 })
      .then((data) => { setReviews(data.reviews); setPagination(data.pagination) })
      .catch(() => toast('Erro ao carregar avaliacoes', 'error'))
      .finally(() => setLoading(false))
  }, [page])

  React.useEffect(() => { load() }, [load])

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Eliminar esta avaliacao?')) return
    try {
      await deleteReview(reviewId)
      toast('Avaliacao eliminada', 'success')
      load()
    } catch {
      toast('Erro ao eliminar avaliacao', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerir Avaliacoes</h1>
        <span className="text-sm text-gray-500">{pagination.total} avaliacoes</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Utilizador</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Classificacao</th>
                  <th className="px-4 py-3">Comentario</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{review.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{review.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{review.store?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                      {review.comment || <span className="italic">Sem comentario</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-AO')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhuma avaliacao encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Pagina {pagination.page} de {pagination.totalPages}</p>
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
