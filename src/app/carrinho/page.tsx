'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()

  const itemsByStore = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.storeName]) acc[item.storeName] = []
    acc[item.storeName].push(item)
    return acc
  }, {})

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Carrinho</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">O seu carrinho esta vazio</h1>
          <p className="text-gray-500 mb-6">Adicione produtos ao carrinho para continuar a comprar.</p>
          <Link href="/produtos">
            <Button size="lg">
              Explorar Produtos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Carrinho</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrinho ({items.length} itens)</h1>
        <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium">
          Limpar carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByStore).map(([storeName, storeItems]) => (
            <div key={storeName} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 bg-gray-50">
                <span className="text-sm font-semibold text-gray-900">{storeName}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {storeItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <Link href={`/produtos/${item.id}`}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="rounded-lg object-cover shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/produtos/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-emerald-700 line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-lg font-bold text-emerald-700 mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
            <div className="space-y-3 mb-4">
              {Object.entries(itemsByStore).map(([storeName, storeItems]) => (
                <div key={storeName} className="flex justify-between text-sm">
                  <span className="text-gray-600">{storeName}</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(storeItems.reduce((s, i) => s + i.price * i.quantity, 0))}
                  </span>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="flex justify-between mb-6">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-emerald-700">{formatPrice(total())}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full h-12 text-base">
                Finalizar Compra
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
