'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters } from '@/components/product/product-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { fetchProducts, type UiProduct } from '@/lib/api-helpers'

export default function ProdutosClient() {
  const searchParams = useSearchParams()
  const [mobileFilters, setMobileFilters] = React.useState(false)
  const [products, setProducts] = React.useState<UiProduct[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''
  const condition = searchParams.get('condition') || ''
  const sort = searchParams.get('sort') || ''
  const province = searchParams.get('province') || ''

  React.useEffect(() => {
    setLoading(true)
    const params: Record<string, unknown> = { page, limit: 12 }
    if (q) params.q = q
    if (category) params.categorySlug = category
    if (minPrice) params.minPrice = parseInt(minPrice)
    if (maxPrice) params.maxPrice = parseInt(maxPrice)
    if (condition) params.condition = condition
    if (sort === 'price_asc') params.sort = 'price-asc'
    else if (sort === 'price_desc') params.sort = 'price-desc'
    else if (sort === 'popular') params.sort = 'popular'

    fetchProducts(params)
      .then((data) => {
        let filtered = data.products
        if (province) {
          filtered = filtered.filter((p: UiProduct) => p.province === province)
        }
        setProducts(filtered)
        setTotalPages(data.pagination?.totalPages || 1)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [q, category, page, minPrice, maxPrice, condition, sort, province])

  const perPage = 12

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Produtos</span>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium">{category}</span>
          </>
        )}
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {category || q ? `Resultados para "${category || q}"` : 'Todos os Produtos'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'A carregar...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <ProductFilters />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
                  <div className="aspect-square rounded-lg bg-gray-100 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', String(i + 1))
                    return (
                      <Link
                        key={i}
                        href={`/produtos?${params.toString()}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1
                            ? 'bg-emerald-600 text-white'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou pesquisar por algo diferente.</p>
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="font-semibold text-gray-900">Filtros</h2>
              <button onClick={() => setMobileFilters(false)} className="rounded-md p-1.5 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <ProductFilters onMobileClose={() => setMobileFilters(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
