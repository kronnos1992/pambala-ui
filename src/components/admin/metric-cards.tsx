'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  color: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

interface MetricCardsProps {
  metrics: Metric[]
  className?: string
}

export function MetricCards({ metrics, className }: MetricCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div key={metric.label} className="glass-card rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white', metric.color)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              {metric.trend && metric.trendValue && (
                <span className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  metric.trend === 'up' && 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
                  metric.trend === 'down' && 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
                  metric.trend === 'neutral' && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200',
                )}>
                  {metric.trend === 'up' && '↑'}{metric.trend === 'down' && '↓'} {metric.trendValue}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-200">{metric.label}</p>
            {metric.sub && <p className="text-xs text-gray-400 dark:text-gray-300 mt-0.5">{metric.sub}</p>}
          </div>
        )
      })}
    </div>
  )
}
