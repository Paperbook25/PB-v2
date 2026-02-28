import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

/**
 * GlassCard - A glassmorphic card component matching paperbook-web design
 * Uses subtle blur effect with semi-transparent background
 */
const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'feature-card',
          !hover && 'hover:transform-none hover:shadow-none hover:border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
export type { GlassCardProps }
