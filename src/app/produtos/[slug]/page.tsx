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

const productData: Record<string, {
  id: string; name: string; slug: string; price: number; comparePrice?: number;
  images: string[]; storeName: string; storeSlug: string; storeLogo?: string;
  storeRating: number; storeLocation: string; province: string;
  condition: 'novo' | 'usado' | 'recondicionado'; rating: number; reviewCount: number;
  stock: number; description: string; reviews: { name: string; rating: number; text: string; date: string }[];
}> = {
  'iphone-15-pro-max': {
    id: '1', name: 'iPhone 15 Pro Max 256GB Titânio Natural', slug: 'iphone-15-pro-max', price: 450000, comparePrice: 520000,
    images: ['https://placehold.co/600x600/f0fdf4/166534?text=iPhone+15+Pro+1', 'https://placehold.co/600x600/f0fdf4/166534?text=iPhone+15+Pro+2', 'https://placehold.co/600x600/f0fdf4/166534?text=iPhone+15+Pro+3', 'https://placehold.co/600x600/f0fdf4/166534?text=iPhone+15+Pro+4'],
    storeName: 'TechStore', storeSlug: 'techstore', storeRating: 4.8, storeLocation: 'Luanda',
    province: 'Luanda', condition: 'novo', rating: 4.8, reviewCount: 124, stock: 10,
    description: 'O iPhone 15 Pro Max e o smartphone mais avancado da Apple. Equipado com o chip A17 Pro, camera de 48MP com zoom optico 5x, ecrã Super Retina XDR de 6.7 polegadas com ProMotion e Always-On display. Caixa em titanio de grau aeronautico. Bateria de longa duracao com carregamento MagSafe e USB-C.',
    reviews: [
      { name: 'Carlos M.', rating: 5, text: 'Excelente produto! A camera e impressionante.', date: '2024-12-15' },
      { name: 'Ana R.', rating: 4, text: 'Muito bom, mas o preco e elevado.', date: '2024-12-10' },
      { name: 'Pedro S.', rating: 5, text: 'Melhor iPhone de sempre. Vale cada Kz.', date: '2024-12-08' },
    ],
  },
}

const defaultProduct = {
  id: '0', name: 'Produto', slug: 'produto', price: 0,
  images: ['https://placehold.co/600x600/f3f4f6/6b7280?text=Produto'],
  storeName: 'Loja', storeSlug: 'loja', storeRating: 4.5, storeLocation: 'Luanda',
  province: 'Luanda', condition: 'novo' as const, rating: 4.5, reviewCount: 0, stock: 5,
  description: 'Descricao do produto.',
  reviews: [],
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const product = productData[slug] || { ...defaultProduct, slug, name: decodeURIComponent(slug).replace(/-/g, ' ') }
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = React.useState(1)
  const [liked, setLiked] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'description' | 'reviews'>('description')

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        storeId: product.storeSlug,
        storeName: product.storeName,
        maxQuantity: product.stock,
      })
    }
    toast(`${product.name} adicionado ao carrinho!`, 'success')
  }

  const conditionLabels = { novo: 'Novo', usado: 'Usado', recondicionado: 'Recondicionado' }
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : product.rating

  const relatedProducts = [
    { id: '10', name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13', price: 95000, image: 'https://placehold.co/400x400/fff7ed/c2410c?text=Xiaomi', storeName: 'TechStore', storeSlug: 'techstore', province: 'Luanda', condition: 'novo' as const, rating: 4.2, reviewCount: 78, stock: 12 },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24', price: 380000, image: 'https://placehold.co/400x400/f0f9ff/0369a1?text=Galaxy+S24', storeName: 'MegaLoja', storeSlug: 'megaloja', province: 'Luanda', condition: 'novo' as const, rating: 4.7, reviewCount: 89, stock: 5 },
    { id: '7', name: 'PlayStation 5 + 2 Controllers', slug: 'ps5-2-controllers', price: 280000, image: 'https://placehold.co/400x400/eff6ff/1d4ed8?text=PS5', storeName: 'GameZone', storeSlug: 'gamezone', province: 'Luanda', condition: 'novo' as const, rating: 4.9, reviewCount: 201, stock: 4 },
    { id: '8', name: 'Smart TV LG 55" 4K', slug: 'smart-tv-lg-55', price: 195000, image: 'https://placehold.co/400x400/f8fafc/334155?text=Smart+TV+LG', storeName: 'EletronicosPlus', storeSlug: 'eletronicos-plus', province: 'Huambo', condition: 'novo' as const, rating: 4.3, reviewCount: 45, stock: 7 },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/produtos" className="hover:text-emerald-600 transition-colors">Produtos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-5">
          <div>
            <Badge variant="secondary" className="mb-2">
              {conditionLabels[product.condition]}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
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
            <span className="text-sm text-gray-400">({product.reviewCount} avaliações)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-emerald-700">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{product.province}, Angola</span>
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
                <p className="text-sm font-medium text-gray-900">Entrega disponivel</p>
                <p className="text-xs text-gray-500">Envio para todo o pais</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Compra protegida</p>
                <p className="text-xs text-gray-500">Devolucao em 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Devolucao gratuita</p>
                <p className="text-xs text-gray-500">Se nao estiver satisfeito</p>
              </div>
            </div>
          </div>

          <Link href={`/lojas/${product.storeSlug}`}>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <Avatar fallback={product.storeName} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{product.storeName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.storeRating}</span>
                  <span>·</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{product.storeLocation}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Visitar Loja</Button>
            </div>
          </Link>
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
            Avaliações ({product.reviews.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{product.reviewCount} avaliações</p>
              </div>
            </div>
            {product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review, i) => (
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
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhuma avaliação ainda.</p>
            )}
          </div>
        )}
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos Relacionados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
