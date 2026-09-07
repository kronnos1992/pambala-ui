'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function NeuCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'w-full rounded-[30px] transition-all duration-300',
        'bg-[#e0e5ec] dark:bg-[#1f242e]',
        'shadow-[20px_20px_60px_#bec3cf,-20px_-20px_60px_#ffffff]',
        'dark:shadow-[20px_20px_60px_#14171f,-20px_-20px_60px_#2b313d]',
        className
      )}
    >
      {children}
    </div>
  )
}