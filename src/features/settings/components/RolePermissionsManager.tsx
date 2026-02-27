import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Loader2, Save, AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { apiGet, apiPatch } from '@/lib/api-client'
import { toast } from '@/hooks/use-toast'

// ==================== TYPES ====================

interface PermissionItem {
  slug: string
  name: string
  description?: string
  module: string
  action: string
  granted: boolean
}

interface RolePermissionsResponse {
  permissions: PermissionItem[]
}

// ==================== API ====================

function fetchRolePermissions(role: string): Promise<RolePermissionsResponse> {
  return apiGet<RolePermissionsResponse>(`/api/permissions/role/${role}`)
}

function updateRolePermissions(
  role: string,
  permissions: { slug: string; granted: boolean }[]
): Promise<{ success: boolean }> {
  return apiPatch(`/api/permissions/role/${role}`, { permissions })
}

// ==================== CONSTANTS ====================

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access' },
  { value: 'principal', label: 'Principal', description: '' },
  { value: 'teacher', label: 'Teacher', description: '' },
  { value: 'accountant', label: 'Accountant', description: '' },
  { value: 'librarian', label: 'Librarian', description: '' },
  { value: 'transport_manager', label: 'Transport', description: '' },
  { value: 'student', label: 'Student', description: '' },
  { value: 'parent', label: 'Parent', description: '' },
] as const

// ==================== COMPONENT ====================

export function RolePermissionsManager() {
  const [selectedRole, setSelectedRole] = useState<string>('admin')
  const [localChanges, setLocalChanges] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()

  const isAdmin = selectedRole === 'admin'

  // Fetch permissions for selected role
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['role-permissions', selectedRole],
    queryFn: () => fetchRolePermissions(selectedRole),
  })

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (changes: { slug: string; granted: boolean }[]) =>
      updateRolePermissions(selectedRole, changes),
    onSuccess: () => {
      toast({
        title: 'Permissions updated',
        description: `Permissions for ${ROLES.find((r) => r.value === selectedRole)?.label} have been saved.`,
      })
      setLocalChanges({})
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRole] })
    },
    onError: () => {
      toast({
        title: 'Failed to update permissions',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    if (!data?.permissions) return {}
    const groups: Record<string, PermissionItem[]> = {}
    for (const perm of data.permissions) {
      if (!groups[perm.module]) {
        groups[perm.module] = []
      }
      groups[perm.module].push(perm)
    }
    return groups
  }, [data])

  // Get effective grant state (server state + local changes)
  const isGranted = useCallback(
    (slug: string): boolean => {
      if (isAdmin) return true
      if (slug in localChanges) return localChanges[slug]
      const perm = data?.permissions.find((p) => p.slug === slug)
      return perm?.granted ?? false
    },
    [isAdmin, localChanges, data]
  )

  // Check if module has all permissions granted
  const isModuleFullyGranted = useCallback(
    (perms: PermissionItem[]): boolean => {
      return perms.every((p) => isGranted(p.slug))
    },
    [isGranted]
  )

  // Check if module has some permissions granted (indeterminate state)
  const isModulePartiallyGranted = useCallback(
    (perms: PermissionItem[]): boolean => {
      const grantedCount = perms.filter((p) => isGranted(p.slug)).length
      return grantedCount > 0 && grantedCount < perms.length
    },
    [isGranted]
  )

  // Handle individual checkbox toggle
  const handleToggle = useCallback(
    (slug: string, currentGranted: boolean) => {
      if (isAdmin) return
      const serverState = data?.permissions.find((p) => p.slug === slug)?.granted ?? false
      const newValue = !currentGranted

      if (newValue === serverState) {
        // Remove from local changes if it matches server state
        setLocalChanges((prev) => {
          const next = { ...prev }
          delete next[slug]
          return next
        })
      } else {
        setLocalChanges((prev) => ({ ...prev, [slug]: newValue }))
      }
    },
    [isAdmin, data]
  )

  // Handle module-level toggle (select/deselect all permissions in a module)
  const handleModuleToggle = useCallback(
    (perms: PermissionItem[]) => {
      if (isAdmin) return
      const allGranted = isModuleFullyGranted(perms)
      const newValue = !allGranted

      setLocalChanges((prev) => {
        const next = { ...prev }
        for (const perm of perms) {
          const serverState = perm.granted
          if (newValue === serverState) {
            delete next[perm.slug]
          } else {
            next[perm.slug] = newValue
          }
        }
        return next
      })
    },
    [isAdmin, isModuleFullyGranted]
  )

  // Handle role change
  const handleRoleChange = useCallback((role: string) => {
    setSelectedRole(role)
    setLocalChanges({})
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    const changes = Object.entries(localChanges).map(([slug, granted]) => ({
      slug,
      granted,
    }))
    if (changes.length === 0) return
    saveMutation.mutate(changes)
  }, [localChanges, saveMutation])

  const hasChanges = Object.keys(localChanges).length > 0
  const moduleNames = Object.keys(groupedPermissions)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
        </div>
        <p className="text-sm text-gray-500">
          Configure what each role can access. Admin always has full access.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => handleRoleChange(role.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors ${
              selectedRole === role.value
                ? 'border-b-2 border-indigo-500 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {role.label}
            {role.description && (
              <span className="ml-1 text-xs text-gray-400">({role.description})</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-sm text-gray-500">Loading permissions...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">
            Failed to load permissions.{' '}
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
        </div>
      )}

      {/* Admin Notice */}
      {isAdmin && !isLoading && !isError && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg mb-4">
          <Shield className="h-4 w-4 text-indigo-600" />
          <p className="text-sm text-indigo-700">
            Admin has full access to all permissions. These cannot be modified.
          </p>
        </div>
      )}

      {/* Permission Groups */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {moduleNames.map((module) => {
            const perms = groupedPermissions[module]
            const allGranted = isModuleFullyGranted(perms)
            const partiallyGranted = isModulePartiallyGranted(perms)

            return (
              <div
                key={module}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                {/* Module Header with Select All */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                  <Checkbox
                    checked={allGranted ? true : partiallyGranted ? 'indeterminate' : false}
                    onCheckedChange={() => handleModuleToggle(perms)}
                    disabled={isAdmin}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <h3 className="text-sm font-semibold text-gray-900 capitalize">
                    {module}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {perms.filter((p) => isGranted(p.slug)).length}/{perms.length} enabled
                  </span>
                </div>

                {/* Permission Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((perm) => {
                    const granted = isGranted(perm.slug)
                    const isChanged = perm.slug in localChanges

                    return (
                      <label
                        key={perm.slug}
                        className={`flex items-center gap-2 cursor-pointer group ${
                          isAdmin ? 'cursor-default' : ''
                        }`}
                      >
                        <Checkbox
                          checked={granted}
                          onCheckedChange={() => handleToggle(perm.slug, granted)}
                          disabled={isAdmin}
                          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <span
                          className={`text-sm ${
                            isChanged
                              ? 'text-indigo-700 font-medium'
                              : 'text-gray-700'
                          } ${
                            !isAdmin
                              ? 'group-hover:text-gray-900'
                              : ''
                          }`}
                          title={perm.description}
                        >
                          {perm.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Save Button */}
      {!isAdmin && !isLoading && !isError && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {hasChanges ? (
              <span className="text-indigo-600 font-medium">
                {Object.keys(localChanges).length} permission
                {Object.keys(localChanges).length === 1 ? '' : 's'} changed
              </span>
            ) : (
              'No unsaved changes'
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
