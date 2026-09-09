'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { use } from 'react'
import { ChevronRight, MapPin, CreditCard, CheckCircle, XCircle, FileCheck, User, Eye, FileText, MessageSquare, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn, isPdfUrl, receiptDisplayUrl } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchSellerOrderById, updateOrderPaymentStatus, paymentLabels, type ApiOrder } from '@/lib/api-helpers'
import { OrderDisputeChat } from '@/components/orders/order-dispute-chat'
import { OrderAuditModal } from '@/components/orders/order-audit-modal'

function fileName(url: string): string {
  const base = url.split(/[?#]/)[0].split('/').pop() || 'comprovativo'
  try {
    return decodeURIComponent(base)
  } catch {
    return base
  }
}

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('sellerOrderDetail')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const ta = useTranslations('orderAudit')
  const [order, setOrder] = React.useState<ApiOrder | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState(false)
  const [viewingReceipt, setViewingReceipt] = React.useState(false)
  const [viewingDisputeChat, setViewingDisputeChat] = React.useState(false)
  const [viewingAuditModal, setViewingAuditModal] = React.useState(false)

  const load = React.useCallback(() => {
    fetchSellerOrderById(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const isReceiptRejected =
    order?.validationStatus === 'PROOF_REJECTED' ||
    order?.validationStatus === 'FAIL' ||
    order?.paymentStatus === 'REJECTED'

  const handleConfirmPayment = async () => {
    if (!order || isReceiptRejected) return
    setActing(true)
    try {
      await updateOrderPaymentStatus(order.id, 'PAYMENT_RECEIVED')
      toast(t('paymentDeclaredSuccess'), 'success')
      load()
    } catch {
      toast(t('paymentDeclaredError'), 'error')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
          <div className="h-8 bg-gray-100 rounded w-40 mb-8" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('orderNotFound')}</h1>
        <Link href="/vendedor/pedidos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">{t('backToOrders')}</Link>
      </div>
    )
  }

  const items = (order.items || []).map((item) => ({
    name: item.product?.name || t('defaultProductName'),
    price: item.price,
    quantity: item.quantity,
    image: Array.isArray(item.product?.images) ? item.product?.images[0] : (item.product?.images || ''),
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">{t('vendorDashboard')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor/pedidos" className="hover:text-emerald-600 transition-colors">{t('orders')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('orderTitle', { id: order.id })}</h1>
        <Link href="/vendedor/pedidos">
          <Button variant="outline" size="sm">{tc('back')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('orderItems')}</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <Image src={item.image} alt={item.name} width={56} height={56} unoptimized loading="lazy" className="rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">{t('quantity', { count: item.quantity })}</p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} {tc('currency')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t('noItems')}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('customer')}</h2>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.shippingName}</p>
                <p className="text-gray-600 dark:text-gray-400">{order.shippingPhone}</p>
                <p className="text-gray-600 dark:text-gray-400 flex items-start gap-1 mt-1">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  {order.shippingAddress}{order.shippingDistrict ? `, ${order.shippingDistrict}` : ''}, {order.shippingProvince}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('summary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('shipping')}</span>
                <span className="font-medium text-emerald-600">{t('free')}</span>
              </div>
              <hr className="my-2 border-gray-100 dark:border-gray-700" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900 dark:text-white">{tc('total')}</span>
                <span className="font-bold text-emerald-700">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              {t('paymentTitle')}
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('method')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('amount')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</span>
              </div>
              {order.paymentCode && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-gray-400">{t('paymentCodeExpected')}</span>
                  <span className="font-mono font-bold text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                    {order.paymentCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-400">{t('status')}</span>
                <PaymentStatusBadge status={order.paymentStatus || 'PENDING'} t={t} />
              </div>

              {order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {order.receiptImage ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <FileCheck className="h-4 w-4 text-emerald-600" /> {t('receipt.customerReceipt')}
                      </p>
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
                        <span className="flex items-center gap-2 min-w-0 text-sm font-medium text-gray-700 dark:text-gray-200">
                          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="truncate" title={fileName(order.receiptImage)}>{fileName(order.receiptImage)}</span>
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setViewingReceipt(true)} className="shrink-0">
                          <Eye className="h-4 w-4 mr-1.5" />
                          {t('receipt.open')}
                        </Button>
                      </div>

                      {order.validationStatus && order.validationStatus !== 'PENDING' && (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ValidationBadge status={order.validationStatus} t={t} />
                            {(() => {
                              try {
                                const vr = typeof order.validationResult === 'string' ? JSON.parse(order.validationResult) : order.validationResult
                                if (!vr || typeof vr.score !== 'number') return null
                                const isPass = vr.status === 'PROOF_ACCEPTED' || vr.score >= 90
                                const isFail = vr.status === 'PROOF_REJECTED' || vr.score < 70
                                return (
                                  <span className={cn(
                                    'px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border',
                                    isPass ? 'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300' :
                                    isFail ? 'bg-red-100 border-red-200 text-red-800 dark:bg-red-950/60 dark:border-red-800 dark:text-red-300' :
                                    'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                                  )}>
                                    Score: {vr.score}/100
                                  </span>
                                )
                              } catch {
                                return null
                              }
                            })()}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingAuditModal(true)}
                            className="shrink-0 h-7 text-xs cursor-pointer border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                            {ta('viewAudit')}
                          </Button>
                        </div>
                      )}

                      {order.paymentStatus !== 'PAID' && order.paymentStatus !== 'PAYMENT_RECEIVED' ? (
                        <div className="space-y-2 pt-1">
                          <Button
                            className="w-full"
                            onClick={handleConfirmPayment}
                            disabled={acting || isReceiptRejected}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {acting ? t('processingAction') : t('declaredPaymentReceived')}
                          </Button>
                          {isReceiptRejected ? (
                            <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                              {t('receiptRejectedNote')}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              {t('finalConfirmationNote')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className={cn(
                          'text-sm font-medium flex items-center gap-1 pt-1',
                          order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-indigo-600'
                        )}>
                          <CheckCircle className="h-4 w-4" />
                          {order.paymentStatus === 'PAID' ? t('paymentConfirmed') : t('paymentDeclaredAwaiting')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('awaitingReceipt')}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
                  onClick={() => setViewingDisputeChat(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  {t('openDisputeChat')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewingReceipt && order?.receiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setViewingReceipt(false)}
        >
          <div className="relative max-h-[90vh] max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setViewingReceipt(false)}
              className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
              aria-label={tc('close')}
            >
              <XCircle className="h-5 w-5" />
            </button>
            {isPdfUrl(order.receiptImage) ? (
              <iframe
                src={receiptDisplayUrl(order.receiptImage)}
                title={t('receipt.lightboxAlt')}
                className="h-[80vh] w-full rounded-lg bg-white"
              />
            ) : (
              <Image
                src={receiptDisplayUrl(order.receiptImage)}
                alt={t('receipt.lightboxAlt')}
                width={1200}
                height={900}
                unoptimized
                className="max-h-[90vh] w-full rounded-lg object-contain bg-white"
              />
            )}
          </div>
        </div>
      )}

      {viewingDisputeChat && order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          onClick={() => setViewingDisputeChat(false)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewingDisputeChat(false)}
              className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100 cursor-pointer"
              aria-label={tc('close')}
            >
              <XCircle className="h-5 w-5" />
            </button>
            <OrderDisputeChat orderId={order.id} orderNumber={order.orderNumber || order.id} />
          </div>
        </div>
      )}

      {viewingAuditModal && order && (
        <OrderAuditModal
          open={viewingAuditModal}
          onClose={() => setViewingAuditModal(false)}
          orderNumber={order.orderNumber || order.id}
          orderTotal={order.total}
          expectedCode={order.paymentCode}
          validationStatus={order.validationStatus}
          validationResult={order.validationResult}
          receiptImage={order.receiptImage}
          receiptAttempts={order.receiptAttempts}
          role="SELLER"
          onOpenDispute={() => {
            setViewingAuditModal(false)
            setViewingDisputeChat(true)
          }}
        />
      )}
    </div>
  )
}

function PaymentStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const map: Record<string, { key: string; cls: string }> = {
    PENDING: { key: 'paymentStatus.awaitingPayment', cls: 'bg-amber-100 text-amber-700' },
    AWAITING_PAYMENT: { key: 'paymentStatus.awaitingConfirmation', cls: 'bg-blue-100 text-blue-700' },
    PAYMENT_RECEIVED: { key: 'paymentStatus.receivedBySeller', cls: 'bg-indigo-100 text-indigo-700' },
    PAID: { key: 'paymentStatus.paid', cls: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { key: 'paymentStatus.rejected', cls: 'bg-red-100 text-red-700' },
    CANCELLED: { key: 'paymentStatus.cancelled', cls: 'bg-red-100 text-red-700' },
  }
  const st = map[status] || { key: '', cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', st.cls)}>
      {st.key ? t(st.key) : status}
    </span>
  )
}

function ValidationBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const map: Record<string, { key: string; cls: string }> = {
    AQUEUE: { key: 'validation.aqueue', cls: 'bg-blue-100 text-blue-700' },
    PASS: { key: 'validation.proofAccepted', cls: 'bg-emerald-100 text-emerald-700' },
    PROOF_ACCEPTED: { key: 'validation.proofAccepted', cls: 'bg-emerald-100 text-emerald-700' },
    REVIEW: { key: 'validation.manualReview', cls: 'bg-amber-100 text-amber-700' },
    MANUAL_REVIEW: { key: 'validation.manualReview', cls: 'bg-amber-100 text-amber-700' },
    FAIL: { key: 'validation.proofRejected', cls: 'bg-red-100 text-red-700' },
    PROOF_REJECTED: { key: 'validation.proofRejected', cls: 'bg-red-100 text-red-700' },
    ERROR: { key: 'validation.error', cls: 'bg-gray-100 text-gray-700' },
  }
  const st = map[status] || { key: '', cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', st.cls)}>
      {st.key ? t(st.key) : status}
    </span>
  )
}