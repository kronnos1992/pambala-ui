'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice, cn } from '@/lib/utils'
import { fetchProducts, type UiProduct } from '@/lib/api-helpers'

export default function SellerProductsPage() {
  const [search, setSearch] = React.useState('')
  const [products, setProducts] = React.useState<UiProduct[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchProducts({ limit: 50 })
      .then((data) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3">Produto</th>
                  <th className="px-6 py-3">Preco</th>
                  <th className="px-6 py-3">Estoque</th>
                  <th className="px-6 py-3">Vendas</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Image src={product.image} alt={product.name} width={48} height={48} unoptimized loading="lazy" className="rounded-lg object-cover" />
                        <span className="text-sm font-medium text-gray-900 max-w-[250px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-3">
                      <span className={cn('text-sm font-medium', (product.stock || 0) > 0 ? 'text-gray-900' : 'text-red-600')}>
                        {product.stock || 0} unidades
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{product.reviewCount || 0}</td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        (product.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      )}>
                        {(product.stock || 0) > 0 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/produtos/${product.slug}`} className="rounded-md p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
