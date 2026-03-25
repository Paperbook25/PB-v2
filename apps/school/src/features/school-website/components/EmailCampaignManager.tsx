import { useState, useCallback } from 'react'
import {
  Mail, Plus, Play, Pause, Trash2, Edit3, ChevronLeft,
  Send, BarChart3, Loader2, Clock, AlertCircle, CheckCircle2,
  Users, Zap, FileText, Calendar, CreditCard,
} from 'lucide-react'
import {
  useCampaigns,
  useCampaign,
  useCampaignStats,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useActivateCampaign,
  usePauseCampaign,
  useExecuteCampaign,
  useAddStep,
  useUpdateStep,
  useDeleteStep,
  type EmailCampaign,
  type EmailCampaignStep,
} from '../api/email-campaign.api'

// ==================== Constants ====================

const TRIGGERS = [
  { value: 'manual', label: 'Manual', icon: Send },
  { value: 'admission_inquiry', label: 'Admission Inquiry', icon: FileText },
  { value: 'contact_form', label: 'Contact Form', icon: Mail },
  { value: 'fee_overdue', label: 'Fee Overdue', icon: CreditCard },
  { value: 'event_registration', label: 'Event Registration', icon: Calendar },
] as const

const AUDIENCES = [
  { value: 'all', label: 'All' },
  { value: 'parents', label: 'Parents' },
  { value: 'students', label: 'Students' },
  { value: 'staff', label: 'Staff' },
  { value: 'leads', label: 'Leads' },
] as const

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
}

const TRIGGER_COLORS: Record<string, string> = {
  manual: 'bg-gray-100 text-gray-600',
  admission_inquiry: 'bg-purple-100 text-purple-700',
  contact_form: 'bg-blue-100 text-blue-700',
  fee_overdue: 'bg-red-100 text-red-700',
  event_registration: 'bg-green-100 text-green-700',
}

// ==================== Main Component ====================

export function EmailCampaignManager() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  if (selectedCampaignId) {
    return (
      <CampaignDetail
        campaignId={selectedCampaignId}
        onBack={() => setSelectedCampaignId(null)}
      />
    )
  }

  if (showCreateForm) {
    return (
      <CampaignForm
        onBack={() => setShowCreateForm(false)}
        onCreated={(id) => {
          setShowCreateForm(false)
          setSelectedCampaignId(id)
        }}
      />
    )
  }

  return (
    <CampaignList
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onSelect={setSelectedCampaignId}
      onCreate={() => setShowCreateForm(true)}
    />
  )
}

// ==================== Campaign List ====================

