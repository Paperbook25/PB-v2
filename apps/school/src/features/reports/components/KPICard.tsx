import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import type { KPIMetric } from '../types/reports.types'
import { statusColors } from '@/lib/design-tokens'

interface KPICardProps {
  metric: KPIMetric
  className?: string
}

export function KPICard({ metric, className }: KPICardProps) {
  const formatValue = (value: number) => {
    if (metric.format === 'currency') {
      return formatCurrency(value)
    }
    if (metric.format === 'percent') {
      return `${value.toFixed(1)}%`
    }
    return value.toLocaleString('en-IN')
  }

  const getTrendIcon = () => {
    if (metric.trend === 'up') {
      return <TrendingUp className="h-4 w-4" style={{ color: statusColors.success }} />
    }
    if (metric.trend === 'down') {
      return <TrendingDown className="h-4 w-4" style={{ color: statusColors.error }} />
    }
    return <Minus className="h-4 w-4" style={{ color: statusColors.inactive }} />
  }

  const getTrendColorStyle = (): React.CSSProperties => {
    // For metrics like "Pending Fees", down is good
    const isNegativeMetric = metric.name.toLowerCase().includes('pending') ||
                             metric.name.toLowerCase().includes('overdue') ||
                             metric.name.toLowerCase().includes('defaulter')

    if (metric.trend === 'up') {
      return { color: isNegativeMetric ? statusColors.error : statusColors.success }
    }
    if (metric.trend === 'down') {
      return { color: isNegativeMetric ? statusColors.success : statusColors.error }
    }
    return { color: statusColors.inactive }
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{metric.name}</p>
            <p className="text-2xl font-bold">{formatValue(metric.value)}</p>
          </div>
          {metric.changePercent !== undefined && (
            <div className="flex items-center gap-1 text-sm" style={getTrendColorStyle()}>
              {getTrendIcon()}
              <span>{Math.abs(metric.changePercent).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {metric.previousValue !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            vs {formatValue(metric.previousValue)} last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
