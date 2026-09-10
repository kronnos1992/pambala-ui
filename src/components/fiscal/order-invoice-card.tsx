'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileCheck, FileDown, FileText, RefreshCw, ExternalLink, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import {
  fetchOrderInvoice,
  emitOrderInvoice,
  refreshInvoiceAgtStatus,
  fetchInvoicePdf,
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

export function OrderInvoiceCard({ orderId, readOnly = false }: { orderId: string; readOnly?: boolean }) {
  const t = useTranslations('orderInvoice')
  const tc = useTranslations('common')
  const [invoices, setInvoices] = React.useState<ApiInvoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState(false)
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = React.useState(false)
  const pdfUrlRef = React.useRef<string | null>(null)

  const load = React.useCallback(() => {
    fetchOrderInvoice(orderId)
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [])

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

  const handleViewPdf = async (target: ApiInvoice) => {
    setPdfLoading(true)
    try {
      const blob = await fetchInvoicePdf(target.id)
      const url = URL.createObjectURL(blob)
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
      pdfUrlRef.current = url
      setPdfUrl(url)
    } catch {
      toast(t('pdfOpenError'), 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  const closePdf = () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current)
      pdfUrlRef.current = null
    }
    setPdfUrl(null)
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
        readOnly ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('noInvoice')}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('noInvoice')}</p>
            <Button className="w-full" onClick={handleEmit} disabled={acting}>
              <FileText className="h-4 w-4 mr-2" />
              {acting ? t('emitting') : t('emit')}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('emitHint')}</p>
          </div>
        )
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
              onClick={() => handleViewPdf(invoice)}
              disabled={pdfLoading}
              className="text-emerald-700 dark:text-emerald-400"
            >
              <FileDown className="h-4 w-4 mr-1.5" />
              {pdfLoading ? t('pdfLoading') : t('viewPdf')}
            </Button>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefresh(invoice)}
                disabled={refreshingId === invoice.id || invoice.agtStatus === 'FAILED'}
              >
                <RefreshCw className={cn('h-4 w-4 mr-1.5', refreshingId === invoice.id && 'animate-spin')} />
                {refreshingId === invoice.id ? t('refreshing') : t('refresh')}
              </Button>
            )}
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

      {pdfUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closePdf}
        >
          <div className="relative max-h-[92vh] max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white truncate">{invoice?.documentNo}</span>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  download={`${invoice?.documentNo || 'fatura'}.pdf`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-white shadow"
                >
                  <Download className="h-4 w-4" />
                  {t('pdfDownload')}
                </a>
                <button
                  type="button"
                  onClick={closePdf}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 cursor-pointer"
                  aria-label={tc('close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              title={`${invoice?.documentNo || 'fatura'}.pdf`}
              className="h-[82vh] w-full rounded-lg bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}