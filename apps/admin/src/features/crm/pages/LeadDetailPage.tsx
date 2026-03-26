import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Plus, MessageSquare, PhoneCall, Video, FileText, ArrowRightLeft } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

const STAGES = [
  { key: 'lead_new', label: 'New', color: '#94a3b8' },
  { key: 'lead_contacted', label: 'Contacted', color: '#3b82f6' },
  { key: 'lead_qualified', label: 'Qualified', color: '#8b5cf6' },
  { key: 'lead_demo', label: 'Demo', color: '#f59e0b' },
  { key: 'lead_proposal', label: 'Proposal', color: '#f97316' },
  { key: 'lead_negotiation', label: 'Negotiation', color: '#ef4444' },
  { key: 'lead_won', label: 'Won', color: '#22c55e' },
  { key: 'lead_lost', label: 'Lost', color: '#6b7280' },
]

const ACTIVITY_ICONS: Record<string, any> = {
  email: Mail, call: PhoneCall, meeting: Video, note: FileText, status_change: ArrowRightLeft, demo: Video,
}

export function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [activityForm, setActivityForm] = useState({ type: 'note', content: '' })

  const { data: lead, isLoading } = useQuery({
    queryKey: ['admin', 'lead', id],
    queryFn: () => adminApi.getLead(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateLeadStatus(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'lead', id] }),
  })

  const activityMutation = useMutation({
    mutationFn: (data: any) => adminApi.addLeadActivity(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lead', id] })
      setShowAddActivity(false)
      setActivityForm({ type: 'note', content: '' })
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!lead) return <div className="text-center py-12 text-muted-foreground">Lead not found</div>

  const currentStage = STAGES.find((s) => s.key === lead.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/crm')} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.schoolName}</h1>
          <p className="text-sm text-muted-foreground">{lead.contactName}</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${currentStage?.color}20`, color: currentStage?.color }}>
          {currentStage?.label || lead.status}
        </span>
      </div>

      {/* Pipeline Progress */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <button
            key={stage.key}
            onClick={() => statusMutation.mutate(stage.key)}
            disabled={statusMutation.isPending}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-all whitespace-nowrap ${
              lead.status === stage.key
                ? 'border-2 shadow-sm'
                : 'border-transparent hover:bg-muted'
            }`}
            style={lead.status === stage.key ? { borderColor: stage.color, backgroundColor: `${stage.color}10`, color: stage.color } : {}}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            {stage.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Contact Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.contactEmail}`} className="text-primary hover:underline">{lead.contactEmail}</a>
            </div>
            {lead.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.contactPhone}</span>
              </div>
            )}
            {(lead.city || lead.state) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{[lead.city, lead.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {lead.nextFollowUp && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deal Info */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Deal Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="capitalize">{lead.source?.replace('_', ' ')}</span></div>
            {lead.expectedRevenue && <div className="flex justify-between"><span className="text-muted-foreground">Expected Revenue</span><span className="font-medium text-green-600">₹{lead.expectedRevenue.toLocaleString('en-IN')}</span></div>}
            {lead.expectedPlan && <div className="flex justify-between"><span className="text-muted-foreground">Expected Plan</span><span className="capitalize">{lead.expectedPlan}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(lead.createdAt).toLocaleDateString()}</span></div>
          </div>
          {lead.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{lead.notes}</p>}
          {lead.lostReason && <p className="text-sm text-red-600 mt-3 pt-3 border-t">Lost: {lead.lostReason}</p>}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => { setActivityForm({ type: 'call', content: '' }); setShowAddActivity(true) }} className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <PhoneCall className="h-4 w-4 text-blue-500" /> Log Call
            </button>
            <button onClick={() => { setActivityForm({ type: 'email', content: '' }); setShowAddActivity(true) }} className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <Mail className="h-4 w-4 text-green-500" /> Log Email
            </button>
            <button onClick={() => { setActivityForm({ type: 'meeting', content: '' }); setShowAddActivity(true) }} className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <Video className="h-4 w-4 text-purple-500" /> Log Meeting
            </button>
            <button onClick={() => { setActivityForm({ type: 'note', content: '' }); setShowAddActivity(true) }} className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <FileText className="h-4 w-4 text-gray-500" /> Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Activity Timeline ({lead.activities?.length || 0})</h3>
          <button onClick={() => setShowAddActivity(true)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3 w-3" /> Add Activity
          </button>
        </div>
        {!lead.activities?.length ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">No activities yet. Log your first interaction.</div>
        ) : (
          <div className="divide-y">
            {lead.activities.map((a: any) => {
              const Icon = ACTIVITY_ICONS[a.type] || MessageSquare
              return (
                <div key={a.id} className="px-6 py-4 flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium capitalize px-1.5 py-0.5 rounded bg-muted">{a.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">{a.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Activity Dialog */}
      {showAddActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddActivity(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Log Activity</h2>
            <div className="space-y-3">
              <select value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="note">Note</option><option value="call">Phone Call</option>
                <option value="email">Email</option><option value="meeting">Meeting</option>
                <option value="demo">Demo</option>
              </select>
              <textarea placeholder="What happened?" value={activityForm.content} onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAddActivity(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => activityMutation.mutate(activityForm)} disabled={activityMutation.isPending || !activityForm.content} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50">
                {activityMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
