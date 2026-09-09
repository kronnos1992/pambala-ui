import { create } from 'zustand'
import { fetchDisputeUnread, type DisputeUnreadItem } from '@/lib/api-helpers'

interface DisputeUnreadState {
  total: number
  items: DisputeUnreadItem[]
  loaded: boolean
  setData: (data: { total: number; items: DisputeUnreadItem[] }) => void
  setTotal: (total: number) => void
  refresh: () => Promise<void>
}

export const useDisputeUnreadStore = create<DisputeUnreadState>((set) => ({
  total: 0,
  items: [],
  loaded: false,
  setData: (data) => set({ total: data.total, items: data.items, loaded: true }),
  setTotal: (total) => set({ total }),
  refresh: async () => {
    try {
      const data = await fetchDisputeUnread()
      set({ total: data.total, items: data.items, loaded: true })
    } catch {
      // ignora erros silenciosos
    }
  },
}))