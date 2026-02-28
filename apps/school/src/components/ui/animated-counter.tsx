import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  formatFn?: (n: number) => string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

const AnimatedCounter = React.forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  (
    {
      value,
      duration = 1000,
      prefix = '',
      suffix = '',
      formatFn,
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(0)
    const previousValueRef = React.useRef(0)
    const animationRef = React.useRef<number | null>(null)

    React.useEffect(() => {
      const startValue = previousValueRef.current
      const endValue = value
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutExpo(progress)

        const currentValue = startValue + (endValue - startValue) * easedProgress
        setDisplayValue(currentValue)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          previousValueRef.current = endValue
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [value, duration])

    const formattedValue = formatFn
      ? formatFn(displayValue)
      : Math.round(displayValue).toLocaleString()

    return (
      <span
        ref={ref}
        className={cn('animate-count-up tabular-nums', className)}
        {...props}
      >
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    )
  }
)

AnimatedCounter.displayName = 'AnimatedCounter'

export { AnimatedCounter }
export type { AnimatedCounterProps }
