'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut,
  Package, Store, LayoutDashboard
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { fetchCategories, type ApiCategory } from '@/lib/api-helpers'

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const itemCount = useCartStore((s) => s.itemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrolled, setScrolled] = React.useState(false)
  const [categories, setCategories] = React.useState<ApiCategory[]>([])
  const [mounted, setMounted] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)
  const categoriesMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => { setMounted(true) }, [])

  React.useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-strong shadow-lg'
          : 'bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-green-400 shadow-md animate-glow">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-500 dark:from-emerald-400 dark:to-green-300 bg-clip-text text-transparent hidden sm:block">
              Pambala
            </span>
          </Link>

          <div className="relative hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que procura?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-r-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium text-sm hover:from-emerald-700 hover:to-green-600 transition-all shadow-md"
              >
                Pesquisar
              </button>
            </form>
          </div>

          <div className="relative hidden md:block" ref={categoriesMenuRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Categorias
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 rounded-xl glass-card py-2 z-[60]">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/produtos?category=${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <Link href="/carrinho" className="relative rounded-lg p-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-[10px] font-bold text-white shadow-md">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar src={user.avatar} fallback={user.name} size="sm" />
                  <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-100 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-card py-2 z-[60]" style={{ top: '100%' }}>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-200 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/minha-conta') }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors text-left"
                    >
                      <User className="h-4 w-4" />
                      Minha Conta
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/minha-conta/pedidos') }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors text-left"
                    >
                      <Package className="h-4 w-4" />
                      Pedidos
                    </button>
                    {user.role === 'seller' && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/vendedor') }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors text-left"
                      >
                        <Store className="h-4 w-4" />
                        Painel Vendedor
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/admin') }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors text-left"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Painel Admin
                      </button>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                        router.push('/')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registar</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 glass-strong">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="O que procura?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 flex-1 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-r-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          <nav className="px-4 pb-4 space-y-1">
            <div className="py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias</div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/produtos?category=${cat.slug}`}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-100 dark:border-gray-700" />
            {user ? (
              <>
                <Link
                  href="/minha-conta"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Minha Conta
                </Link>
                <Link
                  href="/minha-conta/pedidos"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" /> Pedidos
                </Link>
                {user.role === 'seller' && (
                  <Link
                    href="/vendedor"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Painel Vendedor
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Painel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                    router.push('/')
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Entrar</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Registar</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
