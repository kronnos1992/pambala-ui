'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminOrders, updateOrderStatus, getStatusLabel, getStatusColor, type ApiOrder } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

const statusOptions = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const statusLabels: Record<string, string> = {
  '': 'Todos', PENDING: 'Pendente', CONFIRMED: 'Confirmado', PROCESSING: 'Processando', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = React.useState<ApiOrder[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminOrders({ page, limit: 15, status: status || undefined, q: search || undefined })
      .then((data) => { setOrders(data.orders); setPagination(data.pagination) })
      .catch(() => toast('Erro ao carregar pedidos', 'error'))
      .finally(() => setLoading(false))
  }, [page, status, search])

  React.useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast('Estado atualizado', 'success')
      load()
    } catch {
      toast('Erro ao atualizar estado', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerir Pedidos</h1>
        <span className="text-sm text-gray-500">{pagination.total} pedidos</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar por nr. pedido ou nome..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <Button type="submit" size="sm">Pesquisar</Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                status === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nr Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Provincia</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber || order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.shippingName || order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{order.shippingProvince || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={cn('text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50', getStatusColor(order.status))}
                      >
                        {statusOptions.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhum pedido encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Pagina {pagination.page} de {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
