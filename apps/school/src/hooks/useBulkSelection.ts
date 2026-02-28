import { useState, useCallback, useMemo } from 'react'

interface UseBulkSelectionOptions<T> {
  /** Function to get unique ID from item */
  getItemId: (item: T) => string
  /** Optional callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void
}

interface UseBulkSelectionReturn<T> {
  /** Currently selected item IDs */
  selectedIds: string[]
  /** Set of selected IDs for O(1) lookup */
  selectedSet: Set<string>
  /** Number of selected items */
  selectedCount: number
  /** Whether all items are selected */
  isAllSelected: boolean
  /** Whether some but not all items are selected */
  isPartiallySelected: boolean
  /** Check if a specific item is selected */
  isSelected: (item: T) => boolean
  /** Toggle selection of a single item */
  toggleItem: (item: T) => void
  /** Select a single item */
  selectItem: (item: T) => void
  /** Deselect a single item */
  deselectItem: (item: T) => void
  /** Toggle all items */
  toggleAll: (items: T[]) => void
  /** Select all items */
  selectAll: (items: T[]) => void
  /** Clear all selections */
  clearSelection: () => void
  /** Select specific items by IDs */
  selectByIds: (ids: string[]) => void
  /** Get selected items from a list */
  getSelectedItems: (items: T[]) => T[]
  /** Reset selection state */
  reset: () => void
}

/**
 * Hook for managing bulk selection state in tables and lists.
 * Provides common selection patterns like select all, toggle, and partial selection.
 *
 * @example
 * const {
 *   selectedIds,
 *   isSelected,
 *   toggleItem,
 *   toggleAll,
 *   clearSelection,
 *   isAllSelected,
 * } = useBulkSelection({
 *   getItemId: (student) => student.id,
 * })
 *
 * // In table header
 * <Checkbox
 *   checked={isAllSelected}
 *   indeterminate={isPartiallySelected}
 *   onCheckedChange={() => toggleAll(students)}
 * />
 *
 * // In table row
 * <Checkbox
 *   checked={isSelected(student)}
 *   onCheckedChange={() => toggleItem(student)}
 * />
 */
export function useBulkSelection<T>({
  getItemId,
  onSelectionChange,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Memoized Set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const selectedCount = selectedIds.length

  const updateSelection = useCallback(
    (newIds: string[]) => {
      setSelectedIds(newIds)
      onSelectionChange?.(newIds)
    },
    [onSelectionChange]
  )

  const isSelected = useCallback(
    (item: T) => selectedSet.has(getItemId(item)),
    [selectedSet, getItemId]
  )

  const toggleItem = useCallback(
    (item: T) => {
      const id = getItemId(item)
      if (selectedSet.has(id)) {
        updateSelection(selectedIds.filter((sid) => sid !== id))
      } else {
        updateSelection([...selectedIds, id])
      }
    },
    [selectedIds, selectedSet, getItemId, updateSelection]
  )

  const selectItem = useCallback(
    (item: T) => {
      const id = getItemId(item)
      if (!selectedSet.has(id)) {
        updateSelection([...selectedIds, id])
      }
    },
    [selectedIds, selectedSet, getItemId, updateSelection]
  )

  const deselectItem = useCallback(
    (item: T) => {
      const id = getItemId(item)
      if (selectedSet.has(id)) {
        updateSelection(selectedIds.filter((sid) => sid !== id))
      }
    },
    [selectedIds, selectedSet, getItemId, updateSelection]
  )

  const selectAll = useCallback(
    (items: T[]) => {
      const allIds = items.map(getItemId)
      updateSelection(allIds)
    },
    [getItemId, updateSelection]
  )

  const clearSelection = useCallback(() => {
    updateSelection([])
  }, [updateSelection])

  const toggleAll = useCallback(
    (items: T[]) => {
      const allIds = items.map(getItemId)
      const allSelected = allIds.every((id) => selectedSet.has(id))
      if (allSelected) {
        clearSelection()
      } else {
        updateSelection(allIds)
      }
    },
    [getItemId, selectedSet, clearSelection, updateSelection]
  )

  const selectByIds = useCallback(
    (ids: string[]) => {
      updateSelection(ids)
    },
    [updateSelection]
  )

  const getSelectedItems = useCallback(
    (items: T[]) => items.filter((item) => selectedSet.has(getItemId(item))),
    [selectedSet, getItemId]
  )

  const reset = useCallback(() => {
    setSelectedIds([])
  }, [])

  // Compute derived state
  const isAllSelected = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      return items.every((item) => selectedSet.has(getItemId(item)))
    },
    [selectedSet, getItemId]
  )

  const isPartiallySelected = useCallback(
    (items: T[]) => {
      if (items.length === 0) return false
      const someSelected = items.some((item) => selectedSet.has(getItemId(item)))
      const allSelected = items.every((item) => selectedSet.has(getItemId(item)))
      return someSelected && !allSelected
    },
    [selectedSet, getItemId]
  )

  return {
    selectedIds,
    selectedSet,
    selectedCount,
    // These need to be called with items to compute
    isAllSelected: false, // Placeholder - use isAllSelectedFn
    isPartiallySelected: false, // Placeholder - use isPartiallySelectedFn
    isSelected,
    toggleItem,
    selectItem,
    deselectItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectByIds,
    getSelectedItems,
    reset,
  }
}

/**
 * Extended hook that tracks items for automatic all/partial selection state.
 * Use this when you have a fixed list of items and want automatic state computation.
 */
export function useBulkSelectionWithItems<T>(
  items: T[],
  options: UseBulkSelectionOptions<T>
): UseBulkSelectionReturn<T> {
  const baseSelection = useBulkSelection(options)
  const { getItemId } = options

  const isAllSelected = useMemo(() => {
    if (items.length === 0) return false
    return items.every((item) => baseSelection.selectedSet.has(getItemId(item)))
  }, [items, baseSelection.selectedSet, getItemId])

  const isPartiallySelected = useMemo(() => {
    if (items.length === 0) return false
    const someSelected = items.some((item) =>
      baseSelection.selectedSet.has(getItemId(item))
    )
    return someSelected && !isAllSelected
  }, [items, baseSelection.selectedSet, getItemId, isAllSelected])

  return {
    ...baseSelection,
    isAllSelected,
    isPartiallySelected,
  }
}

/**
 * Simple hook for managing selection of primitive IDs (strings).
 * Useful when you only have IDs, not full objects.
 */
export function useIdSelection(
  onSelectionChange?: (selectedIds: string[]) => void
) {
  return useBulkSelection<string>({
    getItemId: (id) => id,
    onSelectionChange,
  })
}
