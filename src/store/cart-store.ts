import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addToCart, updateCartItem, removeCartItem, clearCartApi, fetchCart } from '@/lib/api-helpers'
import { useAuthStore } from './auth-store'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  storeId: string
  storeName: string
  maxQuantity: number
  cartItemId?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncWithApi: () => Promise<void>
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        const token = useAuthStore.getState().token
        if (token) {
          try {
            const cart = await addToCart(item.id, 1)
            const mapped = cart.items.map((ci) => ({
              id: ci.product.id,
              name: ci.product.name,
              price: ci.product.price,
              image: Array.isArray(ci.product.images) ? ci.product.images[0] : (ci.product.images || ''),
              quantity: ci.quantity,
              storeId: ci.product.storeId || '',
              storeName: ci.product.store?.name || 'Loja',
              maxQuantity: ci.product.stock,
              cartItemId: ci.id,
            }))
            set({ items: mapped })
            return
          } catch {
            // fall through to local
          }
        }
        // Local fallback
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },
      removeItem: async (id) => {
        const token = useAuthStore.getState().token
        const state = get()
        const cartItem = state.items.find((i) => i.id === id)
        if (token && cartItem?.cartItemId) {
          try {
            await removeCartItem(cartItem.cartItemId)
            await get().syncWithApi()
            return
          } catch {
            // fall through
          }
        }
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(id)
        }
        const token = useAuthStore.getState().token
        const state = get()
        const cartItem = state.items.find((i) => i.id === id)
        if (token && cartItem?.cartItemId) {
          try {
            await updateCartItem(cartItem.cartItemId, quantity)
            await get().syncWithApi()
            return
          } catch {
            // fall through
          }
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          ),
        }))
      },
      clearCart: async () => {
        const token = useAuthStore.getState().token
        if (token) {
          try {
            await clearCartApi()
          } catch {
            // ignore
          }
        }
        set({ items: [] })
      },
      syncWithApi: async () => {
        const token = useAuthStore.getState().token
        if (!token) return
        try {
          const localItems = get().items.filter((i) => !i.cartItemId)
          for (const item of localItems) {
            await addToCart(item.id, item.quantity)
          }
          const cart = await fetchCart()
          const mapped = cart.items.map((ci) => ({
            id: ci.product.id,
            name: ci.product.name,
            price: ci.product.price,
            image: Array.isArray(ci.product.images) ? ci.product.images[0] : (ci.product.images || ''),
            quantity: ci.quantity,
            storeId: ci.product.storeId || '',
            storeName: ci.product.store?.name || 'Loja',
            maxQuantity: ci.product.stock,
            cartItemId: ci.id,
          }))
          set({ items: mapped })
        } catch {
          // ignore
        }
      },
      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'pambala-cart',
    }
  )
)
