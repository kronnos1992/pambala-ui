'use client'

import * as React from 'react'
import { Search, ChevronRight, Grid3X3, Map } from 'lucide-react'
import { StoreCard } from '@/components/store/store-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { fetchStores, type UiStore } from '@/lib/api-helpers'

export default function LojasPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [view, setView] = React.useState<'grid' | 'map'>('grid')
  const [stores, setStores] = React.useState<UiStore[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchStores({ limit: 50 })
      .then((data) => setStores(data.stores))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Lojas</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="hidden sm:flex items-center rounded-lg border border-gray-200">
            <button
              onClick={() => setView('grid')}
              className={cn('flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors', view === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400 hover:text-gray-600')}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('map')}
              className={cn('flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors', view === 'map' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400 hover:text-gray-600')}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className="flex items-center justify-center h-96 rounded-xl bg-gray-100 border border-gray-200">
          <div className="text-center">
            <Map className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Vista de mapa em breve</p>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gray-100" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      {filteredStores.length === 0 && view === 'grid' && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-500">Nenhuma loja encontrada.</p>
        </div>
      )}
    </div>
  )
}
