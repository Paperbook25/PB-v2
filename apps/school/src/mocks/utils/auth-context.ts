import type { Role } from '@/types/common.types'

/**
 * User context extracted from request headers.
 * Used by MSW handlers to scope data access based on user role.
 */
export interface UserContext {
  role: Role
  studentId: string | null
  childIds: string[]
}

/**
 * Extracts user context from request headers.
 * Headers are set by the api-client based on auth store.
 */
export function getUserContext(request: Request): UserContext | null {
  const role = request.headers.get('X-User-Role') as Role | null

  if (!role) {
    return null
  }

  const studentId = request.headers.get('X-Student-Id')
  const childIdsHeader = request.headers.get('X-Child-Ids')
  const childIds = childIdsHeader ? childIdsHeader.split(',').filter(Boolean) : []

  return {
    role,
    studentId,
    childIds,
  }
}

/**
 * Checks if the current user can access a specific student's data.
 * - Students can only access their own data
 * - Parents can access their children's data
 * - Staff roles can access any student
 */
export function canAccessStudent(context: UserContext | null, studentId: string): boolean {
  if (!context) {
    return false
  }

  // Staff roles can access any student
  const staffRoles: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager']
  if (staffRoles.includes(context.role)) {
    return true
  }

  // Students can only access their own data
  if (context.role === 'student') {
    return context.studentId === studentId
  }

  // Parents can access their children's data
  if (context.role === 'parent') {
    return context.childIds.includes(studentId)
  }

  return false
}

/**
 * Gets the list of student IDs the current user can access.
 * Returns null for staff roles (indicating access to all students).
 * Returns specific IDs for students and parents.
 */
export function getAccessibleStudentIds(context: UserContext | null): string[] | null {
  if (!context) {
    return []
  }

  // Staff roles can access all students
  const staffRoles: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager']
  if (staffRoles.includes(context.role)) {
    return null // null means "all students"
  }

  // Students can only access their own data
  if (context.role === 'student' && context.studentId) {
    return [context.studentId]
  }

  // Parents can access their children's data
  if (context.role === 'parent') {
    return context.childIds
  }

  return []
}

/**
 * Checks if the user is a student.
 */
export function isStudent(context: UserContext | null): boolean {
  return context?.role === 'student'
}

/**
 * Checks if the user is a parent.
 */
export function isParent(context: UserContext | null): boolean {
  return context?.role === 'parent'
}

/**
 * Checks if the user is staff (non-student, non-parent).
 */
export function isStaff(context: UserContext | null): boolean {
  if (!context) return false
  const staffRoles: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager']
  return staffRoles.includes(context.role)
}
