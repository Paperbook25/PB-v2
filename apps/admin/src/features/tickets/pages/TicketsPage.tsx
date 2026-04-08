import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ticket, Clock, Loader2, CheckCircle2, Plus, Search, CheckCheck } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  waiting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  closed: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600 dark:text-gray-400' },
}

export function TicketsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({
    schoolId: '',
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  })
  const [createError, setCreateError] = useState('')

  const filterParams: Record<string, string> = {}
  if (statusFilter) filterParams.status = statusFilter
  if (priorityFilter) filterParams.priority = priorityFilter
  if (categoryFilter) filterParams.category = categoryFilter

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'tickets', 'stats'],
    queryFn: adminApi.getTicketStats,
  })

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin', 'tickets', 'list', filterParams],
    queryFn: () => adminApi.listTickets(filterParams),
  })

  const { data: schoolsData } = useQuery({
    queryKey: ['admin', 'schools', 'all'],
    queryFn: () => adminApi.listSchools({ limit: '500' }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      setShowCreateDialog(false)
      setCreateForm({ schoolId: '', subject: '', description: '', category: '', priority: 'medium' })
      setCreateError('')
    },
    onError: (err: any) => setCreateError(err.message || 'Failed to create ticket'),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => adminApi.updateTicket(id, { status: 'resolved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] }),
  })

  const tickets = ticketsData?.data || []
  const schools: any[] = schoolsData?.data || []

  const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and resolve support requests from schools</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Open" value={statsLoading ? '...' : (stats?.data?.open ?? stats?.open ?? 0)} icon={Ticket} />
        <StatCard title="In Progress" value={statsLoading ? '...' : (stats?.data?.inProgress ?? stats?.inProgress ?? 0)} icon={Loader2} />
        <StatCard title="Waiting" value={statsLoading ? '...' : (stats?.data?.waiting ?? stats?.waiting ?? 0)} icon={Clock} />
        <StatCard title="Resolved" value={statsLoading ? '...' : (stats?.data?.resolved ?? stats?.resolved ?? 0)} icon={CheckCircle2} />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border bg-background pl-8 pr-3 text-sm w-48"
          />
        </div>
        {(statusFilter || priorityFilter || categoryFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCategoryFilter('') }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card">
        {ticketsLoading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">Loading tickets...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No tickets found. Adjust your filters or create a new ticket.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => {
                  const pColor = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium
                  const sColor = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
                  const canResolve = ticket.status !== 'resolved' && ticket.status !== 'closed'
                  return (
                    <tr
                      key={ticket.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{ticket.subject}</div>
                        {ticket.category && (
                          <div className="text-xs text-muted-foreground">{ticket.category}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{ticket.schoolName || ticket.schoolId || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pColor.bg} ${pColor.text}`}>
                          {formatLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sColor.bg} ${sColor.text}`}>
                          {formatLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.assignee || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {canResolve && (
                          <button
                            onClick={() => resolveMutation.mutate(ticket.id)}
                            disabled={resolveMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                            title="Mark as resolved"
                          >
                            <CheckCheck className="h-3 w-3" />
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Ticket Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create New Ticket</h2>
            {createError && <div className="p-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md mb-3">{createError}</div>}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">School *</label>
                <select
                  value={createForm.schoolId}
                  onChange={(e) => setCreateForm({ ...createForm, schoolId: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Select a school...</option>
                  {schools.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Subject *"
                value={createForm.subject}
                onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              />
              <textarea
                placeholder="Description *"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Category</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.schoolId || !createForm.subject || !createForm.description}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
