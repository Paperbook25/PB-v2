import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CreditCard, TrendingUp, AlertTriangle, RefreshCw, Plus } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { School } from '@/lib/types'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const STATUS_LABELS: Record<string, string> = {
  sub_active: 'Active',
  sub_trial: 'Trial',
  sub_past_due: 'Past Due',
  sub_cancelled: 'Cancelled',
  sub_expired: 'Expired',
}

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  starter: '#3b82f6',
  professional: '#8b5cf6',
  enterprise: '#f59e0b',
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
}

export function SubscriptionsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ schoolId: '', planTier: 'starter', billingCycle: 'monthly', amount: '', isTrial: false, trialDays: '14' })
  const [createError, setCreateError] = useState('')

  const { data: schoolsList } = useQuery({
    queryKey: ['admin', 'schools-list'],
    queryFn: () => adminApi.listSchools({}),
    enabled: showCreateDialog,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      setShowCreateDialog(false)
      setCreateForm({ schoolId: '', planTier: 'starter', billingCycle: 'monthly', amount: '', isTrial: false, trialDays: '14' })
    },
    onError: (err: any) => setCreateError(err.message || 'Failed to create subscription'),
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'analytics'],
    queryFn: adminApi.getSubscriptionAnalytics,
  })

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', statusFilter, planFilter],
    queryFn: () => adminApi.listSubscriptions({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(planFilter ? { planTier: planFilter } : {}),
    }),
  })

  const { data: trials } = useQuery({
    queryKey: ['admin', 'subscriptions', 'trials'],
    queryFn: () => adminApi.getExpiringTrials(14),
  })

  const subscriptions = subsData?.data || []

  const formatCurrency = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage school subscriptions and track revenue metrics</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={analyticsLoading ? '...' : formatCurrency(analytics?.mrr || 0)}
          icon={CreditCard}
        />
        <StatCard
          title="Active Subscriptions"
          value={analyticsLoading ? '...' : analytics?.activeCount || 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Churn Rate"
          value={analyticsLoading ? '...' : `${analytics?.churnRate || 0}%`}
          icon={AlertTriangle}
        />
        <StatCard
          title="Trial Conversion"
          value={analyticsLoading ? '...' : `${analytics?.trialConversionRate || 0}%`}
          icon={RefreshCw}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Plan Distribution */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Plan Distribution</h3>
          {analytics?.planDistribution?.length ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={analytics.planDistribution} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {analytics.planDistribution.map((entry: any) => (
                      <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan] || '#6366f1'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {analytics.planDistribution.map((entry: any) => (
                  <div key={entry.plan} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.plan] || '#6366f1' }} />
                    <span className="capitalize">{entry.plan}</span>
                    <span className="text-muted-foreground">({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No subscription data yet</p>
          )}
        </div>

        {/* MRR Trend */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">MRR Trend</h3>
          {analytics?.mrrTrend?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={analytics.mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'MRR']} />
                <Line type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No trend data yet</p>
          )}
        </div>
      </div>

      {/* Expiring Trials */}
      {trials && trials.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Expiring Trials ({trials.length})</h3>
          <div className="flex flex-wrap gap-2">
            {trials.map((t: any) => (
              <button
                key={t.id}
                onClick={() => navigate(`/subscriptions/${t.id}`)}
                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-amber-200 px-2.5 py-1 text-xs text-amber-800 hover:bg-amber-100"
              >
                <span className="font-medium">{t.schoolName}</span>
                <span className="text-amber-600">{t.daysRemaining}d left</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="sub_active">Active</option>
          <option value="sub_trial">Trial</option>
          <option value="sub_past_due">Past Due</option>
          <option value="sub_cancelled">Cancelled</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-9 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Next Billing</th>
            </tr>
          </thead>
          <tbody>
            {subsLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No subscriptions found. Create one to get started.</td></tr>
            ) : (
              subscriptions.map((sub: any) => (
                <tr
                  key={sub.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/subscriptions/${sub.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{sub.schoolName}</div>
                    <div className="text-xs text-muted-foreground">{sub.schoolEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize" style={{ backgroundColor: `${PLAN_COLORS[sub.planTier] || '#6366f1'}20`, color: PLAN_COLORS[sub.planTier] || '#6366f1' }}>
                      {sub.planTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status.replace('sub_', '')} />
                  </td>
                  <td className="px-4 py-3 text-sm">{CYCLE_LABELS[sub.billingCycle] || sub.billingCycle}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">₹{sub.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Subscription Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Subscription</h2>
            {createError && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{createError}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">School</label>
                <select value={createForm.schoolId} onChange={(e) => setCreateForm({ ...createForm, schoolId: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="">Select a school...</option>
                  {(schoolsList?.data || []).map((s: School) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Plan</label>
                  <select value={createForm.planTier} onChange={(e) => setCreateForm({ ...createForm, planTier: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                    <option value="free">Free</option><option value="starter">Starter</option>
                    <option value="professional">Professional</option><option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Billing Cycle</label>
                  <select value={createForm.billingCycle} onChange={(e) => setCreateForm({ ...createForm, billingCycle: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                    <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
                    <option value="semi_annual">Semi-Annual</option><option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
                <input type="number" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} placeholder="Monthly amount" className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.isTrial} onChange={(e) => setCreateForm({ ...createForm, isTrial: e.target.checked })} className="rounded" />
                  Start as trial
                </label>
                {createForm.isTrial && (
                  <input type="number" value={createForm.trialDays} onChange={(e) => setCreateForm({ ...createForm, trialDays: e.target.value })} className="h-8 w-20 rounded-lg border bg-background px-2 text-sm" placeholder="Days" />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => {
                  setCreateError('')
                  createMutation.mutate({
                    schoolId: createForm.schoolId,
                    planTier: createForm.planTier,
                    billingCycle: createForm.billingCycle,
                    amount: Number(createForm.amount),
                    isTrial: createForm.isTrial,
                    trialDays: createForm.isTrial ? Number(createForm.trialDays) : undefined,
                  })
                }}
                disabled={createMutation.isPending || !createForm.schoolId || !createForm.amount}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
