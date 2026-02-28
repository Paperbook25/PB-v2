import { apiPost } from './api-client'
import type { AuditAction, AuditModule } from '@/features/settings/types/settings.types'

export interface AuditLogRequest {
  action: AuditAction
  module: AuditModule
  entityType: string
  entityId: string
  entityName: string
  description: string
  changes?: { field: string; oldValue: string; newValue: string }[]
}

/**
 * Logs an audit event to the server.
 * This is a fire-and-forget operation - errors are logged but don't throw.
 */
export async function logAuditEvent(event: AuditLogRequest): Promise<void> {
  try {
    await apiPost('/api/settings/audit-log', event)
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the app
    console.error('[Audit] Failed to log event:', error)
  }
}

/**
 * Helper functions for common audit operations
 */
export const audit = {
  create: (
    module: AuditModule,
    entityType: string,
    entityId: string,
    entityName: string,
    description?: string
  ) =>
    logAuditEvent({
      action: 'create',
      module,
      entityType,
      entityId,
      entityName,
      description: description || `Created ${entityType}: ${entityName}`,
    }),

  update: (
    module: AuditModule,
    entityType: string,
    entityId: string,
    entityName: string,
    changes?: { field: string; oldValue: string; newValue: string }[],
    description?: string
  ) =>
    logAuditEvent({
      action: 'update',
      module,
      entityType,
      entityId,
      entityName,
      description: description || `Updated ${entityType}: ${entityName}`,
      changes,
    }),

  delete: (
    module: AuditModule,
    entityType: string,
    entityId: string,
    entityName: string,
    description?: string
  ) =>
    logAuditEvent({
      action: 'delete',
      module,
      entityType,
      entityId,
      entityName,
      description: description || `Deleted ${entityType}: ${entityName}`,
    }),

  statusChange: (
    module: AuditModule,
    entityType: string,
    entityId: string,
    entityName: string,
    oldStatus: string,
    newStatus: string,
    description?: string
  ) =>
    logAuditEvent({
      action: 'status_change',
      module,
      entityType,
      entityId,
      entityName,
      description: description || `Changed ${entityType} status from "${oldStatus}" to "${newStatus}"`,
      changes: [{ field: 'status', oldValue: oldStatus, newValue: newStatus }],
    }),

  export: (
    module: AuditModule,
    entityType: string,
    description: string
  ) =>
    logAuditEvent({
      action: 'export',
      module,
      entityType,
      entityId: 'bulk',
      entityName: entityType,
      description,
    }),

  import: (
    module: AuditModule,
    entityType: string,
    count: number,
    description?: string
  ) =>
    logAuditEvent({
      action: 'import',
      module,
      entityType,
      entityId: 'bulk',
      entityName: entityType,
      description: description || `Imported ${count} ${entityType} records`,
    }),

  login: () =>
    logAuditEvent({
      action: 'login',
      module: 'auth',
      entityType: 'Session',
      entityId: 'current',
      entityName: 'User Session',
      description: 'User logged in',
    }),

  logout: () =>
    logAuditEvent({
      action: 'logout',
      module: 'auth',
      entityType: 'Session',
      entityId: 'current',
      entityName: 'User Session',
      description: 'User logged out',
    }),
}
