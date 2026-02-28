import { cn } from '@/lib/utils'

interface ProgressTrackerProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<ProgressTrackerProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressTracker({ progress, size = 'md' }: ProgressTrackerProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 bg-secondary rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn('h-full bg-primary rounded-full transition-all duration-300')}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {Math.round(clampedProgress)}%
      </span>
    </div>
  )
}
