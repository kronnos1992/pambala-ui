'use client'

import { useEffect, useState } from 'react'
import { e2eClient } from '@/lib/e2e-client'

/**
 * Hook para inicializar E2E na aplicação
 */
export function useE2EInit() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initE2E = async () => {
      try {
        setLoading(true)
        await e2eClient.init()
        setInitialized(true)
        setError(null)
      } catch (err: any) {
        console.error('E2E initialization failed:', err)
        setError(err.message || 'Failed to initialize E2E encryption')
        setInitialized(false)
      } finally {
        setLoading(false)
      }
    }

    initE2E()
  }, [])

  return {
    initialized,
    loading,
    error,
    status: e2eClient.getStatus(),
  }
}
