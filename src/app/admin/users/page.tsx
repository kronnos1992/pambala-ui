'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight, Trash2, Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchAdminUsers, updateUserRole, deleteUser } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

const roleLabels: Record<string, string> = { BUYER: 'Comprador', SELLER: 'Vendedor', ADMIN: 'Administrador' }
const roleColors: Record<string, string> = { BUYER: 'bg-blue-100 text-blue-700', SELLER: 'bg-emerald-100 text-emerald-700', ADMIN: 'bg-purple-100 text-purple-700' }

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = React.useState(true)
  const [role, setRole] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchAdminUsers({ page, limit: 15, role: role || undefined, q: search || undefined })
      .then((data) => { setUsers(data.users); setPagination(data.pagination) })
      .catch(() => toast('Erro ao carregar utilizadores', 'error'))
      .finally(() => setLoading(false))
  }, [page, role, search])

  React.useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      toast('Role atualizado', 'success')
      load()
    } catch {
      toast('Erro ao atualizar role', 'error')
    }
  }

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja eliminar "${name}"?`)) return
    try {
      await deleteUser(userId)
      toast('Utilizador eliminado', 'success')
      load()
    } catch {
      toast('Erro ao eliminar utilizador', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerir Utilizadores</h1>
        <span className="text-sm text-gray-500">{pagination.total} utilizadores</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar por nome ou email..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <Button type="submit" size="sm">Pesquisar</Button>
        </form>
        <div className="flex gap-2">
          {['', 'BUYER', 'SELLER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                role === r ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {r ? roleLabels[r] : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registado</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={cn('text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer', roleColors[user.role])}
                      >
                        <option value="BUYER">{roleLabels.BUYER}</option>
                        <option value="SELLER">{roleLabels.SELLER}</option>
                        <option value="ADMIN">{roleLabels.ADMIN}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString('pt-AO')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhum utilizador encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Pagina {pagination.page} de {pagination.totalPages}</p>
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
