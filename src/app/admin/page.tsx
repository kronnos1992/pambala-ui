'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users, ShoppingCart, Store, Package, DollarSign, TrendingUp, Star,
  Eye, ArrowUpRight, ArrowDownRight, UserPlus, ShoppingBag, Activity
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatPrice, cn } from '@/lib/utils'
import { fetchAdminStats, fetchAdminRevenueChart, getStatusLabel, getStatusColor } from '@/lib/api-helpers'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<any>(null)
  const [revenueData, setRevenueData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetchAdminStats(),
      fetchAdminRevenueChart(30),
    ])
      .then(([s, rev]) => { setStats(s); setRevenueData(rev) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse lg:col-span-2" />
          <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const orderStatusData = stats.recentOrders?.length > 0
    ? (() => {
        const statusMap: Record<string, number> = {}
        stats.recentOrders.forEach((o: any) => {
          statusMap[o.status] = (statusMap[o.status] || 0) + 1
        })
        return Object.entries(statusMap).map(([status, count]) => ({
          name: getStatusLabel(status),
          value: count,
        }))
      })()
    : []

  const mainStats = [
    {
      label: 'Receita Total',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-400',
      change: stats.ordersThisWeek,
      changeLabel: 'pedidos esta semana',
      up: true,
    },
    {
      label: 'Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-400',
      change: stats.ordersThisWeek,
      changeLabel: 'esta semana',
      up: true,
    },
    {
      label: 'Utilizadores',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-violet-500 to-purple-400',
      change: stats.usersThisWeek,
      changeLabel: 'novos esta semana',
      up: true,
    },
    {
      label: 'Produtos Ativos',
      value: stats.activeProducts,
      icon: Package,
      gradient: 'from-amber-500 to-orange-400',
      change: stats.inactiveProducts,
      changeLabel: 'inativos',
      up: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-200 mt-0.5">Visao geral da plataforma</p>
        </div>
        <Link href="/admin/pedidos" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
          Ver pedidos <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', stat.gradient)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full',
                  stat.up ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                )}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-950 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{stat.changeLabel}</p>
            </div>
          )
        })}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300">
              <Store className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-950 dark:text-white">{stats.totalStores}</p>
              <p className="text-xs text-gray-600 dark:text-gray-200">Lojas</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-950 dark:text-white">{stats.totalSellers}</p>
              <p className="text-xs text-gray-600 dark:text-gray-200">Vendedores</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300">
              <Star className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-950 dark:text-white">{stats.totalReviews}</p>
              <p className="text-xs text-gray-600 dark:text-gray-200">Avaliacoes</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">
              <Eye className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-950 dark:text-white">{stats.verifiedStores}</p>
              <p className="text-xs text-gray-600 dark:text-gray-200">Lojas Verif.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-950 dark:text-white">Receita - Ultimos 30 dias</h2>
              <p className="text-xs text-gray-600 dark:text-gray-200 mt-0.5">{formatPrice(revenueData.reduce((s: number, d: any) => s + d.revenue, 0))} total</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              <span>Diario</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#f3f4f6', fontSize: '12px' }}
                  formatter={(value: number) => [formatPrice(value), 'Receita']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Distribution */}
        <div className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-950 dark:text-white mb-4">Pedidos por Estado</h2>
          {orderStatusData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {orderStatusData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#f3f4f6', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {orderStatusData.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-200">{item.name}</span>
                    <span className="font-semibold text-gray-950 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-300 text-sm">
              Sem dados de pedidos
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-950 dark:text-white">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium transition-colors">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <th className="px-6 py-3">Nr Pedido</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Itens</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-950 dark:text-white">{order.orderNumber || order.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-100">{order.userName}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-100">{order.itemsCount}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-950 dark:text-white">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-300 text-sm">Nenhum pedido ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-950 dark:text-white px-1">Acesso Rapido</h2>
          {[
            { href: '/admin/users', icon: Users, label: 'Utilizadores', sub: `${stats.totalUsers} registados`, gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
            { href: '/admin/lojas', icon: Store, label: 'Lojas', sub: `${stats.totalStores} registadas`, gradient: 'from-cyan-500 to-blue-400', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
            { href: '/admin/produtos', icon: Package, label: 'Produtos', sub: `${stats.totalProducts} registados`, gradient: 'from-amber-500 to-orange-400', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="glass-card block rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', link.gradient)}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-950 dark:text-white text-sm">{link.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-200">{link.sub}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 dark:text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
