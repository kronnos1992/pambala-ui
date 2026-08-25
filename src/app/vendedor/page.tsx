'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, DollarSign, Star, Package, Plus,
  ChevronRight, Eye, Clock, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, cn } from '@/lib/utils'

const stats = [
  { label: 'Vendas Hoje', value: '12', change: '+3', icon: ShoppingCart, color: 'from-emerald-500 to-green-400' },
  { label: 'Pedidos Pendentes', value: '5', change: '-2', icon: Clock, color: 'from-amber-500 to-orange-400' },
  { label: 'Receita Total', value: '2.4M Kz', change: '+15%', icon: DollarSign, color: 'from-blue-500 to-indigo-400' },
  { label: 'Avaliação', value: '4.8', change: '+0.1', icon: Star, color: 'from-violet-500 to-purple-400' },
]

const recentOrders = [
  { id: 'ORD-001', customer: 'Maria José', product: 'iPhone 15 Pro Max', amount: 450000, status: 'pendente', date: '2024-12-20' },
  { id: 'ORD-002', customer: 'Carlos Silva', product: 'Samsung Galaxy S24', amount: 380000, status: 'enviado', date: '2024-12-19' },
  { id: 'ORD-003', customer: 'Ana Fernandes', product: 'MacBook Air M3', amount: 620000, status: 'entregue', date: '2024-12-18' },
  { id: 'ORD-004', customer: 'Pedro Santos', product: 'PlayStation 5', amount: 280000, status: 'pendente', date: '2024-12-18' },
  { id: 'ORD-005', customer: 'Rosa Paulo', product: 'Smart TV LG 55"', amount: 195000, status: 'enviado', date: '2024-12-17' },
]

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregue: 'bg-emerald-100 text-emerald-700',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  enviado: 'Enviado',
  entregue: 'Entregue',
}

export default function VendedorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Painel do Vendedor</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel do Vendedor</h1>
        <div className="flex gap-2">
          <Link href="/vendedor/produtos">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Gerir Produtos
            </Button>
          </Link>
          <Link href="/vendedor/produtos/novo">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
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
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                    {stat.change}
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
              <Link href="/minha-conta/pedidos" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ver todos
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Pedido</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Produto</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{order.customer}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 max-w-[200px] truncate">{order.product}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatPrice(order.amount)}</td>
                      <td className="px-6 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', statusColors[order.status])}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <Link href="/vendedor/produtos/novo" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Adicionar Produto</p>
                  <p className="text-xs text-gray-500">Criar novo anuncio</p>
                </div>
              </Link>
              <Link href="/vendedor/produtos" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Gerir Produtos</p>
                  <p className="text-xs text-gray-500">Editar ou remover anuncios</p>
                </div>
              </Link>
              <Link href="/minha-conta/pedidos" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ver Pedidos</p>
                  <p className="text-xs text-gray-500">Acompanhar vendas</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-600 to-green-500 p-6 text-white">
            <TrendingUp className="h-8 w-8 mb-3" />
            <h3 className="font-semibold mb-1">Vendas este mes</h3>
            <p className="text-2xl font-bold">2.4M Kz</p>
            <p className="text-sm text-emerald-100 mt-1">+15% comparado ao mes anterior</p>
          </div>
        </div>
      </div>
    </div>
  )
}
