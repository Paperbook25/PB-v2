import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  showPercentage?: boolean
  className?: string
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      progress,
      size = 100,
      strokeWidth = 10,
      color = '#10b981',
      trackColor,
      label,
      showPercentage = true,
      className,
    },
    ref
  ) => {
    const normalizedProgress = Math.min(100, Math.max(0, progress))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference
    const center = size / 2

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor || 'currentColor'}
            strokeWidth={strokeWidth}
            className={cn(!trackColor && 'text-muted/20')}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span
              className="text-lg font-bold"
              style={{ color }}
            >
              {Math.round(normalizedProgress)}%
            </span>
          )}
          {label && (
            <span className="text-[10px] text-muted-foreground text-center px-2 leading-tight">
              {label}
            </span>
          )}
        </div>
      </div>
    )
  }
)

ProgressRing.displayName = 'ProgressRing'

export { ProgressRing }
export type { ProgressRingProps }
