'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminOrders, updateOrderStatus, updateAdminPaymentStatus, getStatusColor, type ApiOrder } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

const statusOptions = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminPedidosPage() {
  const t = useTranslations('adminOrders')
  const tc = useTranslations('common')
  const statusLabels: Record<string, string> = {
    '': tc('all'), PENDING: t('statusPending'), CONFIRMED: t('statusConfirmed'), PROCESSING: t('statusProcessing'), SHIPPED: t('statusShipped'), DELIVERED: t('statusDelivered'), CANCELLED: t('statusCancelled'),
  }
  const [orders, setOrders] = React.useState<ApiOrder[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminOrders({ page, limit: 15, status: status || undefined, q: search || undefined })
      .then((data) => { setOrders(data.orders); setPagination(data.pagination) })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [page, status, search, t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast(t('statusUpdateSuccess'), 'success')
      load()
    } catch {
      toast(t('statusUpdateError'), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentConfirm = async (orderId: string, paymentStatus: string) => {
    if (paymentStatus === 'PAID') {
      if (!window.confirm(t('confirmPaymentPrompt'))) return
    } else {
      if (!window.confirm(t('rejectPaymentPrompt'))) return
    }
    setUpdatingId(orderId)
    try {
      await updateAdminPaymentStatus(orderId, paymentStatus)
      toast(paymentStatus === 'PAID' ? t('paymentConfirmed') : t('proofRejected'), 'success')
      load()
    } catch {
      toast(t('paymentProcessError'), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-300">{t('ordersCount', { count: pagination.total })}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <Button type="submit" size="sm">{tc('search')}</Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                status === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {statusLabels[s]}
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
                  <th className="px-4 py-3">{t('orderNumber')}</th>
                  <th className="px-4 py-3">{t('customer')}</th>
                  <th className="px-4 py-3">{t('amount')}</th>
                  <th className="px-4 py-3">{t('payment')}</th>
                  <th className="px-4 py-3">{t('province')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber || order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">{order.shippingName || order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">
                      <div className="space-y-1 text-xs">
                        <div>{order.paymentMethod}</div>
                        <PaymentBadge status={order.paymentStatus || 'PENDING'} />
                        {order.validationStatus && order.validationStatus !== 'PENDING' && (
                          <div><ValidationBadge status={order.validationStatus} /></div>
                        )}
                        {order.paymentStatus === 'PAYMENT_RECEIVED' && (
                          <div className="flex gap-1 pt-1">
                            <button
                              onClick={() => handlePaymentConfirm(order.id, 'PAID')}
                              disabled={updatingId === order.id}
                              title={t('confirmPaymentTitle')}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle className="h-3 w-3" /> {tc('confirm')}
                            </button>
                            <button
                              onClick={() => handlePaymentConfirm(order.id, 'REJECTED')}
                              disabled={updatingId === order.id}
                              title={t('rejectPaymentTitle')}
                              className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/40"
                            >
                              <XCircle className="h-3 w-3" /> {t('reject')}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">{order.shippingProvince || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={cn('text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50', getStatusColor(order.status))}
                      >
                        {statusOptions.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
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

function PaymentBadge({ status }: { status: string }) {
  const t = useTranslations('adminOrders')
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: t('payAwaitingPayment'), cls: 'bg-amber-100 text-amber-700' },
    AWAITING_PAYMENT: { label: t('payAwaitingConfirmation'), cls: 'bg-blue-100 text-blue-700' },
    PAYMENT_RECEIVED: { label: t('payDeclaredReceived'), cls: 'bg-indigo-100 text-indigo-700' },
    PAID: { label: t('payPaid'), cls: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: t('payRejected'), cls: 'bg-red-100 text-red-700' },
    CANCELLED: { label: t('statusCancelled'), cls: 'bg-red-100 text-red-700' },
  }
  const st = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold', st.cls)}>{st.label}</span>
}

function ValidationBadge({ status }: { status: string }) {
  const t = useTranslations('adminOrders')
  const map: Record<string, { label: string; cls: string }> = {
    AQUEUE: { label: t('valAqueue'), cls: 'bg-blue-100 text-blue-700' },
    PASS: { label: t('valValid'), cls: 'bg-emerald-100 text-emerald-700' },
    REVIEW: { label: t('valReview'), cls: 'bg-amber-100 text-amber-700' },
    FAIL: { label: t('valSuspected'), cls: 'bg-red-100 text-red-700' },
    ERROR: { label: t('valError'), cls: 'bg-gray-100 text-gray-700' },
  }
  const st = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold', st.cls)}>{st.label}</span>
}