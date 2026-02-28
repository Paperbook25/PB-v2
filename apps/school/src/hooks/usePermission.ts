import { usePermissionStore } from '@/stores/usePermissionStore'

export function usePermission(slug: string): boolean {
  return usePermissionStore((state) => state.permissions.includes(slug))
}

export function useAnyPermission(...slugs: string[]): boolean {
  return usePermissionStore((state) => slugs.some((s) => state.permissions.includes(s)))
}

export function useModulePermissions(module: string) {
  const permissions = usePermissionStore((state) => state.permissions)
  return {
    canView: permissions.includes(`${module}.view`),
    canCreate: permissions.includes(`${module}.create`),
    canEdit: permissions.includes(`${module}.edit`),
    canDelete: permissions.includes(`${module}.delete`),
    canExport: permissions.includes(`${module}.export`),
    canApprove: permissions.includes(`${module}.approve`),
  }
}
