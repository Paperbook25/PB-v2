import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'

// ==================== PERMISSION DEFINITIONS ====================

interface PermissionDef {
  slug: string
  name: string
  description: string
  module: string
  action: string
}

const ALL_PERMISSIONS: PermissionDef[] = [
  // Students
  { slug: 'students.view', name: 'View Students', description: 'View student profiles and lists', module: 'students', action: 'view' },
  { slug: 'students.create', name: 'Create Students', description: 'Add new student records', module: 'students', action: 'create' },
  { slug: 'students.edit', name: 'Edit Students', description: 'Modify student information', module: 'students', action: 'edit' },
  { slug: 'students.delete', name: 'Delete Students', description: 'Remove student records', module: 'students', action: 'delete' },
  { slug: 'students.export', name: 'Export Students', description: 'Export student data', module: 'students', action: 'export' },

  // Staff
  { slug: 'staff.view', name: 'View Staff', description: 'View staff profiles and lists', module: 'staff', action: 'view' },
  { slug: 'staff.create', name: 'Create Staff', description: 'Add new staff members', module: 'staff', action: 'create' },
  { slug: 'staff.edit', name: 'Edit Staff', description: 'Modify staff information', module: 'staff', action: 'edit' },
  { slug: 'staff.delete', name: 'Delete Staff', description: 'Remove staff records', module: 'staff', action: 'delete' },
  { slug: 'staff.export', name: 'Export Staff', description: 'Export staff data', module: 'staff', action: 'export' },

  // Attendance
  { slug: 'attendance.view', name: 'View Attendance', description: 'View attendance records', module: 'attendance', action: 'view' },
  { slug: 'attendance.create', name: 'Mark Attendance', description: 'Mark daily attendance', module: 'attendance', action: 'create' },
  { slug: 'attendance.edit', name: 'Edit Attendance', description: 'Modify attendance records', module: 'attendance', action: 'edit' },
  { slug: 'attendance.export', name: 'Export Attendance', description: 'Export attendance data', module: 'attendance', action: 'export' },

  // Finance
  { slug: 'finance.view', name: 'View Finance', description: 'View financial records and reports', module: 'finance', action: 'view' },
  { slug: 'finance.create', name: 'Collect Fees', description: 'Record fee payments', module: 'finance', action: 'create' },
  { slug: 'finance.edit', name: 'Manage Fee Structure', description: 'Modify fee structures and categories', module: 'finance', action: 'edit' },
  { slug: 'finance.approve', name: 'Approve Expenses', description: 'Approve expense requests', module: 'finance', action: 'approve' },
  { slug: 'finance.export', name: 'Export Financial Data', description: 'Export financial reports', module: 'finance', action: 'export' },

  // Admissions
  { slug: 'admissions.view', name: 'View Admissions', description: 'View admission applications', module: 'admissions', action: 'view' },
  { slug: 'admissions.create', name: 'Create Applications', description: 'Create new admission applications', module: 'admissions', action: 'create' },
  { slug: 'admissions.edit', name: 'Process Applications', description: 'Review and update applications', module: 'admissions', action: 'edit' },
  { slug: 'admissions.approve', name: 'Approve Admissions', description: 'Approve or reject applications', module: 'admissions', action: 'approve' },
  { slug: 'admissions.export', name: 'Export Admissions', description: 'Export admission data', module: 'admissions', action: 'export' },

  // Library
  { slug: 'library.view', name: 'View Library', description: 'Browse library catalog', module: 'library', action: 'view' },
  { slug: 'library.create', name: 'Add Books', description: 'Add new books to catalog', module: 'library', action: 'create' },
  { slug: 'library.edit', name: 'Manage Library', description: 'Issue/return books, manage catalog', module: 'library', action: 'edit' },
  { slug: 'library.delete', name: 'Remove Books', description: 'Remove books from catalog', module: 'library', action: 'delete' },
  { slug: 'library.export', name: 'Export Library Data', description: 'Export library reports', module: 'library', action: 'export' },

  // Transport
  { slug: 'transport.view', name: 'View Transport', description: 'View routes and vehicles', module: 'transport', action: 'view' },
  { slug: 'transport.create', name: 'Add Routes/Vehicles', description: 'Create routes and add vehicles', module: 'transport', action: 'create' },
  { slug: 'transport.edit', name: 'Manage Transport', description: 'Edit routes, assign drivers', module: 'transport', action: 'edit' },
  { slug: 'transport.delete', name: 'Remove Routes/Vehicles', description: 'Remove transport records', module: 'transport', action: 'delete' },
  { slug: 'transport.export', name: 'Export Transport Data', description: 'Export transport reports', module: 'transport', action: 'export' },

  // Exams
  { slug: 'exams.view', name: 'View Exams', description: 'View exam schedules and results', module: 'exams', action: 'view' },
  { slug: 'exams.create', name: 'Create Exams', description: 'Schedule new examinations', module: 'exams', action: 'create' },
  { slug: 'exams.edit', name: 'Enter Marks', description: 'Enter and edit exam marks', module: 'exams', action: 'edit' },
  { slug: 'exams.approve', name: 'Publish Results', description: 'Approve and publish exam results', module: 'exams', action: 'approve' },
  { slug: 'exams.export', name: 'Export Results', description: 'Export exam data and report cards', module: 'exams', action: 'export' },

  // Settings
  { slug: 'settings.view', name: 'View Settings', description: 'View school settings', module: 'settings', action: 'view' },
  { slug: 'settings.edit', name: 'Manage Settings', description: 'Modify school configuration', module: 'settings', action: 'edit' },
  { slug: 'settings.permissions', name: 'Manage Permissions', description: 'Configure role permissions', module: 'settings', action: 'permissions' },

  // Dashboard
  { slug: 'dashboard.view', name: 'View Dashboard', description: 'Access the main dashboard', module: 'dashboard', action: 'view' },

  // Reports
  { slug: 'reports.view', name: 'View Reports', description: 'Access analytics and reports', module: 'reports', action: 'view' },
  { slug: 'reports.export', name: 'Export Reports', description: 'Download reports', module: 'reports', action: 'export' },
]