function CampaignList({
  statusFilter,
  onStatusFilterChange,
  onSelect,
  onCreate,
}: {
  statusFilter: string
  onStatusFilterChange: (s: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  const { data, isLoading } = useCampaigns({ status: statusFilter || undefined })
  const deleteCampaign = useDeleteCampaign()
  const activateCampaign = useActivateCampaign()
  const pauseCampaign = usePauseCampaign()

  const campaigns = data?.data ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Email Campaigns</h2>
          <p className="text-sm text-gray-500">Create and manage automated email drip campaigns</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'draft', 'active', 'paused', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No campaigns yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first email campaign to get started</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(c.id)}
                      className="text-left"
                    >
                      <div className="font-medium text-gray-900 hover:text-blue-600 transition">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</div>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TRIGGER_COLORS[c.trigger] ?? 'bg-gray-100 text-gray-600'}`}>
                      {TRIGGERS.find((t) => t.value === c.trigger)?.label ?? c.trigger}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{c.stepsCount ?? 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{c.stats?.sent ?? 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{c.stats?.opened ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.status === 'draft' || c.status === 'paused' ? (
                        <button
                          onClick={() => activateCampaign.mutate(c.id)}
                          title="Activate"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : c.status === 'active' ? (
                        <button
                          onClick={() => pauseCampaign.mutate(c.id)}
                          title="Pause"
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => onSelect(c.id)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this campaign? This cannot be undone.')) {
                            deleteCampaign.mutate(c.id)
                          }
                        }}
                        title="Delete"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ==================== Campaign Create Form ====================

function CampaignForm({
  onBack,
  onCreated,
}: {
  onBack: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState('manual')
  const [targetAudience, setTargetAudience] = useState('all')

  const createCampaign = useCreateCampaign()

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return
    try {
      const result = await createCampaign.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        trigger,
        targetAudience,
      })
      onCreated((result as EmailCampaign).id)
    } catch {
      // Error handled by mutation
    }
  }, [name, description, trigger, targetAudience, createCampaign, onCreated])

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition">
        <ChevronLeft className="h-4 w-4" />
        Back to Campaigns
      </button>

      <div className="bg-white border rounded-lg p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Create New Campaign</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Series for New Inquiries"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this campaign..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || createCampaign.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
          >
            {createCampaign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Campaign Detail ====================

function CampaignDetail({
  campaignId,
  onBack,
}: {
  campaignId: string
  onBack: () => void
}) {
  const { data: campaign, isLoading } = useCampaign(campaignId)
  const { data: stats } = useCampaignStats(campaignId)
  const updateCampaign = useUpdateCampaign()
  const activateCampaign = useActivateCampaign()
  const pauseCampaign = usePauseCampaign()
  const executeCampaign = useExecuteCampaign()
  const addStep = useAddStep()
  const updateStep = useUpdateStep()
  const deleteStep = useDeleteStep()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [showAddStep, setShowAddStep] = useState(false)
  const [newStepSubject, setNewStepSubject] = useState('')
  const [newStepBody, setNewStepBody] = useState('')
  const [newStepDelay, setNewStepDelay] = useState(0)

  const handleSaveName = useCallback(() => {
    if (!nameValue.trim() || !campaign) return
    updateCampaign.mutate({ id: campaign.id, name: nameValue.trim() })
    setEditingName(false)
  }, [nameValue, campaign, updateCampaign])

  const handleAddStep = useCallback(() => {
    if (!newStepSubject.trim() || !newStepBody.trim()) return
    addStep.mutate({
      campaignId,
      subject: newStepSubject.trim(),
      body: newStepBody.trim(),
      delayDays: newStepDelay,
    })
    setNewStepSubject('')
    setNewStepBody('')
    setNewStepDelay(0)
    setShowAddStep(false)
  }, [campaignId, newStepSubject, newStepBody, newStepDelay, addStep])

  if (isLoading || !campaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const totalStats = stats?.total ?? 0

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition">
        <ChevronLeft className="h-4 w-4" />
        Back to Campaigns
      </button>

      {/* Header */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-sm text-blue-600 hover:underline">Save</button>
                <button onClick={() => setEditingName(false)} className="text-sm text-gray-500 hover:underline">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{campaign.name}</h2>
                <button
                  onClick={() => { setNameValue(campaign.name); setEditingName(true) }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {campaign.description && (
              <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[campaign.status]}`}>
                {campaign.status}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TRIGGER_COLORS[campaign.trigger]}`}>
                <Zap className="h-3 w-3" />
                {TRIGGERS.find((t) => t.value === campaign.trigger)?.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <Users className="h-3 w-3" />
                {AUDIENCES.find((a) => a.value === campaign.targetAudience)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === 'active' && campaign.trigger === 'manual' && (
              <button
                onClick={() => executeCampaign.mutate(campaign.id)}
                disabled={executeCampaign.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50"
              >
                {executeCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Now
              </button>
            )}
            {(campaign.status === 'draft' || campaign.status === 'paused') && (
              <button
                onClick={() => activateCampaign.mutate(campaign.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                <Play className="h-4 w-4" />
                Activate
              </button>
            )}
            {campaign.status === 'active' && (
              <button
                onClick={() => pauseCampaign.mutate(campaign.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {totalStats > 0 && (
        <div className="bg-white border rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Campaign Statistics
          </h3>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <StatCard label="Total" value={stats?.total ?? 0} icon={Mail} color="text-gray-600" />
            <StatCard label="Sent" value={stats?.sent ?? 0} icon={CheckCircle2} color="text-green-600" />
            <StatCard label="Opened" value={stats?.opened ?? 0} icon={Mail} color="text-blue-600" />
            <StatCard label="Failed" value={stats?.failed ?? 0} icon={AlertCircle} color="text-red-600" />
            <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} color="text-yellow-600" />
          </div>
          {totalStats > 0 && (
            <div className="space-y-2">
              <ProgressBar label="Sent" value={stats?.sent ?? 0} total={totalStats} color="bg-green-500" />
              <ProgressBar label="Opened" value={stats?.opened ?? 0} total={totalStats} color="bg-blue-500" />
              <ProgressBar label="Failed" value={stats?.failed ?? 0} total={totalStats} color="bg-red-500" />
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Email Steps ({campaign.steps?.length ?? 0})</h3>
          <button
            onClick={() => setShowAddStep(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </button>
        </div>

        {/* Steps timeline */}
        <div className="space-y-0">
          {campaign.steps?.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isLast={index === (campaign.steps?.length ?? 0) - 1}
              onUpdate={(data) => updateStep.mutate({ stepId: step.id, ...data })}
              onDelete={() => {
                if (confirm('Remove this step?')) {
                  deleteStep.mutate(step.id)
                }
              }}
            />
          ))}
        </div>

        {campaign.steps?.length === 0 && !showAddStep && (
          <div className="text-center py-8 text-gray-400">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No steps yet. Add your first email step to build the drip sequence.</p>
          </div>
        )}

        {/* Add step form */}
        {showAddStep && (
          <div className="mt-4 border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50/50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">New Email Step</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={newStepSubject}
                    onChange={(e) => setNewStepSubject(e.target.value)}
                    placeholder="e.g., Welcome to our school!"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Delay (days)</label>
                  <input
                    type="number"
                    min={0}
                    value={newStepDelay}
                    onChange={(e) => setNewStepDelay(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email Body <span className="text-gray-400">(HTML supported, use {'{{name}}'} for personalization)</span>
                </label>
                <textarea
                  value={newStepBody}
                  onChange={(e) => setNewStepBody(e.target.value)}
                  placeholder="<p>Hi {{name}},</p><p>Thank you for your interest in our school...</p>"
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowAddStep(false); setNewStepSubject(''); setNewStepBody(''); setNewStepDelay(0) }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStep}
                  disabled={!newStepSubject.trim() || !newStepBody.trim() || addStep.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {addStep.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add Step
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Step Card ====================

function StepCard({
  step,
  index,
  isLast,
  onUpdate,
  onDelete,
}: {
  step: EmailCampaignStep
  index: number
  isLast: boolean
  onUpdate: (data: { subject?: string; body?: string; delayDays?: number }) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [subject, setSubject] = useState(step.subject)
  const [body, setBody] = useState(step.body)
  const [delayDays, setDelayDays] = useState(step.delayDays)

  const handleSave = () => {
    onUpdate({ subject, body, delayDays })
    setIsEditing(false)
  }

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 border rounded-lg p-4 ${isEditing ? 'border-blue-300 bg-blue-50/30' : 'bg-white'} ${!isLast ? 'mb-3' : ''}`}>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-500 mb-1">Delay (days)</label>
                <input
                  type="number"
                  min={0}
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-1.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:underline">Cancel</button>
              <button onClick={handleSave} className="text-sm text-blue-600 font-medium hover:underline">Save</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 uppercase">
                    {step.delayDays === 0 ? 'Immediately' : `Day ${step.delayDays}`}
                  </span>
                </div>
                <div className="font-medium text-gray-900 mt-1">{step.subject}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {step.body.replace(/<[^>]*>/g, '').slice(0, 120)}
                  {step.body.length > 120 ? '...' : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Helpers ====================

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14 text-right">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-10">{pct}%</span>
    </div>
  )
}
