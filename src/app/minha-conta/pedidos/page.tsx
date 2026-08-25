'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchOrders, type UiOrder, getStatusLabel, getStatusColor, mapStatus } from '@/lib/api-helpers'

export default function PedidosPage() {
  const [filter, setFilter] = React.useState('all')
  const [orders, setOrders] = React.useState<UiOrder[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchOrders({ limit: 50 })
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
          { value: 'pending', label: 'Pendente' },
          { value: 'processing', label: 'Processando' },
          { value: 'shipped', label: 'Enviado' },
          { value: 'delivered', label: 'Entregue' },
          { value: 'cancelled', label: 'Cancelado' },
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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="flex justify-between">
                <div>
                  <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                  <p className="text-sm text-gray-500">{order.date} · {order.items} {order.items === 1 ? 'item' : 'itens'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="font-bold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</span>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum pedido encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
