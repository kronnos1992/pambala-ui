'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchSellerOrders, type UiOrder, getStatusLabel, getStatusColor, paymentLabels } from '@/lib/api-helpers'

export default function VendorOrdersPage() {
  const t = useTranslations('sellerOrders')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const [filter, setFilter] = React.useState('all')
  const [orders, setOrders] = React.useState<UiOrder[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(() => {
    fetchSellerOrders({ limit: 100 })
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">{t('vendorDashboard')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{t('title')}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pageTitle')}</h1>
        <Link href="/vendedor">
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {tc('back')}
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: t('filters.all') },
          { value: 'pending', label: t('filters.pending') },
          { value: 'confirmed', label: t('filters.confirmed') },
          { value: 'processing', label: t('filters.processing') },
          { value: 'shipped', label: t('filters.shipped') },
          { value: 'delivered', label: t('filters.delivered') },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3">{t('header.order')}</th>
                <th className="px-6 py-3">{t('header.customer')}</th>
                <th className="px-6 py-3">{t('header.payment')}</th>
                <th className="px-6 py-3">{t('header.amount')}</th>
                <th className="px-6 py-3">{t('header.status')}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.shippingName || tc('notFound')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {paymentLabels[order.paymentMethod || ''] || order.paymentMethod || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</td>
                  <td className="px-6 py-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/vendedor/pedidos/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      {t('view')}
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">{t('noOrdersFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}