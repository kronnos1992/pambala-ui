'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, ChevronLeft, ChevronRight, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminProducts, toggleProductActive, deleteProduct, type ApiProduct } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

export default function AdminProductsPage() {
  const t = useTranslations('adminProducts')
  const tc = useTranslations('common')
  const [products, setProducts] = React.useState<ApiProduct[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminProducts({ page, limit: 15, q: search || undefined, active: active || undefined })
      .then((data) => { setProducts(data.products); setPagination(data.pagination) })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [page, active, search, t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleToggleActive = async (productId: string) => {
    try {
      await toggleProductActive(productId)
      toast(t('toggleActiveSuccess'), 'success')
      load()
    } catch {
      toast(t('toggleActiveError'), 'error')
    }
  }

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(t('deleteConfirm', { name }))) return
    try {
      await deleteProduct(productId)
      toast(t('deleteSuccess'), 'success')
      load()
    } catch {
      toast(t('deleteError'), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">{t('title')}</h1>
        <span className="text-sm text-gray-600 dark:text-gray-200">{t('productsCount', { count: pagination.total })}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <Button type="submit" size="sm">{tc('search')}</Button>
        </form>
        <div className="flex gap-2">
          {['', 'true', 'false'].map((v) => (
            <button
              key={v}
              onClick={() => { setActive(v); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                active === v ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {v === '' ? tc('all') : v === 'true' ? t('filterActive') : t('filterInactive')}
            </button>
          ))}
        </div>
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
                  <th className="px-4 py-3">{t('product')}</th>
                  <th className="px-4 py-3">{t('store')}</th>
                  <th className="px-4 py-3">{t('category')}</th>
                  <th className="px-4 py-3">{t('price')}</th>
                  <th className="px-4 py-3">{t('stock')}</th>
                  <th className="px-4 py-3">{t('rating')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-950 dark:text-white max-w-[200px] truncate">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">{product.store?.name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-200">{product.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-950 dark:text-white">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">{product.stock}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">
                      {(product.avgRating ?? 0) > 0 ? `${(product.avgRating ?? 0).toFixed(1)} ⭐` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product.id)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
                          product.isActive ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60'
                        )}
                      >
                        {product.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {product.isActive ? t('active') : t('inactive')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="rounded-md p-1.5 text-gray-400 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-200">{t('pageInfo', { page: pagination.page, totalPages: pagination.totalPages })}</p>
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