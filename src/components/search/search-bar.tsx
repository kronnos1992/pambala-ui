'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestions = [
  'iPhone 15', 'Samsung Galaxy', 'iPhone', 'Notebook', 'Televisao',
  'Sofa', 'Honda Civic', 'Tenis Nike', 'PlayStation 5', 'Arroz',
]

interface SearchBarProps {
  className?: string
  placeholder?: string
  defaultValue?: string
}

export function SearchBar({ className, placeholder, defaultValue = '' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const filteredSuggestions = React.useMemo(() => {
    if (query.length > 0) {
      return suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    }
    return suggestions.slice(0, 6)
  }, [query])

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/produtos?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder || 'Pesquisar produtos, lojas e mais...'}
            className="h-12 w-full rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="h-12 px-8 rounded-r-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold hover:from-emerald-700 hover:to-green-600 transition-all shadow-md"
        >
          Pesquisar
        </button>
      </form>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl glass-card py-2 z-50">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <SearchIcon className="h-4 w-4 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
