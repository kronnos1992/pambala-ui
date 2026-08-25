'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, User, Package, MapPin, Heart, LogOut, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const orders = [
  { id: 'ORD-001', date: '2024-12-20', total: 450000, status: 'entregue', items: 2 },
  { id: 'ORD-002', date: '2024-12-18', total: 95000, status: 'enviado', items: 1 },
  { id: 'ORD-003', date: '2024-12-15', total: 280000, status: 'processando', items: 3 },
]

const statusColors: Record<string, string> = {
  entregue: 'bg-emerald-100 text-emerald-700',
  enviado: 'bg-blue-100 text-blue-700',
  processando: 'bg-amber-100 text-amber-700',
  cancelado: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  entregue: 'Entregue',
  enviado: 'Enviado',
  processando: 'Processando',
  cancelado: 'Cancelado',
}

export default function MinhaContaPage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [activeTab, setActiveTab] = React.useState('profile')
  const [form, setForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'addresses', label: 'Endereços', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ]

  const handleSaveProfile = () => {
    if (user) {
      setUser({ ...user, name: form.name, email: form.email, phone: form.phone })
      toast('Perfil atualizado com sucesso!', 'success')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Minha Conta</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <Avatar fallback={user?.name || 'U'} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user?.name || 'Utilizador'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@email.com'}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Meu Perfil</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar fallback={user?.name || 'U'} size="lg" className="h-20 w-20 text-xl" />
                <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  <Camera className="h-4 w-4" />
                  Alterar foto
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <Input
                  label="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Telefone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <Button className="mt-6" onClick={handleSaveProfile}>Guardar Alterações</Button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Os Meus Pedidos</h2>
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/minha-conta/pedidos/${order.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} · {order.items} itens</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} Kz</p>
                      <span className={cn('inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold', statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereços de Entrega</h2>
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">Nenhum endereco registrado.</p>
                <Button variant="outline" size="sm">Adicionar Endereço</Button>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Favoritos</h2>
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">Nenhum favorito ainda.</p>
                <Link href="/produtos"><Button variant="outline" size="sm">Explorar Produtos</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
