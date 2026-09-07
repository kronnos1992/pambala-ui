'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'

export interface TranslationResult {
  success: boolean
  translations: Record<string, string>
  error?: string
}

export function useTranslate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = useCallback(
    async (texts: string[], locale: string, source: string = 'pt'): Promise<Record<string, string> | null> => {
      if (!texts || texts.length === 0) return null
      if (locale === source) {
        return Object.fromEntries(texts.map((t) => [t, t]))
      }

      setLoading(true)
      setError(null)

      try {
        const response = await api.post<TranslationResult>('/translations/translate', {
          texts,
          locale,
          source,
        })

        if (response.data.success) {
          return response.data.translations
        } else {
          throw new Error(response.data.error || 'Translation failed')
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Translation service error'
        setError(errorMessage)
        console.error('Translation error:', errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const translateBatch = useCallback(
    async (
      items: { id: string; text: string }[],
      locale: string,
      source: string = 'pt'
    ): Promise<Record<string, string> | null> => {
      if (!items || items.length === 0) return null
      if (locale === source) {
        return Object.fromEntries(items.map((i) => [i.id, i.text]))
      }

      setLoading(true)
      setError(null)

      try {
        const response = await api.post<TranslationResult>('/translations/translate-batch', {
          items,
          locale,
          source,
        })

        if (response.data.success) {
          return response.data.translations
        } else {
          throw new Error(response.data.error || 'Translation failed')
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Translation service error'
        setError(errorMessage)
        console.error('Translation batch error:', errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    translate,
    translateBatch,
    loading,
    error,
  }
}
