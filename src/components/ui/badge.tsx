import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-emerald-600 text-white',
        secondary: 'border-transparent bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
        destructive: 'border-transparent bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
        outline: 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
