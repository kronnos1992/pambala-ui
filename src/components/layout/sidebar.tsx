'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  count: number
  subcategories?: { name: string; count: number }[]
}

interface SidebarProps {
  categories: Category[]
  activeCategory?: string
  className?: string
}

export function Sidebar({ categories, activeCategory, className }: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <nav className={cn('space-y-1', className)}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 px-3">
        Categorias
      </h3>
      <Link
        href="/produtos"
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          !activeCategory
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
        )}
      >
        Todos
      </Link>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.name
        const isExpanded = expanded[cat.name]
        const hasSub = cat.subcategories && cat.subcategories.length > 0

        return (
          <div key={cat.name}>
            <div className="flex items-center">
              <Link
                href={`/produtos?category=${encodeURIComponent(cat.name)}`}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                    : 'text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isActive && 'text-emerald-500')} />
                <span className="flex-1">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count}</span>
              </Link>
              {hasSub && (
                <button
                  onClick={() => toggle(cat.name)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')} />
                </button>
              )}
            </div>
            {hasSub && isExpanded && (
              <div className="ml-6 mt-0.5 space-y-0.5">
                {cat.subcategories!.map((sub) => (
                  <Link
                    key={sub.name}
                    href={`/produtos?category=${encodeURIComponent(sub.name)}`}
                    className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>{sub.name}</span>
                    <span className="text-xs text-gray-400">{sub.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
