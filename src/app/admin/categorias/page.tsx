'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchCategories, createCategory, updateCategory, deleteCategory, type ApiCategory } from '@/lib/api-helpers'
import { toast } from '@/components/ui/toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<ApiCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: '', slug: '', icon: '' })
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => toast('Erro ao carregar categorias', 'error'))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditId(null)
    setForm({ name: '', slug: '', icon: '' })
    setShowForm(true)
  }

  const openEdit = (cat: ApiCategory) => {
    setEditId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('Nome obrigatorio', 'error')
      return
    }
    setSaving(true)
    try {
      if (editId) {
        await updateCategory(editId, form)
        toast('Categoria atualizada', 'success')
      } else {
        await createCategory(form)
        toast('Categoria criada', 'success')
      }
      setShowForm(false)
      load()
    } catch {
      toast('Erro ao guardar categoria', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (catId: string, name: string) => {
    if (!confirm(`Eliminar a categoria "${name}"?`)) return
    try {
      await deleteCategory(catId)
      toast('Categoria eliminada', 'success')
      load()
    } catch {
      toast('Erro ao eliminar categoria', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerir Categorias</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{editId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Electronica" />
            <Input label="Slug (opcional)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Ex: electronica" />
            <Input label="Icone (emoji)" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Ex: 📱" />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4 mr-1" />
              {saving ? 'A guardar...' : 'Guardar'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

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
                  <th className="px-4 py-3">Icone</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Produtos</th>
                  <th className="px-4 py-3">Subcategorias</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-lg">{cat.icon || '📁'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{(cat as any)._count?.products || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.children?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)} className="rounded-md p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">Nenhuma categoria encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
