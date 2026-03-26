import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { User, Role } from '@/types/common.types'
import { usePermissionStore } from './usePermissionStore'

const rolePermissions: Record<Role, string[]> = {
  admin: ['*'],
  principal: ['dashboard', 'students', 'staff', 'attendance', 'admissions', 'library', 'transport', 'finance', 'settings', 'exams', 'reports', 'communication', 'operations', 'management', 'website'],
  teacher: ['dashboard', 'students.view', 'attendance', 'attendance.mark', 'exams', 'exams.marks', 'library.view', 'timetable.view', 'communication', 'settings.communication', 'lms', 'behavior.view', 'parent-portal'],
  accountant: ['dashboard', 'finance', 'finance.collect', 'finance.reports', 'students.view', 'reports'],
  librarian: ['dashboard', 'library', 'library.manage', 'students.view'],
  transport_manager: ['dashboard', 'transport', 'transport.manage', 'operations.transport', 'students.view'],
  student: ['dashboard.student', 'library.view', 'attendance.view', 'timetable.view', 'exams.view', 'lms.view'],
  parent: ['dashboard.parent', 'attendance.view', 'finance.view', 'finance.my-fees', 'transport.view', 'parent-portal'],
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  sessionExpiredAt: number | null
  login: (user: User) => void
  logout: (reason?: 'manual' | 'session_expired') => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionExpiredAt: null,

      login: (user) => set({ user, isAuthenticated: true, sessionExpiredAt: null }),

      logout: (reason = 'manual') => {
        usePermissionStore.getState().setPermissions([])
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiredAt: reason === 'session_expired' ? Date.now() : null,
        })
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        const permissions = rolePermissions[user.role]
        return permissions.includes('*') || permissions.includes(permission)
      },

      hasRole: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.role)
      },
    }),
    {
      name: 'paperbook-auth',
    }
  )
)

// Optimized selectors to prevent unnecessary re-renders
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({
      login: state.login,
      logout: state.logout,
      hasPermission: state.hasPermission,
      hasRole: state.hasRole,
    }))
  )
