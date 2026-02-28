import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  ScrollText,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Clock,
  User,
  Activity,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'

interface AuditEntry {
  id: string
  action: string
  module: string
  entityType: string
  entityName: string | null
  description: string | null
  userName: string
  createdAt: string
  timestamp?: string
  userId?: string
  userEmail?: string
  details?: string
  ipAddress?: string
  schoolName?: string
}

export function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const params: Record<string, string> = { page: String(page), limit: '20' }
  if (search) params.search = search
  if (actionFilter !== 'all') params.action = actionFilter
  if (moduleFilter !== 'all') params.module = moduleFilter
  if (dateFrom) params.from = dateFrom
  if (dateTo) params.to = dateTo

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit', params],
    queryFn: () => adminApi.getAuditLog(params),
  })

  const entries: AuditEntry[] = auditQuery.data?.data || []
  const totalPages = auditQuery.data?.meta?.totalPages || 1
  const totalCount = auditQuery.data?.meta?.total || entries.length

  const actionBadgeColor = (action: string): string => {
    const lower = action.toLowerCase()
    if (lower.includes('create') || lower.includes('add')) return 'bg-green-50 text-green-700 border-green-200'
    if (lower.includes('update') || lower.includes('edit')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-50 text-red-700 border-red-200'
    if (lower.includes('login') || lower.includes('auth')) return 'bg-purple-50 text-purple-700 border-purple-200'
    if (lower.includes('suspend') || lower.includes('ban')) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Track all administrative actions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by user or action..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="suspend">Suspend</option>
            <option value="activate">Activate</option>
            <option value="ban">Ban</option>
            <option value="impersonate">Impersonate</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Module</label>
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Modules</option>
            <option value="schools">Schools</option>
            <option value="users">Users</option>
            <option value="addons">Addons</option>
            <option value="auth">Auth</option>
            <option value="settings">Settings</option>
            <option value="billing">Billing</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {(search || actionFilter !== 'all' || moduleFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch('')
              setActionFilter('all')
              setModuleFilter('all')
              setDateFrom('')
              setDateTo('')
              setPage(1)
            }}
            className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {auditQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading audit log...</span>
          </div>
        </div>
      ) : auditQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load audit log. Please try again.
        </div>
      ) : entries.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
          <ScrollText className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No audit entries found</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {entry.timestamp
                            ? format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            {entry.userName?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {entry.userName || 'System'}
                            </p>
                            {entry.userEmail && (
                              <p className="text-[11px] text-muted-foreground">{entry.userEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${actionBadgeColor(entry.action)}`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                          {entry.module}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.details || '-'}
                        </p>
                        {entry.schoolName && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            School: {entry.schoolName}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({totalCount} entries)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm text-foreground">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
