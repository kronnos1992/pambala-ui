'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Upload, FileCheck } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchOrderById, getStatusLabel, getStatusColor, mapStatus, uploadOrderReceipt, uploadFile, paymentLabels, type ApiOrder } from '@/lib/api-helpers'

const timelineIcons: Record<string, React.ElementType> = {
  'Pedido realizado': Clock,
  'Pagamento confirmado': CheckCircle,
  'Em preparacao': Package,
  'Enviado': Truck,
  'Entregue': CheckCircle,
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const statusLabelsMap: Record<string, string> = {
  pending: 'Pedido realizado',
  confirmed: 'Pagamento confirmado',
  processing: 'Em preparacao',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = React.useState<ApiOrder | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
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
      toast('Comprovativo enviado! Aguarde a confirmação.', 'success')
    } catch {
      toast('Erro ao enviar comprovativo', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const paymentDetails = React.useMemo(() => {
    if (!order?.paymentDetails) return null
    try { return JSON.parse(order.paymentDetails) } catch { return null }
  }, [order?.paymentDetails])

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido nao encontrado</h1>
        <Link href="/minha-conta/pedidos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">Voltar aos pedidos</Link>
      </div>
    )
  }

  const orderStatus = mapStatus(order.status)
  const currentStepIndex = statusSteps.indexOf(orderStatus)

  const items = (order.items || []).map((item) => ({
    name: item.product?.name || 'Produto',
    price: item.price,
    quantity: item.quantity,
    image: item.product?.images?.[0] || 'https://placehold.co/100x100/f0fdf4/166534?text=Produto',
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/minha-conta" className="hover:text-emerald-600 transition-colors">Minha Conta</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/minha-conta/pedidos" className="hover:text-emerald-600 transition-colors">Pedidos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido {order.id}</h1>
        <Link href="/minha-conta/pedidos">
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Estado do Pedido</h2>
            <div className="space-y-0">
              {statusSteps.map((step, i) => {
                const label = statusLabelsMap[step]
                const Icon = timelineIcons[label] || Clock
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Itens do Pedido</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Image src={item.image} alt={item.name} width={64} height={64} unoptimized loading="lazy" className="rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} Kz</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Detalhes do pedido nao disponiveis.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envio</span>
                <span className="font-medium text-emerald-600">Gratis</span>
              </div>
              <hr className="my-2 border-gray-100" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-emerald-700">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Envio</h2>
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
              Pagamento
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Método</span>
                <span className="font-medium text-gray-900 dark:text-white">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              {paymentDetails && paymentDetails.type !== 'CASH_ON_DELIVERY' && (
                <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                  {paymentDetails.phone && <PaymentRow label="Telefone" value={paymentDetails.phone} />}
                  {paymentDetails.ownerName && <PaymentRow label="Titular" value={paymentDetails.ownerName} />}
                  {paymentDetails.bankName && <PaymentRow label="Banco" value={paymentDetails.bankName} />}
                  {paymentDetails.iban && <PaymentRow label="IBAN" value={paymentDetails.iban} />}
                  {paymentDetails.bankAccount && <PaymentRow label="Nº de conta" value={paymentDetails.bankAccount} />}
                  {paymentDetails.entity && <PaymentRow label="Entidade" value={paymentDetails.entity} />}
                  {paymentDetails.reference && <PaymentRow label="Referência" value={paymentDetails.reference} />}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-400">Estado</span>
                <PaymentStatusBadge status={order.paymentStatus || 'PENDING'} />
              </div>

              {order.paymentMethod !== 'CASH_ON_DELIVERY' && order.paymentStatus !== 'PAID' && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {order.receiptImage ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Comprovativo enviado</p>
                      <a href={order.receiptImage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
                        <FileCheck className="h-4 w-4" />
                        Ver comprovativo
                      </a>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Após efectuar o pagamento, faça o upload do comprovativo.
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleReceiptUpload}
                      />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'A enviar...' : 'Enviar comprovativo'}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Aguardando pagamento', cls: 'bg-amber-100 text-amber-700' },
    AWAITING_PAYMENT: { label: 'Aguardando confirmação', cls: 'bg-blue-100 text-blue-700' },
    PAID: { label: 'Pago', cls: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
  }
  const st = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', st.cls)}>
      {st.label}
    </span>
  )
}
