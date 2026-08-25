'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchOrderById, getStatusLabel, getStatusColor, mapStatus, type ApiOrder } from '@/lib/api-helpers'

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

  React.useEffect(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
          <div className="h-8 bg-gray-100 rounded w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 h-64" />
              <div className="rounded-xl border border-gray-200 bg-white p-6 h-48" />
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 h-40" />
              <div className="rounded-xl border border-gray-200 bg-white p-6 h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900">Pedido nao encontrado</h1>
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
        <span className="text-gray-900 font-medium">{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pedido {order.id}</h1>
        <Link href="/minha-conta/pedidos">
          <Button variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Estado do Pedido</h2>
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
                      <p className={cn('font-medium', completed ? 'text-gray-900' : 'text-gray-400')}>{label}</p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Image src={item.image} alt={item.name} width={64} height={64} unoptimized loading="lazy" className="rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} Kz</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Detalhes do pedido nao disponiveis.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
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

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Envio</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{order.shippingName || 'N/A'}</p>
              <p className="text-gray-600 flex items-start gap-1">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {order.shippingAddress}{order.shippingDistrict ? `, ${order.shippingDistrict}` : ''}, {order.shippingProvince}
              </p>
              <p className="text-gray-600">{order.shippingPhone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
