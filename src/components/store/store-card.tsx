'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Star, MapPin, Package, Eye } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface StoreCardProps {
  store: {
    id: string
    name: string
    slug: string
    logo?: string
    rating: number
    productCount: number
    location: string
    description?: string
    views?: number
  }
  highlight?: boolean
}

export function StoreCard({ store, highlight = false }: StoreCardProps) {
  const t = useTranslations('storeCard')

  return (
    <Link
      href={`/lojas/${store.slug}`}
      className="group flex items-center gap-4 rounded-2xl glass-card glass-shimmer p-4"
    >
      <Avatar src={store.logo} fallback={store.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
          {store.name}
        </h3>
        {highlight && (
          <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <Star className="h-2.5 w-2.5 fill-current" />
            {t('mostVisited')}
          </span>
        )}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-100">{store.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
            <Package className="h-3 w-3" />
            <span>{t('productsCount', { count: store.productCount })}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
            <MapPin className="h-3 w-3" />
            <span>{store.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Eye className="h-3 w-3" />
            <span>{t('visitsCount', { count: store.views ?? 0 })}</span>
          </div>
        </div>
        {store.description && (
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-200 truncate">{store.description}</p>
        )}
      </div>
    </Link>
  )
}
