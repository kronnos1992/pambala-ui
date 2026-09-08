'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Upload, FileCheck, X, Copy } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn, isPdfUrl, receiptDisplayUrl } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchOrderById, mapStatus, uploadOrderReceipt, uploadFile, paymentLabels, type ApiOrder } from '@/lib/api-helpers'

const timelineIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

function firstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) return images[0] as string
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : ''
    } catch {
      return ''
    }
  }
  return ''
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('orderDetail')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const { id } = use(params)
  const [order, setOrder] = React.useState<ApiOrder | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [viewingReceipt, setViewingReceipt] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !order) return
    setUploading(true)
    try {
      const { url } = await uploadFile(file)
      const updated = await uploadOrderReceipt(order.id, url)
      setOrder(updated)
      toast(t('receiptUploaded'), 'success')
    } catch {
      toast(t('receiptError'), 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const paymentDetails = React.useMemo(() => {
    if (!order?.paymentDetails) return null
    try { return JSON.parse(order.paymentDetails) } catch { return null }
  }, [order])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
          <div className="h-8 bg-gray-100 rounded w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-64" />
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-48" />
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-40" />
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notFound')}</h1>
        <Link href="/minha-conta/pedidos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">{t('backToOrders')}</Link>
      </div>
    )
  }

  const orderStatus = mapStatus(order.status)
  const currentStepIndex = statusSteps.indexOf(orderStatus)

  const items = (order.items || []).map((item) => ({
    name: item.product?.name || t('productFallback'),
    price: item.price,
    quantity: item.quantity,
    image: firstImage(item.product?.images) || 'https://placehold.co/100x100/f0fdf4/166534?text=Produto',
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/minha-conta" className="hover:text-emerald-600 transition-colors">{tr('myAccount')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/minha-conta/pedidos" className="hover:text-emerald-600 transition-colors">{tr('orders')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title', { id: order.id })}</h1>
        <Link href="/minha-conta/pedidos">
          <Button variant="outline" size="sm">{tc('back')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('statusTitle')}</h2>
            <div className="space-y-0">
              {statusSteps.map((step, i) => {
                const label = t(`status.${step}`)
                const Icon = timelineIcons[step] || Clock
                const completed = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        completed ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400',
                        isCurrent && 'ring-2 ring-emerald-200'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={cn('w-0.5 flex-1 my-1', completed ? 'bg-emerald-600' : 'bg-gray-200')} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={cn('font-medium', completed ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>{label}</p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('itemsTitle')}</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Image src={item.image} alt={item.name} width={64} height={64} unoptimized loading="lazy" className="rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">{t('quantity', { quantity: item.quantity })}</p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} {tc('currency')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t('noItems')}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('summaryTitle')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span className="font-medium">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('shipping')}</span>
                <span className="font-medium text-emerald-600">{t('shippingFree')}</span>
              </div>
              <hr className="my-2 border-gray-100" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">{tc('total')}</span>
                <span className="font-bold text-emerald-700">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shipping')}</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{order.shippingName || 'N/A'}</p>
              <p className="text-gray-600 flex items-start gap-1">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {order.shippingAddress}{order.shippingDistrict ? `, ${order.shippingDistrict}` : ''}, {order.shippingProvince}
              </p>
              <p className="text-gray-600">{order.shippingPhone}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              {t('paymentTitle')}
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('paymentMethod')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              {paymentDetails && paymentDetails.type !== 'CASH_ON_DELIVERY' && (
                <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                  {paymentDetails.phone && <PaymentRow label={t('payment.phone')} value={paymentDetails.phone} />}
                  {paymentDetails.ownerName && <PaymentRow label={t('payment.ownerName')} value={paymentDetails.ownerName} />}
                  {paymentDetails.bankName && <PaymentRow label={t('payment.bankName')} value={paymentDetails.bankName} />}
                  {paymentDetails.iban && <PaymentRow label={t('payment.iban')} value={paymentDetails.iban} />}
                  {paymentDetails.bankAccount && <PaymentRow label={t('payment.accountNumber')} value={paymentDetails.bankAccount} />}
                  {paymentDetails.entity && <PaymentRow label={t('payment.entity')} value={paymentDetails.entity} />}
                  {paymentDetails.reference && <PaymentRow label={t('payment.reference')} value={paymentDetails.reference} />}
                </div>
              )}

              {order.paymentCode && order.paymentStatus !== 'PAID' && (
                <div className="mt-3 p-3.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      {t('payment.codeLabel')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.paymentCode!)
                        toast(t('payment.codeCopied'), 'success')
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-950 dark:text-amber-300 cursor-pointer"
                      title={t('payment.copyCode')}
                    >
                      <span className="font-mono font-bold tracking-widest text-sm bg-white dark:bg-gray-900 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-white">
                        {order.paymentCode}
                      </span>
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {t('payment.codeInstruction')}
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-400">{t('paymentState')}</span>
                <PaymentStatusBadge status={order.paymentStatus || 'PENDING'} />
              </div>

              {order.paymentMethod !== 'CASH_ON_DELIVERY' && order.paymentStatus !== 'PAID' && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {order.receiptImage ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('receiptSent')}</p>
                      <button type="button" onClick={() => setViewingReceipt(true)} className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 cursor-pointer">
                        <FileCheck className="h-4 w-4" />
                        {t('viewReceipt')}
                      </button>
                      {order.validationStatus && order.validationStatus !== 'PENDING' && (
                        <ValidationBadge status={order.validationStatus} />
                      )}
                      {order.paymentStatus === 'REJECTED' && (
                        <>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {t('receiptRejected')}
                          </p>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? t('uploading') : t('resendReceipt')}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {t('receiptHint')}
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleReceiptUpload}
                      />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? t('uploading') : t('sendReceipt')}
                      </Button>
                    </>
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
              <X className="h-5 w-5" />
            </button>
            {isPdfUrl(order.receiptImage) ? (
              <iframe
                src={receiptDisplayUrl(order.receiptImage)}
                title={t('receiptImageAlt')}
                className="h-[80vh] w-full rounded-lg bg-white"
              />
            ) : (
              <Image
                src={receiptDisplayUrl(order.receiptImage)}
                alt={t('receiptImageAlt')}
                width={1200}
                height={900}
                unoptimized
                className="max-h-[90vh] w-full rounded-lg object-contain bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const t = useTranslations('orderDetail')
  const map: Record<string, { key: string; cls: string }> = {
    PENDING: { key: 'paymentStatus.pending', cls: 'bg-amber-100 text-amber-700' },
    AWAITING_PAYMENT: { key: 'paymentStatus.awaiting', cls: 'bg-blue-100 text-blue-700' },
    PAYMENT_RECEIVED: { key: 'paymentStatus.received', cls: 'bg-indigo-100 text-indigo-700' },
    PAID: { key: 'paymentStatus.paid', cls: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { key: 'paymentStatus.rejected', cls: 'bg-red-100 text-red-700' },
    CANCELLED: { key: 'paymentStatus.cancelled', cls: 'bg-red-100 text-red-700' },
  }
  const st = map[status]
  const label = st ? t(st.key) : status
  const cls = st?.cls || 'bg-gray-100 text-gray-700'
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>
      {label}
    </span>
  )
}

function ValidationBadge({ status }: { status: string }) {
  const t = useTranslations('orderDetail')
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
  const st = map[status]
  const label = st ? t(st.key) : status
  const cls = st?.cls || 'bg-gray-100 text-gray-700'
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>
      {label}
    </span>
  )
}