import { useCallback } from 'react'
import { audit } from '@/lib/audit'
import type { AuditModule } from '@/features/settings/types/settings.types'

/**
 * Hook for audit logging in React components.
 * Provides memoized audit functions scoped to a specific module.
 */
export function useAudit(module: AuditModule) {
  const create = useCallback(
    (entityType: string, entityId: string, entityName: string, description?: string) =>
      audit.create(module, entityType, entityId, entityName, description),
    [module]
  )

  const update = useCallback(
    (
      entityType: string,
      entityId: string,
      entityName: string,
      changes?: { field: string; oldValue: string; newValue: string }[],
      description?: string
    ) => audit.update(module, entityType, entityId, entityName, changes, description),
    [module]
  )

  const remove = useCallback(
    (entityType: string, entityId: string, entityName: string, description?: string) =>
      audit.delete(module, entityType, entityId, entityName, description),
    [module]
  )

  const statusChange = useCallback(
    (
      entityType: string,
      entityId: string,
      entityName: string,
      oldStatus: string,
      newStatus: string,
      description?: string
    ) => audit.statusChange(module, entityType, entityId, entityName, oldStatus, newStatus, description),
    [module]
  )

  const exportData = useCallback(
    (entityType: string, description: string) => audit.export(module, entityType, description),
    [module]
  )

  const importData = useCallback(
    (entityType: string, count: number, description?: string) =>
      audit.import(module, entityType, count, description),
    [module]
  )

  return {
    create,
    update,
    remove,
    statusChange,
    exportData,
    importData,
  }
}
