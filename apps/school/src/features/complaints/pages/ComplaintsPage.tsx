import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquareDashed, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { AddonGate } from '@/components/AddonGate'
import { fetchComplaints, fetchComplaintStats, createComplaint } from '../api/complaints.api'
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_CATEGORY_LABELS,
} from '../types/complaints.types'
import type { Complaint } from '../types/complaints.types'

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending_info: 'bg-orange-100 text-orange-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  reopened: 'bg-pink-100 text-pink-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

export function ComplaintsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    complainantType: 'parent' as const,
  })

  const statsQ = useQuery({ queryKey: ['complaints', 'stats'], queryFn: fetchComplaintStats })
  const complaintsQ = useQuery({
    queryKey: ['complaints', 'list', search, statusFilter],
    queryFn: () => fetchComplaints({
      search: search || undefined,
      status: (statusFilter !== 'all' ? statusFilter : undefined) as any,
    }),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => createComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      setShowDialog(false)
      setForm({ subject: '', description: '', category: 'general', priority: 'medium', complainantType: 'parent' })
    },
  })

  const stats = statsQ.data?.data
  const complaints: Complaint[] = complaintsQ.data?.data || []

  return (
    <AddonGate slug="complaints">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Complaints & Grievances</h1>
            <p className="text-sm text-muted-foreground">Track and resolve complaints from parents, students, and staff</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Complaint
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Open', value: stats.openTickets },
              { label: 'Resolved This Month', value: stats.resolvedThisMonth },
              { label: 'SLA Compliance', value: `${Math.round(stats.slaComplianceRate ?? 0)}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters + Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              {Object.entries(COMPLAINT_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {complaintsQ.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : complaintsQ.isError ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> Failed to load complaints
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquareDashed className="h-10 w-10 opacity-30" />
              <p className="text-sm">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ticket #</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reported By</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.ticketNumber}</td>
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.subject}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {COMPLAINT_CATEGORY_LABELS[c.category] || c.category}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[c.priority] || ''}`}>
                          {COMPLAINT_PRIORITY_LABELS[c.priority] || c.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-muted text-muted-foreground'}`}>
                          {COMPLAINT_STATUS_LABELS[c.status] || c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{c.complainantType}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">File New Complaint</h2>
            <div className="space-y-3">
              <input
                placeholder="Subject *"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              />
              <textarea
                placeholder="Description *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  {Object.entries(COMPLAINT_CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  {Object.entries(COMPLAINT_PRIORITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <select value={form.complainantType} onChange={(e) => setForm({ ...form, complainantType: e.target.value as any })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="parent">Parent</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="anonymous">Anonymous</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => { if (!form.subject.trim() || !form.description.trim()) return; createMut.mutate(form) }}
                disabled={!form.subject.trim() || !form.description.trim() || createMut.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {createMut.isPending ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AddonGate>
  )
}
