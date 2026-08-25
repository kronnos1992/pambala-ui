'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const orderDetails: Record<string, {
  id: string; date: string; total: number; status: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  shipping: { name: string; address: string; province: string; phone: string };
  timeline: { status: string; date: string; time: string; completed: boolean }[];
}> = {
  'ORD-001': {
    id: 'ORD-001', date: '2024-12-20', total: 450000, status: 'entregue',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', price: 450000, quantity: 1, image: 'https://placehold.co/100x100/f0fdf4/166534?text=iPhone' },
    ],
    shipping: { name: 'Carlos Silva', address: 'Rua da Missao, 45, Ingombota', province: 'Luanda', phone: '+244 923 456 789' },
    timeline: [
      { status: 'Pedido realizado', date: '20/12/2024', time: '14:30', completed: true },
      { status: 'Pagamento confirmado', date: '20/12/2024', time: '14:35', completed: true },
      { status: 'Em preparação', date: '20/12/2024', time: '16:00', completed: true },
      { status: 'Enviado', date: '21/12/2024', time: '09:00', completed: true },
      { status: 'Entregue', date: '22/12/2024', time: '14:15', completed: true },
    ],
  },
}

const defaultOrder = {
  id: '', date: '', total: 0, status: 'processando',
  items: [], shipping: { name: '', address: '', province: '', phone: '' },
  timeline: [
    { status: 'Pedido realizado', date: '', time: '', completed: true },
    { status: 'Pagamento confirmado', date: '', time: '', completed: false },
    { status: 'Em preparação', date: '', time: '', completed: false },
    { status: 'Enviado', date: '', time: '', completed: false },
    { status: 'Entregue', date: '', time: '', completed: false },
  ],
}

const timelineIcons: Record<string, React.ElementType> = {
  'Pedido realizado': Clock,
  'Pagamento confirmado': CheckCircle,
  'Em preparação': Package,
  'Enviado': Truck,
  'Entregue': CheckCircle,
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const order = orderDetails[id] || { ...defaultOrder, id }

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
              {order.timeline.map((step, i) => {
                const Icon = timelineIcons[step.status] || Clock
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        step.completed ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div className={cn('w-0.5 flex-1 my-1', step.completed ? 'bg-emerald-600' : 'bg-gray-200')} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={cn('font-medium', step.completed ? 'text-gray-900' : 'text-gray-400')}>{step.status}</p>
                      {step.date && (
                        <p className="text-sm text-gray-500">{step.date} às {step.time}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            {order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(item.price)} Kz</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Detalhes do pedido não disponíveis.</p>
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
                <span className="font-medium text-emerald-600">Grátis</span>
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
            {order.shipping.name ? (
              <div className="text-sm space-y-1">
                <p className="font-medium text-gray-900">{order.shipping.name}</p>
                <p className="text-gray-600 flex items-start gap-1"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />{order.shipping.address}, {order.shipping.province}</p>
                <p className="text-gray-600">{order.shipping.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Informação de envio não disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
