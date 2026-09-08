import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginApi, registerApi, fetchMe, type ApiAuthUser, type ApiMeStore } from '@/lib/api-helpers'

type UiRole = 'buyer' | 'seller' | 'admin'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UiRole
  roles?: string[]
  avatar?: string
  aiValidationConsent?: boolean
  store?: ApiMeStore | null
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  loginWithApi: (email: string, password: string) => Promise<void>
  registerWithApi: (data: { name: string; email: string; password: string; phone?: string; role?: 'BUYER' | 'SELLER'; aiValidationConsent?: boolean }) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

function roleKeys(apiRoles?: ApiAuthUser['roles']): string[] {
  if (!Array.isArray(apiRoles)) return []
  return apiRoles.map((r) => (typeof r === 'string' ? r : r?.role?.key)).filter(Boolean)
}

function resolveUiRole(apiRole: string, apiRoles?: ApiAuthUser['roles']): UiRole {
  const keys = roleKeys(apiRoles).map((k) => k.toUpperCase())
  if (keys.includes('ADMIN') || apiRole.toUpperCase() === 'ADMIN') return 'admin'
  if (keys.includes('MANAGER') || keys.includes('SELLER') || apiRole.toUpperCase() === 'MANAGER' || apiRole.toUpperCase() === 'SELLER') return 'seller'
  return 'buyer'
}

function mapApiUser(apiUser: ApiAuthUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: resolveUiRole(apiUser.role, apiUser.roles),
    roles: roleKeys(apiUser.roles),
    avatar: apiUser.avatar,
    aiValidationConsent: apiUser.aiValidationConsent === true,
    store: apiUser.store ?? null,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      loginWithApi: async (email, password) => {
        const data = await loginApi(email, password)
        set({
          token: data.token,
          user: mapApiUser(data.user),
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
          aiValidationConsent: regData.aiValidationConsent,
        })
        set({
          token: data.token,
          user: mapApiUser(data.user),
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
            user: mapApiUser(u as ApiAuthUser),
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
