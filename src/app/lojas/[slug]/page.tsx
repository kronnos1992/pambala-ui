'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ChevronRight, Star, MapPin, Package, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product/product-grid'
import { cn } from '@/lib/utils'
import { fetchStoreBySlug, fetchStoreProducts, fetchStoreReviews, type ApiStore, type UiProduct, type ApiReview } from '@/lib/api-helpers'

export default function StoreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore] = React.useState<ApiStore | null>(null)
  const [products, setProducts] = React.useState<UiProduct[]>([])
  const [reviews, setReviews] = React.useState<ApiReview[]>([])
  const [avgRating, setAvgRating] = React.useState(0)
  const [totalReviews, setTotalReviews] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews'>('products')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchStoreBySlug(slug),
      fetchStoreProducts(slug, { limit: 20 }),
      fetchStoreReviews(slug),
    ])
      .then(([storeData, productsData, reviewsData]) => {
        setStore(storeData)
        setProducts(productsData.products)
        setReviews(reviewsData.reviews)
        setAvgRating(reviewsData.avgRating)
        setTotalReviews(reviewsData.totalReviews)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-32 mb-6" />
          <div className="h-40 bg-gray-100 rounded-2xl mb-12" />
          <div className="h-8 bg-gray-100 rounded w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-100 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loja nao encontrada</h1>
        <Link href="/lojas" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">Voltar as lojas</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/lojas" className="hover:text-emerald-600 transition-colors">Lojas</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{store.name}</span>
      </nav>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 h-40 sm:h-52 mb-[-40px] sm:mb-[-52px]" />

      <div className="relative z-10 flex flex-col sm:flex-row items-end gap-4 mb-8 px-4">
        <Avatar fallback={store.name} size="lg" className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg text-2xl" />
        <div className="flex-1 pb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({totalReviews})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{store._count?.products || 0} produtos</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{store.province}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contactar
        </Button>
      </div>

      {store.description && <p className="text-gray-600 mb-8">{store.description}</p>}

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'products' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Produtos ({store._count?.products || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'reviews' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Avaliações ({totalReviews})
        </button>
      </div>

      {activeTab === 'products' && <ProductGrid products={products} />}

      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{totalReviews} avaliações</p>
            </div>
          </div>
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar fallback={review.user?.name || 'U'} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{review.user?.name || 'Anonimo'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn('h-3 w-3', j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pt-AO')}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma avaliação ainda.</p>
          )}
        </div>
      )}
    </div>
  )
}
