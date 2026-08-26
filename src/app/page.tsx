'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, Smartphone, Shield, CreditCard, Star, ArrowRight,
  Laptop, Shirt, Home, Car, Headphones, Flower2, Dumbbell, Utensils,
  Quote, ChevronLeft, ChevronRight, Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { StoreCard } from '@/components/store/store-card'
import { SearchBar } from '@/components/search/search-bar'
import { fetchFeaturedProducts, fetchStores, type UiProduct, type UiStore } from '@/lib/api-helpers'
import { formatPrice } from '@/lib/utils'

const categoryIcons: Record<string, React.ElementType> = {
  'Electronica e Tecnologia': Laptop,
  'Roupa e Acessorios': Shirt,
  'Eletrodomesticos': Home,
  'Moveis e Decoracao': Home,
  'Desporto e Lazer': Dumbbell,
  'Beleza e Saude': Flower2,
  'Servicos': Utensils,
  'Animais': Flower2,
}

const categoryColors: Record<string, string> = {
  'Electronica e Tecnologia': 'from-blue-500 to-indigo-500',
  'Roupa e Acessorios': 'from-pink-500 to-rose-500',
  'Eletrodomesticos': 'from-amber-500 to-orange-500',
  'Moveis e Decoracao': 'from-amber-500 to-orange-500',
  'Desporto e Lazer': 'from-emerald-500 to-green-500',
  'Beleza e Saude': 'from-fuchsia-500 to-pink-500',
  'Servicos': 'from-red-500 to-orange-500',
  'Animais': 'from-gray-500 to-gray-700',
}

const steps = [
  {
    icon: Search,
    title: 'Encontre',
    description: 'Pesquise entre milhares de produtos de lojas e vendedores verificados em toda Angola.',
  },
  {
    icon: CreditCard,
    title: 'Compre',
    description: 'Escolha o metodo de pagamento ideal: Multicaixa Express, transferencia ou pagamento na entrega.',
  },
  {
    icon: Smartphone,
    title: 'Receba',
    description: 'Receba o seu produto em casa com seguranca ou retire na loja mais proxima.',
  },
]

const testimonials = [
  {
    name: 'Maria Jose',
    role: 'Compradora',
    text: 'Pambala mudou a forma como compro online em Angola. Seguro, rapido e com excelentes precos!',
    rating: 5,
  },
  {
    name: 'Carlos Silva',
    role: 'Vendedor',
    text: 'Como vendedor, o Pambala aumentou muito as minhas vendas. A plataforma e facil de usar.',
    rating: 5,
  },
  {
    name: 'Ana Fernandes',
    role: 'Compradora',
    text: 'Adoro a variedade de produtos disponiveis. Ja comprei varias vezes e sempre fui bem atendida.',
    rating: 4,
  },
]

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0)
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [featuredProducts, setFeaturedProducts] = React.useState<UiProduct[]>([])
  const [topStores, setTopStores] = React.useState<UiStore[]>([])
  const [categories, setCategories] = React.useState<{ id: string; name: string; slug: string }[]>([])

  React.useEffect(() => {
    fetchFeaturedProducts().then(setFeaturedProducts).catch(() => {})
    fetchStores({ limit: 4 }).then((data) => setTopStores(data.stores)).catch(() => {})
    import('@/lib/api-helpers').then((m) =>
      m.fetchCategories().then(setCategories).catch(() => {})
    )
  }, [])

  const carouselProducts = featuredProducts.slice(0, 6)
  const slidesPerView = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1
  const maxSlide = Math.max(0, carouselProducts.length - slidesPerView)

  React.useEffect(() => {
    if (carouselProducts.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(timer)
  }, [carouselProducts.length, maxSlide])

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="dark:bg-[#0a0f1a]">
      {/* Hero Section with Product Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Compra e Venda{' '}
              <span className="text-yellow-300">em Angola</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-xl mx-auto"
            >
              O maior marketplace angolano. Milhares de produtos e lojas ao alcance da sua mao.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <SearchBar
                placeholder="Pesquisar smartphones, roupas, mobilia..."
                className="[&_input]:h-14 [&_button]:h-14 [&_button]:px-10 [&_button]:text-base"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/produtos">
                <Button size="lg" className="bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 hover:bg-gray-100 shadow-lg w-full sm:w-auto">
                  Explorar Produtos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Tornar-se Vendedor
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Product Carousel in Hero */}
          {carouselProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white/90">Mais Visitados</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => Math.min(maxSlide, prev + 1))}
                    disabled={currentSlide >= maxSlide}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <motion.div
                  className="flex gap-4"
                  animate={{ x: `-${currentSlide * (100 / slidesPerView)}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {carouselProducts.map((product) => (
                    <div key={product.id} className="shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="group block rounded-xl glass-card overflow-hidden"
                      >
                        <div className="flex items-center gap-4 p-3">
                          <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              unoptimized
                              loading="lazy"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white line-clamp-2">{product.name}</h3>
                            <p className="text-lg font-bold text-yellow-300 mt-1">{formatPrice(product.price)}</p>
                            {product.rating > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs text-white/80">{product.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </motion.div>
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide ? 'w-6 bg-white dark:bg-gray-300' : 'w-2 bg-white/40 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-[#0a0f1a] to-transparent" />
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 dark:bg-[#0a0f1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8"
          >
            Categorias Populares
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.name] || Laptop
              const color = categoryColors[cat.name] || 'from-gray-500 to-gray-700'
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/produtos?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-xl p-4 glass-card glass-shimmer"
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100 text-center">{cat.name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#111827] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4"
          >
            Como Funciona
          </motion.h2>
          <p className="text-center text-gray-600 dark:text-gray-200 mb-12 max-w-lg mx-auto">
            Comprar no Pambala e simples, seguro e rapido
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg animate-float">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-200 max-w-xs mx-auto">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 dark:bg-[#0a0f1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
            >
              Produtos em Destaque
            </motion.h2>
            <Link href="/produtos" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 8).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl glass-card p-4 animate-pulse">
                  <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 mb-3" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Stores */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#111827] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
            >
              Melhores Lojas
            </motion.h2>
            <Link href="/lojas" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {topStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topStores.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <StoreCard store={s} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl glass-card p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 dark:bg-[#0a0f1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8"
          >
            O que dizem os nossos utilizadores
          </motion.h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl glass-card p-8 text-center">
              <Quote className="h-10 w-10 text-emerald-200 dark:text-emerald-600 mx-auto mb-4" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-700 dark:text-gray-100 text-lg mb-4 italic">
                    &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                  </p>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonials[currentTestimonial].rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-200">{testimonials[currentTestimonial].role}</p>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass-pill text-gray-600 dark:text-gray-200 hover:text-emerald-600 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass-pill text-gray-600 dark:text-gray-200 hover:text-emerald-600 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-600 to-green-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center lg:text-left"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Compre de qualquer lugar de Angola
              </h2>
              <p className="text-emerald-100 mb-6 max-w-lg">
                Aceda a milhares de produtos de lojas e vendedores de todas as provincias. Entrega segura em todo o pais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" className="bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 hover:bg-gray-100 shadow-lg">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Em Breve no App Store
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Em Breve no Google Play
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm animate-float">
                <Shield className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">100% Seguro</h3>
                <p className="text-sm text-emerald-100">Compras protegidas</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#111827] transition-colors">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Fique por dentro
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-200 mb-6">
            Receba ofertas exclusivas e novidades direto no seu email.
          </p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Seu melhor email"
              className="h-12 flex-1 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            />
            <button className="h-12 px-6 rounded-r-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium hover:from-emerald-700 hover:to-green-600 transition-all shadow-md">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
