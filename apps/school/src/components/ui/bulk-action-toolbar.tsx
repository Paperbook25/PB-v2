import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkActionToolbarProps {
  /** Number of selected items */
  selectedCount: number
  /** Label for what's selected (e.g., "students", "records") */
  itemLabel?: string
  /** Actions to display */
  children: ReactNode
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Additional className */
  className?: string
  /** Whether to show the toolbar even when nothing is selected */
  alwaysShow?: boolean
}

/**
 * Toolbar that appears when items are selected in a table/list.
 * Shows selection count and provides bulk action buttons.
 *
 * @example
 * <BulkActionToolbar
 *   selectedCount={selectedIds.length}
 *   itemLabel="students"
 *   onClearSelection={clearSelection}
 * >
 *   <Button variant="outline" size="sm" onClick={handleBulkDelete}>
 *     <Trash className="h-4 w-4 mr-2" />
 *     Delete
 *   </Button>
 *   <Button variant="outline" size="sm" onClick={handleBulkExport}>
 *     <Download className="h-4 w-4 mr-2" />
 *     Export
 *   </Button>
 * </BulkActionToolbar>
 */
export function BulkActionToolbar({
  selectedCount,
  itemLabel = 'items',
  children,
  onClearSelection,
  className,
  alwaysShow = false,
}: BulkActionToolbarProps) {
  if (selectedCount === 0 && !alwaysShow) {
    return null
  }

  const label = selectedCount === 1 ? itemLabel.replace(/s$/, '') : itemLabel

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 bg-muted/50 border rounded-lg',
        'animate-in fade-in-0 slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} {label} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

interface BulkActionButtonProps {
  /** Button label */
  label: string
  /** Icon to display */
  icon?: ReactNode
  /** Click handler */
  onClick: () => void
  /** Whether action is in progress */
  loading?: boolean
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  /** Whether button is disabled */
  disabled?: boolean
}

/**
 * Standard button for use within BulkActionToolbar.
 */
export function BulkActionButton({
  label,
  icon,
  onClick,
  loading = false,
  variant = 'outline',
  disabled = false,
}: BulkActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {label}
    </Button>
  )
}

/**
 * Floating variant of the toolbar that sticks to the bottom of the viewport.
 */
export function FloatingBulkActionToolbar({
  selectedCount,
  itemLabel = 'items',
  children,
  onClearSelection,
  className,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null
  }

  const label = selectedCount === 1 ? itemLabel.replace(/s$/, '') : itemLabel

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 bg-background border rounded-lg shadow-lg',
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {selectedCount}
        </div>
        <span className="text-sm font-medium">{label} selected</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
