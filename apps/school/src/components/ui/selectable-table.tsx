import { ReactNode, forwardRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface SelectableTableHeadProps {
  /** Whether all rows are selected */
  checked: boolean
  /** Whether some rows are selected (indeterminate state) */
  indeterminate?: boolean
  /** Callback when checkbox is clicked */
  onCheckedChange: (checked: boolean) => void
  /** Additional className */
  className?: string
}

/**
 * Table header cell with select-all checkbox.
 *
 * @example
 * <TableHeader>
 *   <TableRow>
 *     <SelectableTableHead
 *       checked={isAllSelected}
 *       indeterminate={isPartiallySelected}
 *       onCheckedChange={() => toggleAll(items)}
 *     />
 *     <TableHead>Name</TableHead>
 *     ...
 *   </TableRow>
 * </TableHeader>
 */
export function SelectableTableHead({
  checked,
  indeterminate = false,
  onCheckedChange,
  className,
}: SelectableTableHeadProps) {
  return (
    <TableHead className={cn('w-[40px]', className)}>
      <Checkbox
        checked={indeterminate ? 'indeterminate' : checked}
        onCheckedChange={onCheckedChange}
        aria-label="Select all"
      />
    </TableHead>
  )
}

interface SelectableTableCellProps {
  /** Whether this row is selected */
  checked: boolean
  /** Callback when checkbox is clicked */
  onCheckedChange: (checked: boolean) => void
  /** Additional className */
  className?: string
}

/**
 * Table cell with row selection checkbox.
 *
 * @example
 * <TableRow>
 *   <SelectableTableCell
 *     checked={isSelected(item)}
 *     onCheckedChange={() => toggleItem(item)}
 *   />
 *   <TableCell>{item.name}</TableCell>
 *   ...
 * </TableRow>
 */
export function SelectableTableCell({
  checked,
  onCheckedChange,
  className,
}: SelectableTableCellProps) {
  return (
    <TableCell className={cn('w-[40px]', className)}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    </TableCell>
  )
}

interface SelectableTableRowProps {
  /** Whether this row is selected */
  selected?: boolean
  /** Callback when row is clicked (not checkbox) */
  onClick?: () => void
  /** Children content */
  children: ReactNode
  /** Additional className */
  className?: string
}

/**
 * Table row with selection highlighting.
 * Applies visual feedback when row is selected.
 */
export const SelectableTableRow = forwardRef<
  HTMLTableRowElement,
  SelectableTableRowProps
>(({ selected, onClick, children, className, ...props }, ref) => {
  return (
    <TableRow
      ref={ref}
      className={cn(
        selected && 'bg-muted/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      data-selected={selected}
      {...props}
    >
      {children}
    </TableRow>
  )
})
SelectableTableRow.displayName = 'SelectableTableRow'

/**
 * Empty state component for tables when no items are selected but actions require selection.
 */
export function NoSelectionMessage({
  message = 'Select items to perform bulk actions',
}: {
  message?: string
}) {
  return (
    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
      {message}
    </div>
  )
}
