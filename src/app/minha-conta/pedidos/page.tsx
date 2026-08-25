'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const orders = [
  { id: 'ORD-001', date: '2024-12-20', total: 450000, status: 'entregue', items: 2, storeName: 'TechStore' },
  { id: 'ORD-002', date: '2024-12-18', total: 95000, status: 'enviado', items: 1, storeName: 'MegaLoja' },
  { id: 'ORD-003', date: '2024-12-15', total: 280000, status: 'processando', items: 3, storeName: 'GameZone' },
  { id: 'ORD-004', date: '2024-12-10', total: 195000, status: 'entregue', items: 1, storeName: 'EletronicosPlus' },
  { id: 'ORD-005', date: '2024-12-05', total: 32000, status: 'cancelado', items: 1, storeName: 'SportMax' },
]

const statusColors: Record<string, string> = {
  entregue: 'bg-emerald-100 text-emerald-700',
  enviado: 'bg-blue-100 text-blue-700',
  processando: 'bg-amber-100 text-amber-700',
  cancelado: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  entregue: 'Entregue',
  enviado: 'Enviado',
  processando: 'Processando',
  cancelado: 'Cancelado',
}

export default function PedidosPage() {
  const [filter, setFilter] = React.useState('all')

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/minha-conta" className="hover:text-emerald-600 transition-colors">Minha Conta</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Pedidos</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Os Meus Pedidos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'processando', label: 'Processando' },
          { value: 'enviado', label: 'Enviado' },
          { value: 'entregue', label: 'Entregue' },
          { value: 'cancelado', label: 'Cancelado' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((order) => (
          <Link
            key={order.id}
            href={`/minha-conta/pedidos/${order.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-500">{order.date} · {order.storeName} · {order.items} {order.items === 1 ? 'item' : 'itens'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', statusColors[order.status])}>
                  {statusLabels[order.status]}
                </span>
                <span className="font-bold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
