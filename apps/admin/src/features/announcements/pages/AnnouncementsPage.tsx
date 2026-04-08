import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Send, Trash2, Edit2, Clock, Check } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

const STATUS_MAP: Record<string, string> = {
  ann_draft: 'draft',
  ann_scheduled: 'scheduled',
  ann_sent: 'sent',
}

const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-App',
  email: 'Email',
  both: 'In-App + Email',
}

export function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingAnn, setEditingAnn] = useState<any>(null)
  const [form, setForm] = useState({ title: '', body: '', channel: 'in_app', targetPlans: [] as string[], targetStatuses: [] as string[], scheduledAt: '' })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => adminApi.listAnnouncements({}),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      setShowCreate(false)
      setForm({ title: '', body: '', channel: 'in_app', targetPlans: [], targetStatuses: [], scheduledAt: '' })
    },
    onError: (err: any) => setError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateAnnouncement(editingAnn.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      setShowCreate(false)
      setEditingAnn(null)
      setForm({ title: '', body: '', channel: 'in_app', targetPlans: [], targetStatuses: [], scheduledAt: '' })
    },
    onError: (err: any) => setError(err.message),
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => adminApi.sendAnnouncement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] }),
  })

  const announcements = data?.data || []

  // Build params for recipient preview — only include filters that are set
  const recipientParams: Record<string, string> = { limit: '1' }
  if (form.targetPlans.length === 1) recipientParams.plan = form.targetPlans[0]
  if (form.targetStatuses.length === 1) recipientParams.status = form.targetStatuses[0]

  const recipientQ = useQuery({
    queryKey: ['admin', 'schools', 'recipient-preview', form.targetPlans, form.targetStatuses],
    queryFn: () => adminApi.listSchools(recipientParams),
    enabled: showCreate,
  })

  const recipientCount = recipientQ.data?.meta?.total ?? null

  const togglePlan = (plan: string) => {
    setForm((f) => ({
      ...f,
      targetPlans: f.targetPlans.includes(plan) ? f.targetPlans.filter((p) => p !== plan) : [...f.targetPlans, plan],
    }))
  }

  const toggleStatus = (status: string) => {
    setForm((f) => ({
      ...f,
      targetStatuses: f.targetStatuses.includes(status) ? f.targetStatuses.filter((s) => s !== status) : [...f.targetStatuses, status],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Broadcast messages to schools across the platform</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No announcements yet. Create one to broadcast to your schools.</p>
          </div>
        ) : (
          announcements.map((ann: any) => (
            <div key={ann.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{ann.title}</h3>
                    <StatusBadge status={STATUS_MAP[ann.status] || ann.status} />
                    <span className="text-xs text-muted-foreground">{CHANNEL_LABELS[ann.channel] || ann.channel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Created {new Date(ann.createdAt).toLocaleDateString()}</span>
                    {ann.sentAt && <span>Sent {new Date(ann.sentAt).toLocaleDateString()}</span>}
                    {ann.scheduledAt && ann.status === 'ann_scheduled' && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Scheduled {new Date(ann.scheduledAt).toLocaleString()}</span>
                    )}
                    {ann.targetPlans.length > 0 && (
                      <span>Plans: {ann.targetPlans.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {ann.status !== 'ann_sent' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAnn(ann)
                          setForm({
                            title: ann.title,
                            body: ann.body,
                            channel: ann.channel,
                            targetPlans: ann.targetPlans || [],
                            targetStatuses: ann.targetStatuses || [],
                            scheduledAt: ann.scheduledAt ? new Date(ann.scheduledAt).toISOString().slice(0, 16) : '',
                          })
                          setShowCreate(true)
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => sendMutation.mutate(ann.id)}
                        disabled={sendMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100"
                        title="Send now"
                      >
                        <Send className="h-3 w-3" /> Send
                      </button>
                    </>
                  )}
                  {ann.status === 'ann_sent' && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" /> Sent</span>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(ann.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditingAnn(null) }}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editingAnn ? 'Edit Announcement' : 'New Announcement'}</h2>
            {error && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{error}</div>}
            <div className="space-y-3">
              <input
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              />
              <textarea
                placeholder="Message body *"
                value={form.body}
                onChange={(e) => setForm({...form, body: e.target.value})}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
              />

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Channel</label>
                <select value={form.channel} onChange={(e) => setForm({...form, channel: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="in_app">In-App Only</option>
                  <option value="email">Email Only</option>
                  <option value="both">In-App + Email</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Plans (leave empty for all)</label>
                <div className="flex gap-2">
                  {['free', 'starter', 'professional', 'enterprise'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => togglePlan(plan)}
                      className={`px-2.5 py-1 text-xs rounded-md border capitalize ${
                        form.targetPlans.includes(plan) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Statuses (leave empty for all)</label>
                <div className="flex gap-2">
                  {['active', 'trial', 'suspended'].map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-2.5 py-1 text-xs rounded-md border capitalize ${
                        form.targetStatuses.includes(status) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Preview */}
              <div className={`rounded-md px-3 py-2 text-xs font-medium ${
                recipientCount === null ? 'bg-muted text-muted-foreground' :
                recipientCount === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}>
                {recipientCount === null
                  ? 'Calculating recipients...'
                  : recipientCount === 0
                    ? 'Warning: No schools match these filters — announcement will not be sent to anyone'
                    : `This will be sent to ${recipientCount} school${recipientCount !== 1 ? 's' : ''}`}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({...form, scheduledAt: e.target.value})}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowCreate(false); setEditingAnn(null) }} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => {
                  setError('')
                  const payload = {
                    ...form,
                    scheduledAt: form.scheduledAt || undefined,
                    targetPlans: form.targetPlans.length > 0 ? form.targetPlans : undefined,
                    targetStatuses: form.targetStatuses.length > 0 ? form.targetStatuses : undefined,
                  }
                  if (editingAnn) {
                    updateMutation.mutate(payload)
                  } else {
                    createMutation.mutate(payload)
                  }
                }}
                disabled={editingAnn ? updateMutation.isPending : createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {editingAnn
                  ? (updateMutation.isPending ? 'Updating...' : 'Update')
                  : (createMutation.isPending ? 'Creating...' : form.scheduledAt ? 'Schedule' : 'Create Draft')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
