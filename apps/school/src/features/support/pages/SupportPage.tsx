import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LifeBuoy, Plus, X, Loader2, Ticket, Clock, CheckCircle2, MessageSquare } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api-client'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  waiting:     'bg-purple-100 text-purple-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-600',
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

function fmtLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function SupportPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ subject: '', description: '', category: '', priority: 'medium' })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['school', 'support-tickets'],
    queryFn: () => apiGet<{ data: any[]; stats: any }>('/support-tickets'),
  })

  const createMut = useMutation({
    mutationFn: (payload: any) => apiPost('/support-tickets', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school', 'support-tickets'] })
      setShowDialog(false)
      setForm({ subject: '', description: '', category: '', priority: 'medium' })
      setFormError('')
    },
    onError: (err: any) => setFormError(err.message || 'Failed to create ticket'),
  })

  const tickets: any[] = data?.data || []
  const stats = data?.stats || {}

  const handleCreate = () => {
    if (!form.subject.trim() || !form.description.trim()) {
      setFormError('Subject and description are required')
      return
    }
    setFormError('')
    createMut.mutate(form)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LifeBuoy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Support</h1>
            <p className="text-sm text-muted-foreground">Contact PaperBook support team</p>
          </div>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Open', value: stats.open ?? 0, icon: Ticket, color: 'text-blue-600' },
          { label: 'In Progress', value: stats.inProgress ?? 0, icon: Loader2, color: 'text-yellow-600' },
          { label: 'Waiting', value: stats.waiting ?? 0, icon: Clock, color: 'text-purple-600' },
          { label: 'Resolved', value: stats.resolved ?? 0, icon: CheckCircle2, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">My Tickets</h3>
        </div>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : tickets.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No tickets yet</p>
            <button onClick={() => setShowDialog(true)} className="text-sm text-primary hover:underline">
              Create your first ticket
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/support/${t.id}`)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{t.subject}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground capitalize">{t.category || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium}`}>
                      {fmtLabel(t.priority)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                      {fmtLabel(t.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Support Ticket</h2>
              <button onClick={() => setShowDialog(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{formError}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject *</label>
                <input
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="">Select…</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
