'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import {
  fetchOrderTimeline,
  shipOrder,
  markOrderDelivered,
  confirmOrderReceipt,
  type OrderTimelineEvent,
  type OrderTimelineResponse,
} from '@/lib/api-helpers'

interface OrderTimelineProps {
  orderId: string
  onProgress?: () => void
}

function eventIcon(event: OrderTimelineEvent) {
  switch (event.kind) {
    case 'PAYMENT':
    case 'RECEIPT':
      return CreditCard
    case 'VALIDATION':
      return ShieldCheck
    case 'MODERATION':
      return ShieldAlert
    case 'ORDER':
      if (event.to === 'PENDING') return ShoppingBag
      if (event.to === 'SHIPPED') return Truck
      if (event.to === 'DELIVERED') return CheckCircle
      if (event.to === 'RECEIVED') return CheckCircle
      if (event.to === 'CANCELLED') return XCircle
      return Package
    default:
      return Bot
  }
}

function eventTitle(event: OrderTimelineEvent, t: (key: string) => string): string {
  switch (event.kind) {
    case 'ORDER':
      if (event.to === 'PENDING') return t('event.orderCreated')
      if (event.to === 'PROCESSING') return t('event.orderProcessing')
      if (event.to === 'SHIPPED') return t('event.orderShipped')
      if (event.to === 'DELIVERED') return t('event.orderDelivered')
      if (event.to === 'RECEIVED') return t('event.orderReceived')
      if (event.to === 'CANCELLED') return t('event.orderCancelled')
      return t('event.statusChanged')
    case 'PAYMENT':
      if (event.to === 'PAID') return t('event.paymentPaid')
      if (event.to === 'PAYMENT_RECEIVED') return t('event.paymentReceivedBySeller')
      if (event.to === 'REJECTED') return t('event.paymentRejected')
      return t('event.paymentUpdated')
    case 'RECEIPT':
      return t('event.receiptSubmitted')
    case 'VALIDATION':
      if (event.to === 'PASS' || event.to === 'PROOF_ACCEPTED') return t('event.receiptApproved')
      if (event.to === 'FAIL' || event.to === 'PROOF_REJECTED') return t('event.receiptRejected')
      if (event.to === 'REVIEW' || event.to === 'MANUAL_REVIEW') return t('event.receiptManualReview')
      return t('event.receiptChecked')
    case 'MODERATION':
      if (event.to === 'PROOF_ACCEPTED') return t('event.adminApproved')
      if (event.to === 'PROOF_REJECTED') return t('event.adminRejected')
      return t('event.adminAction')
    default:
      return t('event.statusChanged')
  }
}

function actorLabel(role: string | null, t: (key: string) => string): string | null {
  if (!role) return null
  const map: Record<string, string> = {
    BUYER: t('actor.buyer'),
    SELLER: t('actor.seller'),
    ADMIN: t('actor.admin'),
    AGENT: t('actor.system'),
    SYSTEM: t('actor.system'),
  }
  return map[role.toUpperCase()] ?? null
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const d = date.toLocaleDateString('pt-AO')
  const hh = date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
  return `${d} ${hh}`
}

