'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
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
import { fetchProductBySlug, fetchProducts, fetchProductReviews, mapCondition, type ApiProduct, type UiProduct, type ApiReview } from '@/lib/api-helpers'
import { ReviewForm } from '@/components/review/review-form'

const conditionLabels = { novo: 'Novo', usado: 'Usado', recondicionado: 'Recondicionado' }

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = useTranslations('productDetail')
  const tr = useTranslations('routes')
  const locale = useLocale()
  const { slug } = use(params)
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = React.useState(1)
  const [liked, setLiked] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'description' | 'reviews'>('description')
  const [product, setProduct] = React.useState<ApiProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = React.useState<UiProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [reviewsData, setReviewsData] = React.useState<{ reviews: ApiReview[]; avgRating: number } | null>(null)

  const loadReviews = React.useCallback(() => {
    if (!product?.id) return
    fetchProductReviews(product.id)
      .then((d) => setReviewsData({ reviews: d.reviews, avgRating: d.avgRating }))
      .catch(() => {})
  }, [product])

  React.useEffect(() => {
    Promise.resolve().then(() => setLoading(true))
    fetchProductBySlug(slug, locale)
      .then((p) => {
        setProduct(p)
        if (p.categoryId) {
          fetchProducts({ categoryId: p.categoryId, limit: 4, locale })
            .then((data) => setRelatedProducts(data.products.filter((rp: UiProduct) => rp.id !== p.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug, locale])

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notFound')}</h1>
        <Link href="/produtos" className="text-emerald-600 hover:text-emerald-700 mt-4 inline-block">{t('backToProducts')}</Link>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []
  const avgRating = reviewsData?.avgRating ?? (product.avgRating || 0)
  const condLabel = conditionLabels[mapCondition(product.condition)] || 'Novo'
  const reviews = reviewsData?.reviews ?? (product.reviews || [])

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || '',
        storeId: product.storeId,
        storeName: product.store?.name || t('storeLabel'),
        maxQuantity: product.stock,
      })
    }
    toast(t('addedToCartToast', { name: product.name }), 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/produtos" className="hover:text-emerald-600 transition-colors">{tr('products')}</Link>
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
            <span className="text-sm text-gray-400">({t('reviewsCount', { count: reviews.length })})</span>
          </div>
          {(product.salesCount && product.salesCount > 0) && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t('soldCount', { count: product.salesCount })}</span>
              <span>·</span>
              <span>{t('viewsCount', { count: product.views })}</span>
            </div>
          )}

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
              <span className="text-emerald-600 font-medium">{t('inStock', { count: product.stock })}</span>
            ) : (
              <span className="text-red-600 font-medium">{t('outOfStock')}</span>
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
              {t('addToCart')}
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('deliveryTitle')}</p>
                <p className="text-xs text-gray-500">{t('deliverySubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('protectionTitle')}</p>
                <p className="text-xs text-gray-500">{t('protectionSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('returnsTitle')}</p>
                <p className="text-xs text-gray-500">{t('returnsSubtitle')}</p>
              </div>
            </div>
          </div>

          {product.store && (
            <Link href={`/lojas/${product.store.slug}`}>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <Avatar src={product.store?.logo || undefined} fallback={product.store.name} size="lg" />
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
                <Button variant="outline" size="sm">{t('visitStore')}</Button>
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
            {t('descriptionTab')}
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
            {t('reviewsTab', { count: reviews.length })}
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description || t('noDescription')}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <ReviewForm productId={product.id} onSubmitted={loadReviews} />
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{t('reviewsCount', { count: reviews.length })}</p>
              </div>
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar fallback={review.user?.name || 'U'} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{review.user?.name || t('anonymous')}</p>
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
              <p className="text-center text-gray-500 py-8">{t('noReviews')}</p>
            )}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('relatedProducts')}</h2>
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
