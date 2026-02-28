import { Suspense, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Default loading fallback for lazy-loaded components
 */
export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Wrapper component for lazy-loaded routes
 */
export function LazyRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <Suspense fallback={fallback ?? <PageLoader />}>
      {children}
    </Suspense>
  )
}