// ==================== DEFAULT ROLE GRANTS ====================

type RoleName = 'admin' | 'principal' | 'teacher' | 'accountant' | 'librarian' | 'transport_manager' | 'student' | 'parent'

const DEFAULT_ROLE_GRANTS: Record<RoleName, string[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.slug), // Full access
  principal: [
    'dashboard.view',
    'students.view', 'students.create', 'students.edit', 'students.export',
    'staff.view', 'staff.create', 'staff.edit', 'staff.export',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.export',
    'finance.view', 'finance.create', 'finance.edit', 'finance.approve', 'finance.export',
    'admissions.view', 'admissions.create', 'admissions.edit', 'admissions.approve', 'admissions.export',
    'library.view', 'library.create', 'library.edit', 'library.export',
    'transport.view', 'transport.create', 'transport.edit', 'transport.export',
    'exams.view', 'exams.create', 'exams.edit', 'exams.approve', 'exams.export',
    'settings.view', 'settings.edit', 'settings.permissions',
    'reports.view', 'reports.export',
  ],
  teacher: [
    'dashboard.view',
    'students.view',
    'attendance.view', 'attendance.create', 'attendance.edit',
    'library.view',
    'exams.view', 'exams.edit',
  ],
  accountant: [
    'dashboard.view',
    'students.view',
    'finance.view', 'finance.create', 'finance.edit', 'finance.export',
    'reports.view', 'reports.export',
  ],
  librarian: [
    'dashboard.view',
    'students.view',
    'library.view', 'library.create', 'library.edit', 'library.delete', 'library.export',
  ],
  transport_manager: [
    'dashboard.view',
    'students.view',
    'transport.view', 'transport.create', 'transport.edit', 'transport.delete', 'transport.export',
  ],
  student: [
    'dashboard.view',
    'attendance.view',
    'library.view',
    'exams.view',
  ],
  parent: [
    'dashboard.view',
    'attendance.view',
    'finance.view',
    'transport.view',
    'exams.view',
  ],
}

// Mutable store for customized permissions (starts from defaults)
const roleGrants: Record<string, Set<string>> = {}

function getGrantsForRole(role: string): Set<string> {
  if (!roleGrants[role]) {
    const defaults = DEFAULT_ROLE_GRANTS[role as RoleName] || []
    roleGrants[role] = new Set(defaults)
  }
  return roleGrants[role]
}

// ==================== HANDLERS ====================

export const permissionHandlers = [
  // GET /api/permissions/role/:role - Fetch all permissions with grant status for a role
  http.get('/api/permissions/role/:role', async ({ params }) => {
    await mockDelay('read')
    const role = params.role as string
    const grants = getGrantsForRole(role)

    const permissions = ALL_PERMISSIONS.map((p) => ({
      ...p,
      granted: grants.has(p.slug),
    }))

    return HttpResponse.json({ permissions })
  }),

  // PATCH /api/permissions/role/:role - Update permissions for a role
  http.patch('/api/permissions/role/:role', async ({ params, request }) => {
    await mockDelay('write')
    const role = params.role as string

    if (role === 'admin') {
      return HttpResponse.json(
        { error: 'Admin permissions cannot be modified' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as {
      permissions: { slug: string; granted: boolean }[]
    }

    const grants = getGrantsForRole(role)

    for (const perm of body.permissions) {
      if (perm.granted) {
        grants.add(perm.slug)
      } else {
        grants.delete(perm.slug)
      }
    }

    return HttpResponse.json({ success: true })
  }),
]
