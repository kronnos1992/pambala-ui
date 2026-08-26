'use client'

import * as React from 'react'
import Link from 'next/link'
import { use } from 'react'
import {
  ChevronRight, Minus, Plus, ShoppingCart, Heart, Star, MapPin,
  Truck, Shield, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductCard } from '@/components/product/product-card'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { fetchProductBySlug, fetchProducts, mapApiProduct, mapCondition, type ApiProduct, type UiProduct } from '@/lib/api-helpers'

const conditionLabels = { novo: 'Novo', usado: 'Usado', recondicionado: 'Recondicionado' }

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = React.useState(1)
  const [liked, setLiked] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'description' | 'reviews'>('description')
  const [product, setProduct] = React.useState<ApiProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = React.useState<UiProduct[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p)
        if (p.categoryId) {
          fetchProducts({ categoryId: p.categoryId, limit: 4 })
            .then((data) => setRelatedProducts(data.products.filter((rp: UiProduct) => rp.id !== p.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl bg-gray-100" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/4" />
              <div className="h-10 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produto nao encontrado</h1>
        <Link href="/produtos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">Voltar aos produtos</Link>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []
  const avgRating = product.avgRating || 0
  const condLabel = conditionLabels[mapCondition(product.condition)] || 'Novo'
  const reviews = product.reviews || []

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || '',
        storeId: product.storeId,
        storeName: product.store?.name || 'Loja',
        maxQuantity: product.stock,
      })
    }
    toast(`${product.name} adicionado ao carrinho!`, 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/produtos" className="hover:text-emerald-600 transition-colors">Produtos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ProductGallery images={images.length > 0 ? images : ['https://placehold.co/600x600/f3f4f6/6b7280?text=Produto']} name={product.name} />

        <div className="space-y-5">
          <div>
            <Badge variant="secondary" className="mb-2">
              {condLabel}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({reviews.length} avaliações)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-emerald-700">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{product.store?.province || 'Luanda'}, Angola</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-emerald-600 font-medium">Em estoque ({product.stock} unidades)</span>
            ) : (
              <span className="text-red-600 font-medium">Esgotado</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="flex-1 h-11" onClick={handleAddToCart} disabled={product.stock <= 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao Carrinho
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(liked && 'text-red-500 border-red-200 bg-red-50')}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Entrega disponivel</p>
                <p className="text-xs text-gray-500">Envio para todo o pais</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Compra protegida</p>
                <p className="text-xs text-gray-500">Devolucao em 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Devolucao gratuita</p>
                <p className="text-xs text-gray-500">Se nao estiver satisfeito</p>
              </div>
            </div>
          </div>

          {product.store && (
            <Link href={`/lojas/${product.store.slug}`}>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <Avatar fallback={product.store.name} size="lg" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{product.store.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)}</span>
                    <span>·</span>
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{product.store.province || 'Luanda'}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Visitar Loja</Button>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'description'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Descrição
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Avaliações ({reviews.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description || 'Sem descricao disponivel.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{reviews.length} avaliações</p>
              </div>
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
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
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhuma avaliação ainda.</p>
            )}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
