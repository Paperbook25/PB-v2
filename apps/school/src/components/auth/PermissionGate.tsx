import { useAuthStore } from '@/stores/useAuthStore'
import type { Role } from '@/types/common.types'

interface PermissionGateProps {
  children: React.ReactNode
  allowedRoles?: Role[]
  permission?: string
  fallback?: React.ReactNode
}

/**
 * PermissionGate - Conditionally renders children based on user's role or permission
 *
 * @example
 * // Role-based
 * <PermissionGate allowedRoles={['admin', 'principal']}>
 *   <DeleteButton />
 * </PermissionGate>
 *
 * @example
 * // Permission-based
 * <PermissionGate permission="students.write">
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  allowedRoles,
  permission,
  fallback = null,
}: PermissionGateProps) {
  const { hasRole, hasPermission } = useAuthStore()

  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook to check if user can perform an action
 */
export function usePermission() {
  const { user, hasRole, hasPermission } = useAuthStore()

  return {
    user,
    hasRole,
    hasPermission,
    isAdmin: hasRole(['admin']),
    isStaff: hasRole(['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager']),
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
    canManageStudents: hasRole(['admin', 'principal', 'teacher']),
    canManageStaff: hasRole(['admin', 'principal']),
    canManageFinance: hasRole(['admin', 'principal', 'accountant']),
    canManageLibrary: hasRole(['admin', 'principal', 'librarian']),
    canManageTransport: hasRole(['admin', 'principal', 'transport_manager']),
    canViewAttendance: hasRole(['admin', 'principal', 'teacher', 'student', 'parent']),
    canMarkAttendance: hasRole(['admin', 'principal', 'teacher']),
  }
}
