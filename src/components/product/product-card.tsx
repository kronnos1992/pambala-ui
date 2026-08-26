'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, MapPin } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn, formatPrice, truncate } from '@/lib/utils'
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
  index?: number
}

const conditionLabels = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
}

const conditionColors = {
  novo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  usado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  recondicionado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl glass-card glass-shimmer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className={cn(
            'absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold backdrop-blur-sm',
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
              'absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-all backdrop-blur-sm',
              liked
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:text-red-500'
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="rounded-lg bg-white/90 dark:bg-gray-800/90 px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">Esgotado</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 gap-1.5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
            {truncate(product.name, 60)}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-200 truncate">{product.storeName}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
              <MapPin className="h-3 w-3" />
              <span>{product.province}</span>
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-100">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