export function OrderTimeline({ orderId, onProgress }: OrderTimelineProps) {
  const t = useTranslations('orderTimeline')
  const tc = useTranslations('common')
  const [timeline, setTimeline] = React.useState<OrderTimelineResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [acting, setActing] = React.useState(false)
  const [shippingOpen, setShippingOpen] = React.useState(false)
  const [carrier, setCarrier] = React.useState('')
  const [trackingCode, setTrackingCode] = React.useState('')
  const [estimatedDelivery, setEstimatedDelivery] = React.useState('')

  const load = React.useCallback(() => {
    fetchOrderTimeline(orderId)
      .then((data) => {
        setTimeline(data)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [orderId])

  React.useEffect(() => {
    load()
  }, [load])

  const retry = React.useCallback(() => {
    setLoading(true)
    load()
  }, [load])

  const refresh = React.useCallback(() => {
    fetchOrderTimeline(orderId).then(setTimeline).catch(() => {})
    onProgress?.()
  }, [orderId, onProgress])

  const handleConfirmReceipt = async () => {
    setActing(true)
    try {
      await confirmOrderReceipt(orderId)
      toast(t('receipt.confirmed'), 'success')
      refresh()
    } catch {
      toast(t('receipt.error'), 'error')
    } finally {
      setActing(false)
    }
  }

  const handleShip = async () => {
    if (!carrier.trim() || !trackingCode.trim()) {
      toast(t('ship.required'), 'error')
      return
    }
    setActing(true)
    try {
      await shipOrder(orderId, {
        carrierName: carrier.trim(),
        trackingCode: trackingCode.trim(),
        estimatedDelivery: estimatedDelivery.trim() || undefined,
      })
      toast(t('ship.success'), 'success')
      setShippingOpen(false)
      setCarrier('')
      setTrackingCode('')
      setEstimatedDelivery('')
      refresh()
    } catch {
      toast(t('ship.error'), 'error')
    } finally {
      setActing(false)
    }
  }

  const handleDeliver = async () => {
    setActing(true)
    try {
      await markOrderDelivered(orderId)
      toast(t('deliver.success'), 'success')
      refresh()
    } catch {
      toast(t('deliver.error'), 'error')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48" />
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !timeline) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('loadError')}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          {tc('retry')}
        </Button>
      </div>
    )
  }

  const caps = timeline.capabilities
  const events = timeline.events

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Truck className="h-5 w-5 text-emerald-600" />
        {t('title')}
      </h2>

      <div className="space-y-0 mt-4">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
        ) : (
          events.map((event, index) => {
            const Icon = eventIcon(event)
            const isLast = index === events.length - 1
            const isCurrent = event.to === timeline.currentStatus
            const actor = actorLabel(event.actorRole, t)
            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-900/60'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 my-1 bg-gray-200 dark:bg-gray-700" />}
                </div>
                <div className={cn('flex-1', !isLast && 'pb-5')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'font-medium leading-snug',
                          isCurrent
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {eventTitle(event, t)}
                      </p>
                      {actor && (
                        <span className="mt-0.5 inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          {actor}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatTime(event.at)}
                    </span>
                  </div>
                  {event.tracking && (
                    <div className="mt-1 space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {event.tracking.carrierName && (
                        <p>
                          {t('tracking.carrier')}: {event.tracking.carrierName}
                        </p>
                      )}
                      {event.tracking.trackingCode && (
                        <p>
                          {t('tracking.code')}:{' '}
                          <span className="font-mono font-medium">{event.tracking.trackingCode}</span>
                        </p>
                      )}
                      {event.tracking.estimatedDelivery && (
                        <p>
                          {t('tracking.delivery')}: {event.tracking.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  )}
                  {event.note && (
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{event.note}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {(caps.canConfirmReceipt || caps.canShip || caps.canDeliver) && (
        <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
          {caps.canConfirmReceipt && (
            <div className="space-y-1.5">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
                onClick={handleConfirmReceipt}
                disabled={acting}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                {t('receipt.action')}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t('receipt.hint')}
              </p>
            </div>
          )}

          {caps.canShip &&
            (shippingOpen ? (
              <form
                className="space-y-2.5"
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleShip()
                }}
              >
                <Input
                  label={t('ship.carrier')}
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. DHL"
                />
                <Input
                  label={t('ship.trackingCode')}
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
                <Input
                  label={t('ship.estimatedDelivery')}
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
                <div className="flex gap-2 pt-1">
                  <Button type="submit" className="flex-1" size="sm" disabled={acting}>
                    <Send className="h-4 w-4 mr-1.5" />
                    {t('ship.submit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingOpen(false)}
                    disabled={acting}
                  >
                    {tc('cancel')}
                  </Button>
                </div>
              </form>
            ) : (
              <Button className="w-full" size="sm" onClick={() => setShippingOpen(true)} disabled={acting}>
                <Truck className="h-4 w-4 mr-1.5" />
                {t('ship.action')}
              </Button>
            ))}

          {caps.canDeliver && (
            <Button className="w-full" size="sm" onClick={handleDeliver} disabled={acting}>
              <Package className="h-4 w-4 mr-1.5" />
              {t('deliver.action')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}