'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart, Store, Package, Star, FolderTree,
  Shield, Menu, X, LogOut, ExternalLink
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/users', label: 'Utilizadores', icon: Users },
  { href: '/admin/lojas', label: 'Lojas', icon: Store },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: FolderTree },
  { href: '/admin/avaliacoes', label: 'Avaliacoes', icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center dark:bg-[#0a0f1a]">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">Apenas administradores podem aceder a esta pagina.</p>
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">Voltar ao inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] transition-colors">
      <div className="flex">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          'flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex h-16 items-center justify-between border-b border-gray-100 dark:border-gray-700/50 px-5">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-gray-950 dark:text-white">Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white'
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto shrink-0 border-t border-gray-100 dark:border-gray-700/50 p-3 space-y-1">
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white transition-colors">
              <ExternalLink className="h-4.5 w-4.5 text-gray-500 dark:text-gray-300" />
              Ver Loja
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sair
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 glass-card bg-white/80 dark:bg-[#111827]/80 px-4 py-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-700 dark:text-gray-100 hover:text-gray-950 dark:hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-950 dark:text-white">{user?.name}</span>
            </div>
          </div>

          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
