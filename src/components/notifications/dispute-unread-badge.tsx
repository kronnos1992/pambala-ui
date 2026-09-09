'use client'

import { useDisputeUnreadStore } from '@/store/dispute-unread-store'
import { cn } from '@/lib/utils'

interface DisputeUnreadBadgeProps {
  className?: string
}

export function DisputeUnreadBadge({ className }: DisputeUnreadBadgeProps) {
  const total = useDisputeUnreadStore((s) => s.total)

  if (!total) return null

  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-1.5 text-[10px] font-bold text-white shadow-sm',
        className
      )}
    >
      {total > 99 ? '99+' : total}
    </span>
  )
}