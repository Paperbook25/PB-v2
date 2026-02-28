import * as React from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  data: number[]
  width?: number
  height?: number
  color?: string
  showArea?: boolean
  strokeWidth?: number
}

const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      width = 80,
      height = 24,
      color = 'currentColor',
      showArea = true,
      strokeWidth = 1.5,
      className,
      ...props
    },
    ref
  ) => {
    // useId must be called before any early returns
    const gradientId = React.useId()

    if (!data || data.length < 2) {
      return null
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return { x, y }
    })

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className={cn('', className)}
        {...props}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {showArea && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
          />
        )}

        <path
          d={linePath}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* End point dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2}
          fill={color}
        />
      </svg>
    )
  }
)

Sparkline.displayName = 'Sparkline'

export { Sparkline }
export type { SparklineProps }
