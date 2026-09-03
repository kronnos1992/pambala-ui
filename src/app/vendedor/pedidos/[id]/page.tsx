'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, MapPin, CreditCard, CheckCircle, XCircle, FileCheck, User } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchOrderById, updateOrderPaymentStatus, paymentLabels, type ApiOrder } from '@/lib/api-helpers'

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
      await updateOrderPaymentStatus(order.id, 'PAID')
      toast('Pagamento confirmado!', 'success')
      load()
    } catch {
      toast('Erro ao confirmar pagamento', 'error')
    } finally {
      setActing(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!order) return
    setActing(true)
    try {
      await updateOrderPaymentStatus(order.id, 'PENDING')
      toast('Pagamento marcado como pendente', 'success')
      load()
    } catch {
      toast('Erro ao actualizar pagamento', 'error')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido nao encontrado</h1>
        <Link href="/vendedor/pedidos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">Voltar aos pedidos</Link>
      </div>
    )
  }

  const items = (order.items || []).map((item) => ({
    name: item.product?.name || 'Produto',
    price: item.price,
    quantity: item.quantity,
    image: Array.isArray(item.product?.images) ? item.product?.images[0] : (item.product?.images || ''),
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">Painel do Vendedor</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor/pedidos" className="hover:text-emerald-600 transition-colors">Pedidos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido {order.id}</h1>
        <Link href="/vendedor/pedidos">
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Itens do Pedido</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <Image src={item.image} alt={item.name} width={56} height={56} unoptimized loading="lazy" className="rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} Kz</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sem itens.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cliente</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Envio</span>
                <span className="font-medium text-emerald-600">Gratis</span>
              </div>
              <hr className="my-2 border-gray-100 dark:border-gray-700" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-emerald-700">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
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
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-400">Estado</span>
                <PaymentStatusBadge status={order.paymentStatus || 'PENDING'} />
              </div>

              {order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {order.receiptImage ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <FileCheck className="h-4 w-4 text-emerald-600" /> Comprovativo do cliente
                      </p>
                      <a href={order.receiptImage} target="_blank" rel="noreferrer">
                        <Image
                          src={order.receiptImage}
                          alt="Comprovativo"
                          width={320}
                          height={320}
                          unoptimized
                          loading="lazy"
                          className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </a>

                      {order.paymentStatus !== 'PAID' ? (
                        <div className="space-y-2 pt-1">
                          <Button className="w-full" onClick={handleConfirmPayment} disabled={acting}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {acting ? 'A processar...' : 'Confirmar Pagamento'}
                          </Button>
                          <Button variant="outline" className="w-full" onClick={handleRejectPayment} disabled={acting}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Marcar como pendente
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 pt-1">
                          <CheckCircle className="h-4 w-4" /> Pagamento confirmado
                        </p>
                      )}
                    </div>
                  ) : (
                    order.paymentStatus === 'PAID' ? (
                      <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Pagamento confirmado
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aguardando o cliente enviar o comprovativo de pagamento.
                      </p>
                    )
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
