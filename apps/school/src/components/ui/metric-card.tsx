import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { metricCardVariants } from '@/lib/design-tokens'

type MetricCardVariant = 'amber' | 'green' | 'rose' | 'blue' | 'purple'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down' }
  icon?: React.ReactNode
  variant?: MetricCardVariant
  className?: string
  children?: React.ReactNode
}

const variantStyles = metricCardVariants

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, trend, icon, variant = 'amber', className, children }, ref) => {
    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'metric-card relative overflow-hidden rounded-xl p-5 transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-1',
          className
        )}
        style={{
          backgroundColor: styles.bg,
          border: `1px solid ${styles.border}`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: styles.text }}
            >
              {value}
            </p>
            {trend && (
              <div
                className="flex items-center gap-1 mt-2 text-xs font-medium"
                style={{ color: trend.direction === 'up' ? 'var(--color-status-success)' : 'var(--color-status-error)' }}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}% vs last month
                </span>
              </div>
            )}
            {children}
          </div>
          {icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: styles.iconBg }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)

MetricCard.displayName = 'MetricCard'

export { MetricCard }
export type { MetricCardProps, MetricCardVariant }
