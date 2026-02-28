import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { User, Role } from '@/types/common.types'
import { usePermissionStore } from './usePermissionStore'

const rolePermissions: Record<Role, string[]> = {
  admin: ['*'],
  principal: ['dashboard', 'students', 'staff', 'attendance', 'admissions', 'library', 'transport', 'finance', 'settings'],
  teacher: ['dashboard', 'students.view', 'attendance', 'library.view'],
  accountant: ['dashboard', 'finance', 'students.view'],
  librarian: ['dashboard', 'library', 'students.view'],
  transport_manager: ['dashboard', 'transport', 'students.view'],
  student: ['dashboard.student', 'library.view', 'attendance.view'],
  parent: ['dashboard.parent', 'attendance.view', 'finance.view', 'transport.view'],
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
