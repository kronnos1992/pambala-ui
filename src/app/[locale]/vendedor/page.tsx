'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  ShoppingCart, DollarSign, Star, Package, Plus,
  ChevronRight, Eye, Clock, ArrowUpRight, CreditCard, Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, cn } from '@/lib/utils'
import { fetchSellerOrders, type UiOrder, getStatusLabel, getStatusColor } from '@/lib/api-helpers'
import { useAuthStore } from '@/store/auth-store'

export default function VendedorPage() {
  const t = useTranslations('sellerDashboard')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = React.useState<UiOrder[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchSellerOrders({ limit: 50 })
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = React.useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const pending = orders.filter((o) => o.status === 'pending').length
    const delivered = orders.filter((o) => o.status === 'delivered').length
    return [
      { label: t('stats.totalOrders'), value: String(orders.length), change: '', icon: ShoppingCart, color: 'from-emerald-500 to-green-400' },
      { label: t('stats.pending'), value: String(pending), change: '', icon: Clock, color: 'from-amber-500 to-orange-400' },
      { label: t('stats.totalRevenue'), value: `${new Intl.NumberFormat('pt-AO', { notation: 'compact' }).format(totalRevenue)} ${tc('currency')}`, change: '', icon: DollarSign, color: 'from-blue-500 to-indigo-400' },
      { label: t('stats.delivered'), value: String(delivered), change: '', icon: Star, color: 'from-violet-500 to-purple-400' },
    ]
  }, [orders, t, tc])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{t('breadcrumb')}</span>
      </nav>

      {user && user.role === 'seller' && !user.store && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-900/20 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{t('noStoreTitle')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('noStoreHint')}</p>
            </div>
          </div>
          <Link href="/vendedor/loja">
            <Button size="sm">
              <Store className="h-4 w-4 mr-2" />
              {t('createStore')}
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <div className="flex gap-2">
          <Link href="/vendedor/produtos">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              {t('manageProducts')}
            </Button>
          </Link>
          <Link href="/vendedor/produtos/novo">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('newProduct')}
            </Button>
          </Link>
          <Link href="/vendedor/pagamento">
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              {t('paymentMethods')}
            </Button>
          </Link>
          <Link href="/vendedor/loja">
            <Button variant="outline" size="sm">
              <Store className="h-4 w-4 mr-2" />
              {t('manageStore')}
            </Button>
          </Link>
          <Link href="/vendedor/pedidos">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('manageOrders')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                      {stat.change}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('recentOrders')}</h2>
              <Link href="/vendedor/pedidos" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                {t('viewAll')}
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">{t('header.order')}</th>
                      <th className="px-6 py-3">{t('header.customer')}</th>
                      <th className="px-6 py-3">{t('header.items')}</th>
                      <th className="px-6 py-3">{t('header.amount')}</th>
                      <th className="px-6 py-3">{t('header.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{order.shippingName || tc('notFound')}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{tc('items')}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                        <td className="px-6 py-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                          {t('noOrders')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h2>
            <div className="space-y-2">
              <Link href="/vendedor/produtos/novo" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('addProduct')}</p>
                  <p className="text-xs text-gray-500">{t('createNewListing')}</p>
                </div>
              </Link>
              <Link href="/vendedor/produtos" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('manageProducts')}</p>
                  <p className="text-xs text-gray-500">{t('editOrRemoveListings')}</p>
                </div>
              </Link>
              <Link href="/vendedor/pedidos" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('viewOrders')}</p>
                  <p className="text-xs text-gray-500">{t('trackSales')}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}