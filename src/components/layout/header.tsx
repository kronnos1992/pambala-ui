'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut,
  Package, Store, LayoutDashboard, Heart
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-green-400">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-500 bg-clip-text text-transparent hidden sm:block">
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
                  className="h-10 w-full rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-r-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium text-sm hover:from-emerald-700 hover:to-green-600 transition-all"
              >
                Pesquisar
              </button>
            </form>
          </div>

          <div className="relative hidden md:block" ref={userMenuRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Categorias
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/produtos?category=${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/carrinho" className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <Avatar src={user.avatar} fallback={user.name} size="sm" />
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/minha-conta"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      Pedidos
                    </Link>
                    <Link
                      href="/minha-conta?tab=favorites"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    {user.role === 'seller' && (
                      <Link
                        href="/vendedor"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Store className="h-4 w-4" />
                        Painel Vendedor
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                        router.push('/')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
              className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="O que procura?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 flex-1 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-sm focus:border-emerald-500 focus:outline-none"
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
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link
                  href="/minha-conta"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Minha Conta
                </Link>
                <Link
                  href="/minha-conta/pedidos"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" /> Pedidos
                </Link>
                {user.role === 'seller' && (
                  <Link
                    href="/vendedor"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Painel Vendedor
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                    router.push('/')
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
