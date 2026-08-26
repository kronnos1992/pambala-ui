'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight, Trash2, BadgeCheck, BadgeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchAdminStores, toggleStoreVerification, deleteStore } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

export default function AdminStoresPage() {
  const [stores, setStores] = React.useState<any[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [verified, setVerified] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminStores({ page, limit: 15, q: search || undefined, verified: verified || undefined })
      .then((data) => { setStores(data.stores); setPagination(data.pagination) })
      .catch(() => toast('Erro ao carregar lojas', 'error'))
      .finally(() => setLoading(false))
  }, [page, verified, search])

  React.useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleToggleVerify = async (storeId: string) => {
    try {
      await toggleStoreVerification(storeId)
      toast('Loja atualizada', 'success')
      load()
    } catch {
      toast('Erro ao atualizar loja', 'error')
    }
  }

  const handleDelete = async (storeId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja eliminar a loja "${name}"?`)) return
    try {
      await deleteStore(storeId)
      toast('Loja eliminada', 'success')
      load()
    } catch {
      toast('Erro ao eliminar loja', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerir Lojas</h1>
        <span className="text-sm text-gray-500 dark:text-gray-300">{pagination.total} lojas</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar loja..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <Button type="submit" size="sm">Pesquisar</Button>
        </form>
        <div className="flex gap-2">
          {['', 'true', 'false'].map((v) => (
            <button
              key={v}
              onClick={() => { setVerified(v); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                verified === v ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {v === '' ? 'Todas' : v === 'true' ? 'Verificadas' : 'Nao Verif.'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Proprietario</th>
                  <th className="px-4 py-3">Provincia</th>
                  <th className="px-4 py-3">Produtos</th>
                  <th className="px-4 py-3">Avaliacoes</th>
                  <th className="px-4 py-3">Verificada</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{store.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-200">{store.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{store.province}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{store._count?.products || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{store._count?.reviews || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleVerify(store.id)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
                          store.isVerified ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        )}
                      >
                        {store.isVerified ? <BadgeCheck className="h-3.5 w-3.5" /> : <BadgeX className="h-3.5 w-3.5" />}
                        {store.isVerified ? 'Sim' : 'Nao'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(store.id, store.name)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">Nenhuma loja encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-200">Pagina {pagination.page} de {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
