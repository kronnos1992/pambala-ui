'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters } from '@/components/product/product-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const allProducts = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', slug: 'iphone-15-pro-max', price: 450000, image: 'https://placehold.co/400x400/f0fdf4/166534?text=iPhone+15', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'novo' as const, rating: 4.8, reviewCount: 124, stock: 10 },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24', price: 380000, image: 'https://placehold.co/400x400/f0f9ff/0369a1?text=Galaxy+S24', storeName: 'MegaLoja', storeSlug: 'megaloja', province: 'Luanda', condition: 'novo' as const, rating: 4.7, reviewCount: 89, stock: 5 },
  { id: '3', name: 'MacBook Air M3 15"', slug: 'macbook-air-m3', price: 620000, image: 'https://placehold.co/400x400/faf5ff/7c3aed?text=MacBook+Air', storeName: 'Apple Store AO', storeSlug: 'apple-store-ao', province: 'Luanda', condition: 'novo' as const, rating: 4.9, reviewCount: 56, stock: 3 },
  { id: '4', name: 'Sofá Modular 3 Lugares', slug: 'sofa-modular-3', price: 85000, image: 'https://placehold.co/400x400/fef3c7/b45309?text=Sof%C3%A1', storeName: 'Casa & Estilo', storeSlug: 'casa-estilo', province: 'Benguela', condition: 'novo' as const, rating: 4.5, reviewCount: 32, stock: 8 },
  { id: '5', name: 'Honda Civic 2022', slug: 'honda-civic-2022', price: 3500000, image: 'https://placehold.co/400x400/ecfdf5/059669?text=Honda+Civic', storeName: 'AutoAngola', storeSlug: 'autoangola', province: 'Luanda', condition: 'usado' as const, rating: 4.6, reviewCount: 18, stock: 1 },
  { id: '6', name: 'Nike Air Max 270', slug: 'nike-air-max-270', price: 32000, image: 'https://placehold.co/400x400/fff1f2/be123c?text=Nike+Air+Max', storeName: 'SportMax', storeSlug: 'sportmax', province: 'Luanda', condition: 'novo' as const, rating: 4.4, reviewCount: 67, stock: 15 },
  { id: '7', name: 'PlayStation 5 + 2 Controllers', slug: 'ps5-2-controllers', price: 280000, image: 'https://placehold.co/400x400/eff6ff/1d4ed8?text=PS5', storeName: 'GameZone', storeSlug: 'gamezone', province: 'Luanda', condition: 'novo' as const, rating: 4.9, reviewCount: 201, stock: 4 },
  { id: '8', name: 'Smart TV LG 55" 4K', slug: 'smart-tv-lg-55', price: 195000, image: 'https://placehold.co/400x400/f8fafc/334155?text=Smart+TV+LG', storeName: 'EletronicosPlus', storeSlug: 'eletronicos-plus', province: 'Huambo', condition: 'novo' as const, rating: 4.3, reviewCount: 45, stock: 7 },
  { id: '9', name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13', price: 95000, image: 'https://placehold.co/400x400/fff7ed/c2410c?text=Xiaomi', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'novo' as const, rating: 4.2, reviewCount: 78, stock: 12 },
  { id: '10', name: 'Bicicleta Mountain Bike 26"', slug: 'bicicleta-mtb-26', price: 45000, image: 'https://placehold.co/400x400/f0fdf4/166534?text=Bicicleta', storeName: 'SportMax', storeSlug: 'sportmax', province: 'Luanda', condition: 'usado' as const, rating: 4.0, reviewCount: 12, stock: 2 },
  { id: '11', name: 'Air Fryer Mondial 5L', slug: 'air-fryer-mondial-5l', price: 28000, image: 'https://placehold.co/400x400/fef3c7/b45309?text=Air+Fryer', storeName: 'Casa & Estilo', storeSlug: 'casa-estilo', province: 'Benguela', condition: 'novo' as const, rating: 4.6, reviewCount: 34, stock: 10 },
  { id: '12', name: 'iPhone 13 128GB Recondicionado', slug: 'iphone-13-recondicionado', price: 165000, image: 'https://placehold.co/400x400/ecfdf5/059669?text=iPhone+13', storeName: 'MegaLoja', storeSlug: 'megaloja', province: 'Luanda', condition: 'recondicionado' as const, rating: 4.3, reviewCount: 23, stock: 6 },
]

export default function ProdutosClient() {
  const searchParams = useSearchParams()
  const [mobileFilters, setMobileFilters] = React.useState(false)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 8

  const filteredProducts = allProducts.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
    if (category && p.storeName.toLowerCase() !== category.toLowerCase() && !p.name.toLowerCase().includes(category.toLowerCase())) return false
    const min = searchParams.get('min')
    const max = searchParams.get('max')
    if (min && p.price < parseInt(min)) return false
    if (max && p.price > parseInt(max)) return false
    const condition = searchParams.get('condition')
    if (condition) {
      const conditions = condition.split(',')
      if (!conditions.includes(p.condition)) return false
    }
    const province = searchParams.get('province')
    if (province && p.province !== province) return false
    return true
  })

  const totalPages = Math.ceil(filteredProducts.length / perPage)
  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage)

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
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
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
          {paginatedProducts.length > 0 ? (
            <>
              <ProductGrid products={paginatedProducts} />
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
