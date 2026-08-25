'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const conditions = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' },
  { value: 'recondicionado', label: 'Recondicionado' },
]

const sortOptions = [
  { value: 'recent', label: 'Mais recente' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'popular', label: 'Mais popular' },
]

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Icolo e Bengo', 'Luanda',
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
]

interface ProductFiltersProps {
  className?: string
  onMobileClose?: () => void
}

export function ProductFilters({ className, onMobileClose }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = React.useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('max') || '')
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>(
    searchParams.get('condition')?.split(',').filter(Boolean) || []
  )
  const [sort, setSort] = React.useState(searchParams.get('sort') || 'recent')
  const [province, setProvince] = React.useState(searchParams.get('province') || '')

  const updateParams = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('min', minPrice)
    else params.delete('min')
    if (maxPrice) params.set('max', maxPrice)
    else params.delete('max')
    if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','))
    else params.delete('condition')
    if (sort && sort !== 'recent') params.set('sort', sort)
    else params.delete('sort')
    if (province) params.set('province', province)
    else params.delete('province')
    params.delete('page')
    router.push(`/produtos?${params.toString()}`)
  }, [minPrice, maxPrice, selectedConditions, sort, province, searchParams, router])

  React.useEffect(() => {
    updateParams()
  }, [sort, province, updateParams])

  const toggleCondition = (value: string) => {
    setSelectedConditions((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedConditions([])
    setSort('recent')
    setProvince('')
    const params = new URLSearchParams(searchParams.toString())
    const q = params.get('q')
    const category = params.get('category')
    const newParams = new URLSearchParams()
    if (q) newParams.set('q', q)
    if (category) newParams.set('category', category)
    router.push(`/produtos?${newParams.toString()}`)
  }

  const hasFilters = minPrice || maxPrice || selectedConditions.length > 0 || sort !== 'recent' || province

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </h3>
        {onMobileClose && (
          <button onClick={onMobileClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preço (Kz)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={updateParams}>
          Aplicar
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condição</label>
        <div className="space-y-2">
          {conditions.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedConditions.includes(c.value)}
                onChange={() => toggleCondition(c.value)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Select
        label="Ordenar por"
        options={sortOptions}
        value={sort}
        onValueChange={setSort}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Província</label>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Todas</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
