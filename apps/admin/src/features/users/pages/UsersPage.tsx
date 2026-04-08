import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  Ban,
  CheckCircle,
  UserCog,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit2,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { DataTable } from '../../../components/shared/DataTable'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { ExportButton } from '../../../components/shared/ExportButton'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  avatar: string | null
  isActive: boolean
  schoolName?: string
  schoolId?: string
  status?: string
  banned?: boolean
  createdAt: string
}

const ROLE_OPTIONS = ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'transport_manager', 'principal'] as const

export function UsersPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [schoolFilter, setSchoolFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [editRoleUser, setEditRoleUser] = useState<{ id: string; name: string; role: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const params: Record<string, string> = {}
  if (schoolFilter) params.schoolId = schoolFilter
  if (roleFilter !== 'all') params.role = roleFilter

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.listUsers(Object.keys(params).length > 0 ? params : undefined),
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => adminApi.banUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const impersonateMutation = useMutation({
    mutationFn: (userId: string) => adminApi.impersonate(userId),
    onSuccess: (data: any) => {
      if (data?.redirectUrl) {
        window.open(data.redirectUrl, '_blank')
      }
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setEditRoleUser(null)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setDeleteUserId(null)
    },
  })

  const users: User[] = usersQuery.data?.data || []

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {row.original.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'schoolName',
      header: 'School',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.schoolName || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.banned ? 'banned' : (row.original.status || 'active')
        return <StatusBadge status={status} />
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? format(new Date(row.original.createdAt), 'MMM d, yyyy')
            : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original
        const isMenuOpen = actionMenuId === user.id
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActionMenuId(isMenuOpen ? null : user.id)
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActionMenuId(null)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg animate-fade-in">
                  <button
                    onClick={() => {
                      setActionMenuId(null)
                      navigate(`/users/${user.id}`)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setActionMenuId(null)
                      setEditRoleUser({ id: user.id, name: user.name, role: user.role })
                      setSelectedRole(user.role)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Edit Role
                  </button>
                  <button
                    onClick={() => {
                      setActionMenuId(null)
                      impersonateMutation.mutate(user.id)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                    Impersonate
                  </button>
                  {user.banned ? (
                    <button
                      onClick={() => {
                        setActionMenuId(null)
                        unbanMutation.mutate(user.id)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-muted"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Unban User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActionMenuId(null)
                        banMutation.mutate(user.id)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Ban User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActionMenuId(null)
                      setDeleteUserId(user.id)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage all users across all schools on the platform
          </p>
        </div>
        <ExportButton endpoint="/users/export" filename="users.csv" />
      </div>

      {/* Content */}
      {usersQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading users...</span>
          </div>
        </div>
      ) : usersQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load users. Please try again.
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="Search by name or email..."
          toolbar={
            <>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="accountant">Accountant</option>
                <option value="librarian">Librarian</option>
              </select>
              <input
                type="text"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                placeholder="Filter by school ID..."
                className="h-9 w-48 rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </>
          }
        />
      )}

      {/* Edit Role Dialog */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setEditRoleUser(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground">Edit Role</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Change role for <span className="font-medium text-foreground">{editRoleUser.name}</span>
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-4 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground capitalize focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditRoleUser(null)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => updateRoleMutation.mutate({ id: editRoleUser.id, role: selectedRole })}
                disabled={updateRoleMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Dialog */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setDeleteUserId(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground">Delete User</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteUserId(null)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(deleteUserId)}
                disabled={deleteUserMutation.isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
