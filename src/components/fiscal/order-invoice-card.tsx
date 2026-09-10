'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileCheck, FileText, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import {
  fetchOrderInvoice,
  emitOrderInvoice,
  refreshInvoiceAgtStatus,
  formatAoaCents,
  type ApiInvoice,
} from '@/lib/api-helpers'

const AGT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  VALID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  INVALID: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
}

function AgtStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      AGT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    )}>
      {t(`status.${status}`)}
    </span>
  )
}

export function OrderInvoiceCard({ orderId }: { orderId: string }) {
  const t = useTranslations('orderInvoice')
  const tc = useTranslations('common')
  const [invoices, setInvoices] = React.useState<ApiInvoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState(false)
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    fetchOrderInvoice(orderId)
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  React.useEffect(() => {
    load()
  }, [load])

  const invoice = invoices[0] || null

  const handleEmit = async () => {
    setActing(true)
    try {
      const result = await emitOrderInvoice(orderId)
      setInvoices([result.invoice])
      toast(result.created ? t('emitSuccess') : t('alreadyEmitted'), 'success')
    } catch {
      toast(t('emitError'), 'error')
      load()
    } finally {
      setActing(false)
    }
  }

  const handleRefresh = async (target: ApiInvoice) => {
    setRefreshingId(target.id)
    try {
      const result = await refreshInvoiceAgtStatus(target.id)
      setInvoices((prev) => prev.map((inv) => (inv.id === target.id ? result.invoice : inv)))
      if (result.message && !result.refreshed) {
        toast(result.message, 'success')
      } else {
        toast(t('refreshDone'), 'success')
      }
    } catch {
      toast(t('refreshError'), 'error')
    } finally {
      setRefreshingId(null)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileCheck className="h-5 w-5 text-emerald-600" />
        {t('title')}
      </h2>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      ) : !invoice ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('noInvoice')}</p>
          <Button className="w-full" onClick={handleEmit} disabled={acting}>
            <FileText className="h-4 w-4 mr-2" />
            {acting ? t('emitting') : t('emit')}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('emitHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('documentNo')}</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-white truncate" title={invoice.documentNo}>
                {invoice.documentNo}
              </p>
            </div>
            <AgtStatusBadge status={invoice.agtStatus} t={t} />
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('issuedOn')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Intl.DateTimeFormat('pt-AO').format(new Date(invoice.issueDate))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatAoaCents(invoice.subtotal)} {tc('currency')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('iva')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatAoaCents(invoice.taxTotal)} {tc('currency')}</span>
            </div>
            <div className="flex justify-between text-base border-t border-gray-100 dark:border-gray-700 pt-2">
              <span className="font-semibold text-gray-900 dark:text-white">{tc('total')}</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatAoaCents(invoice.total)} {tc('currency')}</span>
            </div>
          </div>

          {invoice.agtRequestId === 'dev-offline' && (
            <p className="text-xs text-amber-600 dark:text-amber-400">{t('offlineNote')}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh(invoice)}
              disabled={refreshingId === invoice.id || invoice.agtStatus === 'FAILED'}
            >
              <RefreshCw className={cn('h-4 w-4 mr-1.5', refreshingId === invoice.id && 'animate-spin')} />
              {refreshingId === invoice.id ? t('refreshing') : t('refresh')}
            </Button>
            {invoice.qrUrl && (
              <a href={invoice.qrUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  {t('qrOpen')}
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}