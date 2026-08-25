'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users, ShoppingCart, Store, Package, DollarSign, TrendingUp, Star,
  Clock, Eye, ArrowUpRight, UserPlus, ShoppingBag
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminStats, getStatusLabel, getStatusColor } from '@/lib/api-helpers'

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    { label: 'Receita Total', value: `${formatPrice(stats.totalRevenue)}`, icon: DollarSign, color: 'from-emerald-500 to-green-400' },
    { label: 'Pedidos Total', value: String(stats.totalOrders), sub: `${stats.ordersThisWeek} esta semana`, icon: ShoppingCart, color: 'from-blue-500 to-indigo-400' },
    { label: 'Utilizadores', value: String(stats.totalUsers), sub: `${stats.usersThisWeek} esta semana`, icon: Users, color: 'from-violet-500 to-purple-400' },
    { label: 'Vendedores', value: String(stats.totalSellers), sub: `${stats.totalBuyers} compradores`, icon: UserPlus, color: 'from-pink-500 to-rose-400' },
    { label: 'Produtos', value: String(stats.totalProducts), sub: `${stats.activeProducts} ativos`, icon: Package, color: 'from-amber-500 to-orange-400' },
    { label: 'Lojas', value: String(stats.totalStores), sub: `${stats.verifiedStores} verificadas`, icon: Store, color: 'from-cyan-500 to-blue-400' },
    { label: 'Avaliacoes', value: String(stats.totalReviews), sub: '', icon: Star, color: 'from-yellow-500 to-amber-400' },
    { label: 'Inativos', value: String(stats.inactiveProducts), sub: `${stats.unverifiedStores} lojas nao verif.`, icon: Eye, color: 'from-red-500 to-rose-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/admin/pedidos" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
          Ver pedidos <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.sub && <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
          <Link href="/admin/pedidos" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Nr Pedido</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Itens</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{order.orderNumber || order.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.userName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.itemsCount}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-6 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhum pedido ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/users" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gerir Utilizadores</p>
              <p className="text-xs text-gray-500">{stats.totalUsers} registados</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/lojas" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gerir Lojas</p>
              <p className="text-xs text-gray-500">{stats.totalStores} registadas</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/produtos" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gerir Produtos</p>
              <p className="text-xs text-gray-500">{stats.totalProducts} registados</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
