import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Users, Trophy, XCircle, Plus, Phone, Mail, MapPin } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'

const PIPELINE_STAGES = [
  { key: 'lead_new', label: 'New', color: '#94a3b8' },
  { key: 'lead_contacted', label: 'Contacted', color: '#3b82f6' },
  { key: 'lead_qualified', label: 'Qualified', color: '#8b5cf6' },
  { key: 'lead_demo', label: 'Demo', color: '#f59e0b' },
  { key: 'lead_proposal', label: 'Proposal', color: '#f97316' },
  { key: 'lead_negotiation', label: 'Negotiation', color: '#ef4444' },
  { key: 'lead_won', label: 'Won', color: '#22c55e' },
]

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website', referral: 'Referral', social_media: 'Social Media',
  cold_call: 'Cold Call', event: 'Event', partner: 'Partner', other: 'Other',
}

export function LeadsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ schoolName: '', contactName: '', contactEmail: '', contactPhone: '', city: '', source: 'website', expectedRevenue: '', notes: '' })
  const [createError, setCreateError] = useState('')

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['admin', 'leads', 'pipeline'],
    queryFn: adminApi.getLeadPipeline,
    enabled: view === 'pipeline',
  })

  const { data: leadsData } = useQuery({
    queryKey: ['admin', 'leads', 'list'],
    queryFn: () => adminApi.listLeads({}),
    enabled: view === 'table',
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] })
      setShowCreateDialog(false)
      setCreateForm({ schoolName: '', contactName: '', contactEmail: '', contactPhone: '', city: '', source: 'website', expectedRevenue: '', notes: '' })
    },
    onError: (err: any) => setCreateError(err.message || 'Failed to create lead'),
  })

  const stats = pipelineData?.stats || {}
  const pipeline = pipelineData?.pipeline || {}
  const leads = leadsData?.data || []

  const formatCurrency = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM — Leads</h1>
          <p className="text-sm text-muted-foreground">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-card p-0.5">
            <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${view === 'pipeline' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Pipeline</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Table</button>
          </div>
          <button onClick={() => setShowCreateDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active Leads" value={stats.activeLeads || 0} icon={Target} />
        <StatCard title="Won" value={stats.wonLeads || 0} icon={Trophy} />
        <StatCard title="Lost" value={stats.lostLeads || 0} icon={XCircle} />
        <StatCard title="Pipeline Value" value={formatCurrency(stats.totalExpectedRevenue || 0)} icon={Users} />
      </div>

      {/* Pipeline View */}
      {view === 'pipeline' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.key} className="min-w-[240px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs text-muted-foreground">({(pipeline[stage.key] || []).length})</span>
              </div>
              <div className="space-y-2">
                {(pipeline[stage.key] || []).map((lead: any) => (
                  <div key={lead.id} className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/crm/${lead.id}`)}>
                    <div className="text-sm font-medium">{lead.schoolName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{lead.contactName}</div>
                    {lead.contactEmail && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Mail className="h-2.5 w-2.5" />{lead.contactEmail}
                      </div>
                    )}
                    {lead.contactPhone && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        <Phone className="h-2.5 w-2.5" />{lead.contactPhone}
                      </div>
                    )}
                    {lead.expectedRevenue && (
                      <div className="text-xs font-medium text-green-600 mt-1">{formatCurrency(lead.expectedRevenue)}</div>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                        {SOURCE_LABELS[lead.source] || lead.source}
                      </span>
                      {lead.city && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />{lead.city}
                        </span>
                      )}
                    </div>
                    {/* Quick stage navigation */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-dashed">
                      {PIPELINE_STAGES.filter((s) => s.key !== stage.key).slice(0, 3).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => statusMutation.mutate({ id: lead.id, status: s.key })}
                          className="text-[10px] px-1.5 py-0.5 rounded border hover:bg-muted transition-colors"
                          title={`Move to ${s.label}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {(pipeline[stage.key] || []).length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No leads
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No leads yet. Add one to start your pipeline.</td></tr>
              ) : leads.map((lead: any) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/crm/${lead.id}`)}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{lead.schoolName}</div>
                    <div className="text-xs text-muted-foreground">{lead.city || ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{lead.contactName}</div>
                    <div className="text-xs text-muted-foreground">{lead.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.contactPhone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={{
                      backgroundColor: `${PIPELINE_STAGES.find((s) => s.key === lead.status)?.color || '#94a3b8'}20`,
                      color: PIPELINE_STAGES.find((s) => s.key === lead.status)?.color || '#94a3b8',
                    }}>
                      {lead.status.replace('lead_', '')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{SOURCE_LABELS[lead.source] || lead.source}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{lead.expectedRevenue ? formatCurrency(lead.expectedRevenue) : '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lead Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add New Lead</h2>
            {createError && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{createError}</div>}
            <div className="space-y-3">
              <input placeholder="School Name *" value={createForm.schoolName} onChange={(e) => setCreateForm({...createForm, schoolName: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Contact Name *" value={createForm.contactName} onChange={(e) => setCreateForm({...createForm, contactName: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                <input placeholder="Email *" type="email" value={createForm.contactEmail} onChange={(e) => setCreateForm({...createForm, contactEmail: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Phone" value={createForm.contactPhone} onChange={(e) => setCreateForm({...createForm, contactPhone: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                <input placeholder="City" value={createForm.city} onChange={(e) => setCreateForm({...createForm, city: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={createForm.source} onChange={(e) => setCreateForm({...createForm, source: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="event">Event</option>
                  <option value="partner">Partner</option>
                </select>
                <input placeholder="Expected Revenue (₹)" type="number" value={createForm.expectedRevenue} onChange={(e) => setCreateForm({...createForm, expectedRevenue: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <textarea placeholder="Notes" value={createForm.notes} onChange={(e) => setCreateForm({...createForm, notes: e.target.value})} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[60px]" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button
                onClick={() => createMutation.mutate({
                  ...createForm,
                  expectedRevenue: createForm.expectedRevenue ? Number(createForm.expectedRevenue) : undefined,
                })}
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
