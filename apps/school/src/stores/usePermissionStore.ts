import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PermissionState {
  permissions: string[] // granted permission slugs for current user
  loaded: boolean
  setPermissions: (perms: string[]) => void
  hasPermission: (slug: string) => boolean
  hasAnyPermission: (...slugs: string[]) => boolean
  hasAllPermissions: (...slugs: string[]) => boolean
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: [],
      loaded: false,
      setPermissions: (permissions) => set({ permissions, loaded: true }),
      hasPermission: (slug) => get().permissions.includes(slug),
      hasAnyPermission: (...slugs) => slugs.some((s) => get().permissions.includes(s)),
      hasAllPermissions: (...slugs) => slugs.every((s) => get().permissions.includes(s)),
    }),
    { name: 'paperbook-permissions', partialize: (s) => ({ permissions: s.permissions }) }
  )
)
