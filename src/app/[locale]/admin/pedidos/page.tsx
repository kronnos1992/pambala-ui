'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Store, Package, TrendingUp, MessageSquare, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminOrders, fetchAdminStoreRevenue, updateOrderStatus, updateAdminPaymentStatus, getStatusColor, type ApiOrder, type AdminStoreRevenue } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'
import { OrderDisputeChat } from '@/components/orders/order-dispute-chat'
import { OrderAuditModal } from '@/components/orders/order-audit-modal'

const statusOptions = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RECEIVED', 'CANCELLED']

export default function AdminPedidosPage() {
  const t = useTranslations('adminOrders')
  const tc = useTranslations('common')
  const ta = useTranslations('orderAudit')
  const statusLabels: Record<string, string> = {
    '': tc('all'), PENDING: t('statusPending'), CONFIRMED: t('statusConfirmed'), PROCESSING: t('statusProcessing'), SHIPPED: t('statusShipped'), DELIVERED: t('statusDelivered'), RECEIVED: t('statusReceived'), CANCELLED: t('statusCancelled'),
  }
  const [orders, setOrders] = React.useState<ApiOrder[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<AdminStoreRevenue | null>(null)
  const [status, setStatus] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = React.useState<{ orderId: string; paymentStatus: string } | null>(null)
  const [chatOrder, setChatOrder] = React.useState<ApiOrder | null>(null)
  const [auditOrder, setAuditOrder] = React.useState<ApiOrder | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminOrders({ page, limit: 15, status: status || undefined, q: search || undefined })
      .then((data) => { setOrders(data.orders); setPagination(data.pagination) })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [page, status, search, t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  React.useEffect(() => {
    fetchAdminStoreRevenue()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const topProducts = React.useMemo(() => {
    if (!stats?.stores.length) return []
    return stats.stores
      .flatMap((s) => s.topProducts.map((p) => ({ ...p, storeName: s.storeName })))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [stats])

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

  const handlePaymentConfirm = async () => {
    if (!confirmDialog) return
    setUpdatingId(confirmDialog.orderId)
    setConfirmDialog(null)
    try {
      await updateAdminPaymentStatus(confirmDialog.orderId, confirmDialog.paymentStatus)
      toast(confirmDialog.paymentStatus === 'PAID' ? t('paymentConfirmed') : t('proofRejected'), 'success')
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

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard icon={TrendingUp} label={t('kpiConfirmedRevenue')} value={formatPrice(stats.totals.revenue)} />
            <KpiCard icon={TrendingUp} label={t('kpiDeclaredRevenue')} value={formatPrice(stats.totals.declared)} />
            <KpiCard icon={Package} label={t('kpiUnits')} value={String(stats.totals.units)} />
            <KpiCard icon={Store} label={t('kpiPaidOrders')} value={String(stats.totals.confirmedOrders)} />
            <KpiCard icon={Store} label={t('kpiStoresCount')} value={String(stats.totals.storesCount)} />
          </div>

          {stats.stores.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('storeRevenueTitle')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-2">{t('store')}</th>
                        <th className="px-4 py-2 text-right">{t('confirmed')}</th>
                        <th className="px-4 py-2 text-right">{t('declared')}</th>
                        <th className="px-4 py-2 text-right">{t('ordersColumn')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {stats.stores.map((s) => (
                        <tr key={s.storeId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{s.storeName}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-emerald-700 text-right">{formatPrice(s.revenue)}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 text-right">{formatPrice(s.declared)}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 text-right">{s.ordersCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('topProductsTitle')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-2">{t('store')}</th>
                        <th className="px-4 py-2">{t('product')}</th>
                        <th className="px-4 py-2 text-right">{t('units')}</th>
                        <th className="px-4 py-2 text-right">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {topProducts.map((p) => (
                        <tr key={p.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{p.storeName}</td>
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{p.productName}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 text-right">{p.units}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatPrice(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                  <th className="px-4 py-3">{t('store')}</th>
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
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">
                      {order.stores?.length ? order.stores.map((s) => s.name).join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-300">
                      <div className="space-y-1 text-xs">
                        <div>{order.paymentMethod}</div>
                        <PaymentBadge status={order.paymentStatus || 'PENDING'} />
                        {(order.receiptImage || (order.validationStatus && order.validationStatus !== 'PENDING')) && (
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {order.validationStatus && order.validationStatus !== 'PENDING' && (
                              <ValidationBadge status={order.validationStatus} />
                            )}
                            <button
                              type="button"
                              onClick={() => setAuditOrder(order)}
                              title={ta('viewAudit')}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 cursor-pointer"
                            >
                              <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              <span>{ta('viewAudit')}</span>
                            </button>
                          </div>
                        )}
                        {order.paymentStatus === 'PAYMENT_RECEIVED' && (
                          <div className="flex gap-1 pt-1">
                            <button
                              onClick={() => setConfirmDialog({ orderId: order.id, paymentStatus: 'PAID' })}
                              disabled={updatingId === order.id}
                              title={t('confirmPaymentTitle')}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle className="h-3 w-3" /> {tc('confirm')}
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ orderId: order.id, paymentStatus: 'REJECTED' })}
                              disabled={updatingId === order.id}
                              title={t('rejectPaymentTitle')}
                              className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/40"
                            >
                              <XCircle className="h-3 w-3" /> {t('reject')}
                            </button>
                          </div>
                        )}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setChatOrder(order)}
                            title="Chat Tripartido / Mediação"
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Mediação</span>
                          </button>
                        </div>
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
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('empty')}</td></tr>
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

      <Dialog open={!!confirmDialog} onOpenChange={(open) => { if (!open) setConfirmDialog(null) }}>
        {confirmDialog && (
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  confirmDialog.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                )}>
                  {confirmDialog.paymentStatus === 'PAID' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </span>
                <DialogTitle>{confirmDialog.paymentStatus === 'PAID' ? t('confirmPaymentTitle') : t('rejectPaymentTitle')}</DialogTitle>
              </div>
            </DialogHeader>
            <DialogDescription className="mt-2">
              {confirmDialog.paymentStatus === 'PAID' ? t('confirmPaymentPrompt') : t('rejectPaymentPrompt')}
            </DialogDescription>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={updatingId !== null}>
                {tc('cancel')}
              </Button>
              <Button
                variant={confirmDialog.paymentStatus === 'PAID' ? 'default' : 'destructive'}
                onClick={handlePaymentConfirm}
                disabled={updatingId !== null}
              >
                {confirmDialog.paymentStatus === 'PAID' ? tc('confirm') : t('reject')}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {chatOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          onClick={() => setChatOrder(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setChatOrder(null)}
              className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 cursor-pointer"
              aria-label={tc('close')}
            >
              <XCircle className="h-5 w-5" />
            </button>
            <OrderDisputeChat orderId={chatOrder.id} orderNumber={chatOrder.orderNumber || chatOrder.id} />
          </div>
        </div>
      )}

      {auditOrder && (
        <OrderAuditModal
          open={!!auditOrder}
          onClose={() => setAuditOrder(null)}
          orderNumber={auditOrder.orderNumber || auditOrder.id}
          orderId={auditOrder.id}
          orderTotal={auditOrder.total}
          expectedCode={auditOrder.paymentCode}
          validationStatus={auditOrder.validationStatus}
          validationResult={auditOrder.validationResult}
          receiptImage={auditOrder.receiptImage}
          receiptAttempts={auditOrder.receiptAttempts}
          role="ADMIN"
          onOpenDispute={() => {
            const ord = auditOrder
            setAuditOrder(null)
            setChatOrder(ord)
          }}
          onModerated={() => load()}
        />
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

function KpiCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Icon className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function ValidationBadge({ status }: { status: string }) {
  const t = useTranslations('adminOrders')
  const map: Record<string, { label: string; cls: string }> = {
    AQUEUE: { label: t('valAqueue'), cls: 'bg-blue-100 text-blue-700' },
    PASS: { label: t('valValid'), cls: 'bg-emerald-100 text-emerald-700' },
    PROOF_ACCEPTED: { label: t('valValid'), cls: 'bg-emerald-100 text-emerald-700' },
    REVIEW: { label: t('valReview'), cls: 'bg-amber-100 text-amber-700' },
    MANUAL_REVIEW: { label: t('valReview'), cls: 'bg-amber-100 text-amber-700' },
    FAIL: { label: t('valSuspected'), cls: 'bg-red-100 text-red-700' },
    PROOF_REJECTED: { label: t('valSuspected'), cls: 'bg-red-100 text-red-700' },
    ERROR: { label: t('valError'), cls: 'bg-gray-100 text-gray-700' },
  }
  const st = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold', st.cls)}>{st.label}</span>
}