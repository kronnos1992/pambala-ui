'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { use } from 'react'
import { ChevronRight, MapPin, CreditCard, CheckCircle, XCircle, FileCheck, User } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchOrderById, updateOrderPaymentStatus, paymentLabels, type ApiOrder } from '@/lib/api-helpers'

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('sellerOrderDetail')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const [order, setOrder] = React.useState<ApiOrder | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState(false)
  const [viewingReceipt, setViewingReceipt] = React.useState(false)

  const load = React.useCallback(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const handleConfirmPayment = async () => {
    if (!order) return
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
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(true)}
                        className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in hover:opacity-90 transition-opacity"
                        title={t('receipt.open')}
                      >
                        <Image
                          src={order.receiptImage}
                          alt={t('receipt.alt')}
                          width={320}
                          height={320}
                          unoptimized
                          loading="lazy"
                          className="object-cover"
                        />
                      </button>

                      {order.validationStatus && order.validationStatus !== 'PENDING' && (
                        <ValidationBadge status={order.validationStatus} t={t} />
                      )}

                      {order.paymentStatus !== 'PAID' && order.paymentStatus !== 'PAYMENT_RECEIVED' ? (
                        <div className="space-y-2 pt-1">
                          <Button className="w-full" onClick={handleConfirmPayment} disabled={acting}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {acting ? t('processingAction') : t('declaredPaymentReceived')}
                          </Button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {t('finalConfirmationNote')}
                          </p>
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
            <Image
              src={order.receiptImage}
              alt={t('receipt.lightboxAlt')}
              width={1200}
              height={900}
              unoptimized
              className="max-h-[90vh] w-full rounded-lg object-contain bg-white"
            />
          </div>
        </div>
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
    PASS: { key: 'validation.pass', cls: 'bg-emerald-100 text-emerald-700' },
    REVIEW: { key: 'validation.review', cls: 'bg-amber-100 text-amber-700' },
    FAIL: { key: 'validation.fail', cls: 'bg-red-100 text-red-700' },
    ERROR: { key: 'validation.error', cls: 'bg-gray-100 text-gray-700' },
  }
  const st = map[status] || { key: '', cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', st.cls)}>
      {st.key ? t(st.key) : status}
    </span>
  )
}