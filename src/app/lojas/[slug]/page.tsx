'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, Star, MapPin, Package, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product/product-grid'
import { cn } from '@/lib/utils'

const storeData: Record<string, {
  name: string; slug: string; banner?: string; logo?: string;
  rating: number; reviewCount: number; productCount: number;
  location: string; description: string; joinedDate: string;
  reviews: { name: string; rating: number; text: string; date: string }[];
}> = {
  techstore: {
    name: 'TechStore', slug: 'techstore', rating: 4.8, reviewCount: 312, productCount: 156,
    location: 'Luanda', description: 'A sua loja de confianca para produtos tecnologicos em Angola. Trabalhamos apenas com marcas de referencia e oferecemos garantia em todos os produtos.',
    joinedDate: '2022-03-15',
    reviews: [
      { name: 'Manuel G.', rating: 5, text: 'Excelente loja! Entrega rapida e produtos originais.', date: '2024-12-20' },
      { name: 'Rosa P.', rating: 5, text: 'Comprei um iPhone e chegou perfeito. Recomendo!', date: '2024-12-18' },
      { name: 'Joao A.', rating: 4, text: 'Bom atendimento, demorou um pouco na entrega.', date: '2024-12-15' },
    ],
  },
}

const defaultStore = {
  name: 'Loja', slug: 'loja', rating: 4.5, reviewCount: 0, productCount: 0,
  location: 'Luanda', description: 'Descricao da loja.', joinedDate: '2023-01-01', reviews: [],
}

const storeProducts = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', slug: 'iphone-15-pro-max', price: 450000, image: 'https://placehold.co/400x400/f0fdf4/166534?text=iPhone+15', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'novo' as const, rating: 4.8, reviewCount: 124, stock: 10 },
  { id: '9', name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13', price: 95000, image: 'https://placehold.co/400x400/fff7ed/c2410c?text=Xiaomi', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'novo' as const, rating: 4.2, reviewCount: 78, stock: 12 },
  { id: '12', name: 'iPhone 13 128GB Recondicionado', slug: 'iphone-13-recondicionado', price: 165000, image: 'https://placehold.co/400x400/ecfdf5/059669?text=iPhone+13', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'recondicionado' as const, rating: 4.3, reviewCount: 23, stock: 6 },
]

export default function StoreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const store = storeData[slug] || { ...defaultStore, slug, name: decodeURIComponent(slug).replace(/-/g, ' ') }
  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews'>('products')

  const avgRating = store.reviews.length > 0
    ? store.reviews.reduce((s, r) => s + r.rating, 0) / store.reviews.length
    : store.rating

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/lojas" className="hover:text-emerald-600 transition-colors">Lojas</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">{store.name}</span>
      </nav>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 h-40 sm:h-52 mb-[-40px] sm:mb-[-52px]" />

      <div className="relative z-10 flex flex-col sm:flex-row items-end gap-4 mb-8 px-4">
        <Avatar fallback={store.name} size="lg" className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg text-2xl" />
        <div className="flex-1 pb-1">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({store.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{store.productCount} produtos</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{store.location}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contactar
        </Button>
      </div>

      <p className="text-gray-600 mb-8">{store.description}</p>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'products' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Produtos ({store.productCount})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'reviews' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Avaliações ({store.reviewCount})
        </button>
      </div>

      {activeTab === 'products' && <ProductGrid products={storeProducts} />}

      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{store.reviewCount} avaliações</p>
            </div>
          </div>
          {store.reviews.map((review, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar fallback={review.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{review.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn('h-3 w-3', j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">{review.text}</p>
            </div>
          ))}
          {store.reviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma avaliação ainda.</p>
          )}
        </div>
      )}
    </div>
  )
}
