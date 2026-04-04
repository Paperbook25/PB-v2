import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../../lib/api'
import { format } from 'date-fns'
import { ArrowLeft, Loader2, Shield, Monitor, Clock } from 'lucide-react'
import { StatusBadge } from '../../../components/shared/StatusBadge'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const userQuery = useQuery<any>({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: !!id,
  })

  if (userQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="space-y-4 p-6">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          User not found or failed to load.
        </div>
      </div>
    )
  }

  const user = userQuery.data

  const initials = (user.name || user.email || '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6 p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* Profile Card */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
              {initials}
            </div>
          )}

          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                <Shield className="h-3 w-3" />
                {user.role}
              </span>
              <StatusBadge status={user.isActive ? 'active' : 'banned'} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {user.isActive ? (
              <button
                onClick={() => {
                  if (confirm('Ban this user?')) {
                    adminApi.banUser(user.id).then(() => userQuery.refetch())
                  }
                }}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Ban User
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm('Unban this user?')) {
                    adminApi.unbanUser(user.id).then(() => userQuery.refetch())
                  }
                }}
                className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
              >
                Unban User
              </button>
            )}

            <button
              onClick={() => {
                const newRole = prompt('Enter new role (e.g. admin, user, superadmin):', user.role)
                if (newRole && newRole !== user.role) {
                  adminApi.updateUserRole?.(user.id, newRole).then(() => userQuery.refetch()).catch(() => alert('Failed to update role'))
                }
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Role
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                  adminApi.deleteUser?.(user.id).then(() => navigate('/users')).catch(() => alert('Failed to delete user'))
                }
              }}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Staff info */}
        {user.staff && (
          <div className="mt-4 rounded-md border bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Staff Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 sm:grid-cols-4">
              <div>
                <span className="text-gray-400">Name:</span>{' '}
                {user.staff.firstName} {user.staff.lastName}
              </div>
              <div>
                <span className="text-gray-400">Designation:</span>{' '}
                {user.staff.designation || '-'}
              </div>
              <div>
                <span className="text-gray-400">Department:</span>{' '}
                {user.staff.department || '-'}
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{' '}
                {user.staff.status || '-'}
              </div>
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex gap-6 text-xs text-gray-400">
          <span>Created: {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
          <span>Updated: {format(new Date(user.updatedAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Monitor className="h-4 w-4" />
            Sessions
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{user.counts?.sessions ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Audit Logs
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{user.counts?.auditLogs ?? 0}</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
        </div>

        {(!user.recentSessions || user.recentSessions.length === 0) ? (
          <div className="p-6 text-center text-sm text-gray-400">No recent sessions.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">User Agent</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {user.recentSessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs">{session.ipAddress || '-'}</td>
                    <td className="max-w-xs truncate px-6 py-3 text-xs text-gray-500" title={session.userAgent}>
                      {session.userAgent || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">
                      {session.createdAt ? format(new Date(session.createdAt), 'MMM d, yyyy HH:mm') : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">
                      {session.expiresAt ? format(new Date(session.expiresAt), 'MMM d, yyyy HH:mm') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
