import * as React from 'react'
import { cn } from '@/lib/utils'

interface DonutChartData {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutChartData[]
  centerLabel?: string
  centerValue?: string
  size?: number
  strokeWidth?: number
  className?: string
  showLegend?: boolean
  legendPosition?: 'right' | 'bottom'
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      centerLabel,
      centerValue,
      size = 160,
      strokeWidth = 24,
      className,
      showLegend = true,
      legendPosition = 'right',
    },
    ref
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    // Calculate stroke-dasharray for each segment
    let accumulatedOffset = 0
    const segments = data.map((item) => {
      const percentage = total > 0 ? item.value / total : 0
      const dashLength = percentage * circumference
      const dashOffset = circumference - accumulatedOffset
      accumulatedOffset += dashLength

      return {
        ...item,
        percentage,
        dashLength,
        dashOffset,
        dashArray: `${dashLength} ${circumference - dashLength}`,
      }
    })

    const isBottomLegend = legendPosition === 'bottom'

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-4',
          isBottomLegend ? 'flex-col items-center' : 'items-center',
          className
        )}
      >
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/20"
            />
            {/* Data segments */}
            {segments.map((segment, index) => {
              // Calculate cumulative offset for this segment
              const prevSegments = segments.slice(0, index)
              const prevLength = prevSegments.reduce((sum, s) => sum + s.dashLength, 0)

              return (
                <circle
                  key={segment.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={-prevLength}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  }}
                />
              )
            })}
          </svg>
          {/* Center content */}
          {(centerLabel || centerValue) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {centerValue && (
                <span className="text-2xl font-bold text-foreground">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-xs text-muted-foreground">{centerLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div
            className={cn(
              'flex gap-2 min-w-0',
              isBottomLegend ? 'flex-wrap justify-center' : 'flex-col'
            )}
          >
            {segments.map((segment) => (
              <div
                key={segment.name}
                className={cn(
                  'flex items-center gap-2 min-w-0',
                  isBottomLegend ? 'px-2' : ''
                )}
              >
                <div
                  className="h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-muted-foreground truncate min-w-0">
                  {segment.name}
                </span>
                <span className="text-sm font-semibold flex-shrink-0">
                  {Math.round(segment.percentage * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

DonutChart.displayName = 'DonutChart'

export { DonutChart }
export type { DonutChartProps, DonutChartData }
