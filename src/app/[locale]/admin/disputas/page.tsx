'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, ChevronLeft, ChevronRight, ShieldAlert, MessageSquare, Store, User, Clock, AlertCircle, CheckCircle2, Lock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { fetchAdminDisputes, type AdminDispute } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'
import { OrderDisputeChat } from '@/components/orders/order-dispute-chat'

const statusOptions = ['', 'OPEN', 'RESOLVED', 'CLOSED']

export default function AdminDisputasPage() {
  const t = useTranslations('adminDisputes')
  const tc = useTranslations('common')
  const statusLabels: Record<string, string> = {
    '': tc('all'), OPEN: t('statusOpen'), RESOLVED: t('statusResolved'), CLOSED: t('statusClosed'),
  }
  const [disputes, setDisputes] = React.useState<AdminDispute[]>([])
  const [stats, setStats] = React.useState<{ total: number; open: number; resolved: number; closed: number } | null>(null)
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [chatDispute, setChatDispute] = React.useState<AdminDispute | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminDisputes({ page, limit: 15, status: status || undefined, q: search || undefined })
      .then((data) => {
        setDisputes(data.disputes)
        setPagination(data.pagination)
        setStats(data.stats)
      })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [page, status, search, t])

  React.useEffect(() => { Promise.resolve().then(load) }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const getRiskBadge = (dispute: AdminDispute) => {
    const validation = dispute.order.validationStatus
    if (validation === 'FAIL' || validation === 'PROOF_REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <ShieldAlert className="h-3 w-3" />
          {t('highRisk')}
        </span>
      )
    }
    if (validation === 'REVIEW' || validation === 'MANUAL_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-3 w-3" />
          {t('mediumRisk')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        <CheckCircle2 className="h-3 w-3" />
        {t('lowRisk')}
      </span>
    )
  }

  const getStatusBadge = (disputeStatus: string) => {
    if (disputeStatus === 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          {t('statusResolved')}
        </span>
      )
    }
    if (disputeStatus === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Lock className="h-3 w-3" />
          {t('statusClosed')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <AlertCircle className="h-3 w-3" />
        {t('statusOpen')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-300">{t('disputesCount', { count: pagination.total })}</span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={ShieldAlert} label={t('kpiTotalDisputes')} value={String(stats.total)} accent="text-amber-600" />
          <KpiCard icon={AlertCircle} label={t('kpiOpen')} value={String(stats.open)} accent="text-amber-600" />
          <KpiCard icon={CheckCircle2} label={t('kpiResolved')} value={String(stats.resolved)} accent="text-emerald-600" />
          <KpiCard icon={Lock} label={t('kpiClosed')} value={String(stats.closed)} accent="text-gray-500" />
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
                  <th className="px-4 py-3">{t('client')}</th>
                  <th className="px-4 py-3">{t('seller')}</th>
                  <th className="px-4 py-3">{t('reason')}</th>
                  <th className="px-4 py-3">{t('riskScore')}</th>
                  <th className="px-4 py-3">{t('messages')}</th>
                  <th className="px-4 py-3">{t('lastActivity')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {dispute.orderNumber || dispute.order.orderNumber || dispute.orderId}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(dispute.order.createdAt).toLocaleDateString('pt-AO')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                            {dispute.client?.name || dispute.order.shippingName || 'N/A'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{dispute.order.shippingProvince || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shrink-0">
                          <Store className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                            {dispute.seller?.storeName || dispute.seller?.name || 'N/A'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{formatPrice(dispute.order.total)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={dispute.reason}>
                        {dispute.reason}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getRiskBadge(dispute)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dispute.messagesCount}</span>
                        {dispute.unreadMessages > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            {dispute.unreadMessages}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <Clock className="h-3 w-3 shrink-0" />
                        {new Date(dispute.updatedAt).toLocaleString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {dispute.lastMessage && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px] mt-0.5">
                          {dispute.lastMessage.content}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(dispute.status)}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setChatDispute(dispute)}
                        className="whitespace-nowrap"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                        {t('openChat')}
                      </Button>
                    </td>
                  </tr>
                ))}
                {disputes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <ShieldAlert className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('emptyHint')}</p>
                    </td>
                  </tr>
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

      {chatDispute && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          onClick={() => setChatDispute(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setChatDispute(null)}
              className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 cursor-pointer"
              aria-label={tc('close')}
            >
              <XCircle className="h-5 w-5" />
            </button>
            <OrderDisputeChat orderId={chatDispute.orderId} orderNumber={chatDispute.orderNumber || chatDispute.order.orderNumber} />
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, accent = 'text-emerald-600' }: { icon: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Icon className={cn('h-4 w-4', accent)} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}