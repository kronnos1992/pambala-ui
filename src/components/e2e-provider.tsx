'use client'

import React, { createContext, useContext } from 'react'
import { useE2EInit } from '@/hooks/use-e2e-init'

interface E2EContextType {
  initialized: boolean
  loading: boolean
  error: string | null
  status: any
}

const E2EContext = createContext<E2EContextType | undefined>(undefined)

export function E2EProvider({ children }: { children: React.ReactNode }) {
  const e2eInit = useE2EInit()

  if (e2eInit.error) {
    console.error('⚠️ E2E initialization failed:', e2eInit.error)
  }

  return (
    <E2EContext.Provider value={e2eInit}>
      {children}
    </E2EContext.Provider>
  )
}

export function useE2EContext() {
  const context = useContext(E2EContext)
  if (!context) {
    throw new Error('useE2EContext must be used within E2EProvider')
  }
  return context
}
