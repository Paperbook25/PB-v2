import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * Skeleton for stat cards (used in dashboards)
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Grid of stat card skeletons
 */
export function StatCardsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for table rows with avatar
 */
export function TableRowWithAvatarSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-20" />
        </TableCell>
      ))}
    </TableRow>
  )
}

/**
 * Skeleton for simple table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </TableCell>
      ))}
    </TableRow>
  )
}

/**
 * Multiple table row skeletons
 */
export function TableBodySkeleton({
  rows = 5,
  columns = 5,
  withAvatar = false,
}: {
  rows?: number
  columns?: number
  withAvatar?: boolean
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) =>
        withAvatar ? (
          <TableRowWithAvatarSkeleton key={i} columns={columns} />
        ) : (
          <TableRowSkeleton key={i} columns={columns} />
        )
      )}
    </>
  )
}

/**
 * Skeleton for content cards (books, courses, etc.)
 */
export function ContentCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <Skeleton className="aspect-[3/4]" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  )
}

/**
 * Grid of content card skeletons
 */
export function ContentCardsGridSkeleton({
  count = 6,
  columns = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}: {
  count?: number
  columns?: string
}) {
  return (
    <div className={cn('grid gap-4', columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for horizontal list items
 */
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between p-4 border rounded-lg', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

/**
 * Multiple list item skeletons
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for charts
 */
export function ChartSkeleton({
  height = 250,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Skeleton className="w-full" style={{ height }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading chart...</div>
      </div>
    </div>
  )
}

/**
 * Skeleton for form fields
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

/**
 * Skeleton for a form with multiple fields
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

/**
 * Full page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats */}
      <StatCardsGridSkeleton />

      {/* Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Simple inline loading spinner
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

/**
 * Centered loading state with optional message
 */
export function LoadingState({
  message = 'Loading...',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
