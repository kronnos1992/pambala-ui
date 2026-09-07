'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useTranslate } from '@/hooks/use-translate'

interface LocaleContextType {
  isTranslating: boolean
  translationError: string | null
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const { translateBatch, loading, error } = useTranslate()
  const [pageTexts, setPageTexts] = useState<{ id: string; text: string }[]>([])

  // Extract all text content from the page for translation
  useEffect(() => {
    if (locale === 'pt') return // Skip if Portuguese (source language)

    const extractPageTexts = () => {
      const texts: { id: string; text: string }[] = []
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      )

      let node: Node | null
      let id = 0
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim()
        if (text && text.length > 2 && text.length < 500) {
          // Filter out very short or very long texts
          texts.push({
            id: `text-${id}`,
            text,
          })
          id++
        }
      }

      return texts
    }

    // Slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const texts = extractPageTexts()
      if (texts.length > 0) {
        setPageTexts(texts)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [locale])

  // Translate extracted texts
  useEffect(() => {
    if (!pageTexts.length || locale === 'pt') return

    const performTranslation = async () => {
      const translations = await translateBatch(pageTexts, locale)
      if (translations) {
        // Apply translations to DOM
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        )

        let node: Node | null
        let id = 0
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim()
          if (text && text.length > 2 && text.length < 500) {
            const textId = `text-${id}`
            if (translations[textId]) {
              node.textContent = translations[textId]
            }
            id++
          }
        }
      }
    }

    performTranslation()
  }, [pageTexts, locale, translateBatch])

  return (
    <LocaleContext.Provider value={{ isTranslating: loading, translationError: error }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocaleContext() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocaleContext must be used within LocaleProvider')
  }
  return context
}
