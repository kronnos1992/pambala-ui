import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginApi, registerApi, fetchMe } from '@/lib/api-helpers'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'buyer' | 'seller' | 'admin'
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  loginWithApi: (email: string, password: string) => Promise<void>
  registerWithApi: (data: { name: string; email: string; password: string; phone?: string; role?: 'BUYER' | 'SELLER' }) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

function mapRole(role: string): User['role'] {
  const r = role.toLowerCase()
  if (r === 'seller') return 'seller'
  if (r === 'admin') return 'admin'
  return 'buyer'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      loginWithApi: async (email, password) => {
        const data = await loginApi(email, password)
        set({
          token: data.token,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: mapRole(data.user.role),
            avatar: data.user.avatar,
          },
        })
        // Sync local cart to API after login
        try {
          const { useCartStore } = await import('./cart-store')
          await useCartStore.getState().syncWithApi()
        } catch {}
      },
      registerWithApi: async (regData) => {
        const data = await registerApi({
          name: regData.name,
          email: regData.email,
          password: regData.password,
          phone: regData.phone,
          role: regData.role,
        })
        set({
          token: data.token,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: mapRole(data.user.role),
            avatar: data.user.avatar,
          },
        })
        // Sync local cart to API after register
        try {
          const { useCartStore } = await import('./cart-store')
          await useCartStore.getState().syncWithApi()
        } catch {}
      },
      refreshUser: async () => {
        try {
          const u = await fetchMe()
          set({
            user: {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: mapRole(u.role),
              avatar: u.avatar,
            },
          })
        } catch {
          // token expired or invalid
          set({ user: null, token: null })
        }
      },
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'pambala-auth',
    }
  )
)
