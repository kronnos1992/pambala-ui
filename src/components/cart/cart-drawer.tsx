'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md glass-strong flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Carrinho ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carrinho vazio</h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">Adicione produtos ao seu carrinho.</p>
              <Button onClick={onClose} className="mt-4">Continuar a comprar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl glass-card p-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    unoptimized
                    loading="lazy"
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-200">{item.storeName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-200">Subtotal</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(total())}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full h-12 text-base">
                Finalizar Compra
              </Button>
            </Link>
            <Link
              href="/carrinho"
              onClick={onClose}
              className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
            >
              Ver carrinho
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
