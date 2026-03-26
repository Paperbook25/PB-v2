import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  ArrowLeft,
  School,
  Users,
  Puzzle,
  Activity,
  Loader2,
  AlertCircle,
  Ban,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Edit3,
  Save,
  X,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { StatusBadge } from '../../../components/shared/StatusBadge'

type TabId = 'overview' | 'users' | 'addons' | 'activity'

export function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  const schoolQuery = useQuery({
    queryKey: ['admin', 'school', id],
    queryFn: () => adminApi.getSchool(id!),
    enabled: !!id,
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'school', id, 'users'],
    queryFn: () => adminApi.getSchoolUsers(id!),
    enabled: !!id && activeTab === 'users',
  })

  const addonsQuery = useQuery({
    queryKey: ['admin', 'school', id, 'addons'],
    queryFn: () => adminApi.getSchoolAddons(id!),
    enabled: !!id && activeTab === 'addons',
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSchool(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'school', id] })
      setIsEditing(false)
    },
  })

  const suspendMutation = useMutation({
    mutationFn: () => adminApi.suspendSchool(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'school', id] }),
  })

  const activateMutation = useMutation({
    mutationFn: () => adminApi.activateSchool(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'school', id] }),
  })

  const toggleAddonMutation = useMutation({
    mutationFn: (slug: string) => adminApi.toggleSchoolAddon(id!, slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'school', id, 'addons'] }),
  })

  const school = schoolQuery.data
  const users = usersQuery.data || []
  const addons = addonsQuery.data || []

  const tabs: { id: TabId; label: string; icon: typeof School }[] = [
    { id: 'overview', label: 'Overview', icon: School },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'addons', label: 'Addons', icon: Puzzle },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  if (schoolQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (schoolQuery.isError || !school) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/schools')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load school details.
        </div>
      </div>
    )
  }

  const startEditing = () => {
    setEditForm({
      name: school.name || '',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      phone: school.phone || '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(editForm)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/schools')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Schools
      </button>

      {/* School Header */}
      <div className="flex items-start justify-between rounded-lg border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <School className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{school.name}</h1>
              <StatusBadge status={school.status || 'active'} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">/{school.slug}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {school.planTier && (
                <span className="rounded-md bg-muted px-2 py-0.5 font-medium capitalize">
                  {school.planTier} Plan
                </span>
              )}
              {school.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {format(new Date(school.createdAt), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {school.status === 'active' || school.status === 'trial' ? (
            <button
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
            >
              <Ban className="h-3.5 w-3.5" />
              Suspend
            </button>
          ) : (
            <button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-60"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Activate
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* School Info */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">School Information</h2>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <InfoRow
                icon={School}
                label="Name"
                value={school.name}
                editing={isEditing}
                editValue={editForm.name}
                onChange={(v) => setEditForm((p) => ({ ...p, name: v }))}
              />
              <InfoRow
                icon={Globe}
                label="Slug"
                value={school.slug || '-'}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={school.address || '-'}
                editing={isEditing}
                editValue={editForm.address}
                onChange={(v) => setEditForm((p) => ({ ...p, address: v }))}
              />
              <InfoRow
                icon={MapPin}
                label="City"
                value={school.city || '-'}
                editing={isEditing}
                editValue={editForm.city}
                onChange={(v) => setEditForm((p) => ({ ...p, city: v }))}
              />
              <InfoRow
                icon={MapPin}
                label="State"
                value={school.state || '-'}
                editing={isEditing}
                editValue={editForm.state}
                onChange={(v) => setEditForm((p) => ({ ...p, state: v }))}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={school.phone || '-'}
                editing={isEditing}
                editValue={editForm.phone}
                onChange={(v) => setEditForm((p) => ({ ...p, phone: v }))}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={school.email || '-'}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{school.stats?.userCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{school.stats?.studentCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{school.maxUsers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Max Users</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{school.stats?.addonCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Addons</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Subscription</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium capitalize text-foreground">
                    {school.planTier || 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Students</span>
                  <span className="text-sm font-medium text-foreground">
                    {school.maxStudents ?? 'Unlimited'}
                  </span>
                </div>
                {school.trialEndsAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trial Ends</span>
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(school.trialEndsAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-lg border bg-card">
          {usersQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : usersQuery.isError ? (
            <div className="p-6 text-sm text-muted-foreground">Failed to load users</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.banned ? 'banned' : 'active'} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addons' && (
        <div className="rounded-lg border bg-card">
          {addonsQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : addonsQuery.isError ? (
            <div className="p-6 text-sm text-muted-foreground">Failed to load addons</div>
          ) : addons.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No addons configured</div>
          ) : (
            <div className="divide-y divide-border">
              {addons.map((addon: any) => (
                <div key={addon.id || addon.slug} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Puzzle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{addon.name}</p>
                      <p className="text-xs text-muted-foreground">{addon.description || addon.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAddonMutation.mutate(addon.slug)}
                    disabled={toggleAddonMutation.isPending}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      addon.enabled ? 'bg-primary' : 'bg-muted'
                    } disabled:opacity-60`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        addon.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <SchoolActivityTab schoolId={id!} />
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  editing,
  editValue,
  onChange,
}: {
  icon: typeof School
  label: string
  value: string
  editing?: boolean
  editValue?: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing && onChange ? (
          <input
            type="text"
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="mt-0.5 h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  )
}

function SchoolActivityTab({ schoolId }: { schoolId: string }) {
  // Uses the already-imported useQuery and adminApi from top of file
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', 'school', schoolId],
    queryFn: () => adminApi.getAuditLog({ schoolId, limit: '20' }),
  })

  const logs = data?.data || []

  const actionColors: Record<string, string> = {
    create: 'bg-green-50 text-green-700',
    update: 'bg-blue-50 text-blue-700',
    delete: 'bg-red-50 text-red-700',
    login: 'bg-purple-50 text-purple-700',
    status_change: 'bg-amber-50 text-amber-700',
  }

  if (isLoading) return <div className="text-center py-8 text-sm text-muted-foreground">Loading activity...</div>

  return (
    <div className="rounded-lg border bg-card">
      {logs.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">No activity recorded for this school yet.</div>
      ) : (
        <div className="divide-y">
          {logs.map((log: any) => (
            <div key={log.id} className="px-6 py-3 flex items-center gap-3">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${actionColors[log.action] || 'bg-gray-50 text-gray-700'}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.description || `${log.action} on ${log.entityType}`}</p>
                <p className="text-xs text-muted-foreground">{log.userName} — {new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
