'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'

const products = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', price: 450000, image: 'https://placehold.co/100x100/f0fdf4/166534?text=iPhone', stock: 10, status: 'ativo', sales: 24 },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', price: 380000, image: 'https://placehold.co/100x100/f0f9ff/0369a1?text=Galaxy', stock: 5, status: 'ativo', sales: 18 },
  { id: '3', name: 'Xiaomi Redmi Note 13 Pro', price: 95000, image: 'https://placehold.co/100x100/fff7ed/c2410c?text=Xiaomi', stock: 12, status: 'ativo', sales: 32 },
  { id: '4', name: 'iPhone 13 128GB Recondicionado', price: 165000, image: 'https://placehold.co/100x100/ecfdf5/059669?text=iPhone+13', stock: 0, status: 'inativo', sales: 8 },
]

export default function SellerProductsPage() {
  const [search, setSearch] = React.useState('')

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/vendedor" className="hover:text-emerald-600 transition-colors">Vendedor</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Produtos</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Os Meus Produtos</h1>
        <Link href="/vendedor/produtos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3">Preço</th>
                <th className="px-6 py-3">Estoque</th>
                <th className="px-6 py-3">Vendas</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                      <span className="text-sm font-medium text-gray-900 max-w-[250px] truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-6 py-3">
                    <span className={cn('text-sm font-medium', product.stock > 0 ? 'text-gray-900' : 'text-red-600')}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{product.sales}</td>
                  <td className="px-6 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      product.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {product.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
