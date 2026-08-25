'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, MapPin } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatPrice, truncate } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { toast } from '@/components/ui/toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    image: string
    images?: string[]
    storeName: string
    storeSlug?: string
    province: string
    condition: 'novo' | 'usado' | 'recondicionado'
    rating: number
    reviewCount: number
    stock: number
  }
}

const conditionLabels = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
}

const conditionColors = {
  novo: 'bg-emerald-100 text-emerald-700',
  usado: 'bg-amber-100 text-amber-700',
  recondicionado: 'bg-blue-100 text-blue-700',
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [liked, setLiked] = React.useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock <= 0) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeSlug || '',
      storeName: product.storeName,
      maxQuantity: product.stock,
    })
    toast(`${product.name} adicionado ao carrinho!`, 'success')
  }

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={cn(
          'absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold',
          conditionColors[product.condition]
        )}>
          {conditionLabels[product.condition]}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className={cn(
            'absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-all',
            liked
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500 backdrop-blur-sm'
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
        </button>
        {isHovered && product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg transition-all hover:scale-110 animate-in fade-in zoom-in-95 duration-200"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium text-gray-900">Esgotado</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 gap-1.5">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {truncate(product.name, 60)}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-emerald-700">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{product.storeName}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{product.province}</span>
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
