import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Activity, Users, HardDrive, Zap, AlertTriangle, TrendingDown, ChevronRight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'

const MODULE_COLORS: Record<string, string> = {
  finance: '#7c3aed',
  attendance: '#2563eb',
  academics: '#059669',
  library: '#d97706',
  hostel: '#dc2626',
  transport: '#7c3aed',
  fees: '#0891b2',
  hr: '#9333ea',
  communication: '#16a34a',
}

function moduleColor(mod: string) {
  return MODULE_COLORS[mod.toLowerCase()] || '#6366f1'
}

function riskBadge(risk: string) {
  const config: Record<string, { label: string; cls: string }> = {
    high:   { label: 'High Risk',   cls: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Medium Risk', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    low:    { label: 'Low Risk',    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  }
  const c = config[risk?.toLowerCase()] || config.low
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${c.cls}`}>{c.label}</span>
  )
}

export function UsagePage() {
  const [trendModule, setTrendModule] = useState<string>('')
  const [detailSchool, setDetailSchool] = useState<any | null>(null)

  const overviewQ = useQuery({
    queryKey: ['admin', 'usage', 'overview'],
    queryFn: adminApi.getUsageOverview,
  })
  const schoolsQ = useQuery({
    queryKey: ['admin', 'usage', 'schools'],
    queryFn: adminApi.getSchoolUsage,
  })
  const featureSummaryQ = useQuery({
    queryKey: ['admin', 'feature-usage', 'summary'],
    queryFn: () => adminApi.getFeatureUsageSummary(30),
  })
  const trendsQ = useQuery({
    queryKey: ['admin', 'feature-usage', 'trends', trendModule],
    queryFn: () => adminApi.getFeatureUsageTrends(30, trendModule || undefined),
  })
  const churnQ = useQuery({
    queryKey: ['admin', 'feature-usage', 'churn-risk'],
    queryFn: adminApi.getChurnRiskSchools,
  })
  const schoolDetailQ = useQuery({
    queryKey: ['admin', 'usage', 'school', detailSchool?.schoolId],
    queryFn: () => adminApi.getSchoolUsageDetail(detailSchool!.schoolId),
    enabled: !!detailSchool,
  })

  const overview = overviewQ.data
  const schools: any[] = schoolsQ.data || []
  const featureSummary: any[] = Array.isArray(featureSummaryQ.data) ? featureSummaryQ.data : []
  const trends: any[] = Array.isArray(trendsQ.data) ? trendsQ.data : []
  const churnSchools: any[] = Array.isArray(churnQ.data) ? churnQ.data : []

  // Total school count for adoption %
  const totalSchools = schools.length || 1
  const modules = featureSummary.map((f: any) => f.module)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Usage Tracking</h1>
        <p className="text-sm text-muted-foreground">Monitor platform usage and feature adoption across all schools</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="API Calls Today"
          value={overviewQ.isLoading ? '...' : (overview?.apiCallsToday || 0).toLocaleString()}
          icon={Zap}
        />
        <StatCard
          title="Active Users Today"
          value={overviewQ.isLoading ? '...' : (overview?.activeUsersToday || 0)}
          icon={Users}
        />
        <StatCard
          title="Total Storage"
          value={overviewQ.isLoading ? '...' : `${overview?.totalStorageMb || 0} MB`}
          icon={HardDrive}
        />
        <StatCard
          title="Avg API / School"
          value={overviewQ.isLoading ? '...' : (overview?.avgApiCallsPerSchool || 0)}
          icon={Activity}
        />
      </div>

      {/* Feature Adoption */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">Feature Adoption — Last 30 Days</h3>
          <p className="text-xs text-muted-foreground mt-0.5">% of schools actively using each module</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          {featureSummaryQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : featureSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature usage data yet.</p>
          ) : (
            featureSummary
              .slice()
              .sort((a, b) => (b.uniqueSchools || 0) - (a.uniqueSchools || 0))
              .map((f: any) => {
                const pct = Math.round(((f.uniqueSchools || 0) / totalSchools) * 100)
                const color = moduleColor(f.module)
                return (
                  <div key={f.module}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium capitalize text-foreground">{f.module}</span>
                      <span className="text-muted-foreground">
                        {f.uniqueSchools} school{f.uniqueSchools !== 1 ? 's' : ''} · {f.totalActions?.toLocaleString() || 0} actions · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* Trends + Churn Risk side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Usage Trends */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Usage Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily actions over last 30 days</p>
            </div>
            {modules.length > 0 && (
              <select
                value={trendModule}
                onChange={e => setTrendModule(e.target.value)}
                className="h-8 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Modules</option>
                {modules.map(m => (
                  <option key={m} value={m} className="capitalize">{m}</option>
                ))}
              </select>
            )}
          </div>
          <div className="px-2 py-4">
            {trendsQ.isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : trends.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No trend data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => v?.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={36} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalActions"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                    name="Actions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Churn Risk */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold text-foreground">Churn Risk Schools</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Schools with low engagement or inactivity</p>
          </div>
          <div className="divide-y">
            {churnQ.isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : churnSchools.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No at-risk schools</div>
            ) : (
              churnSchools.slice(0, 6).map((s: any) => (
                <div key={s.schoolId} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/schools/${s.schoolId}`}
                      className="text-sm font-medium text-foreground hover:text-primary truncate block"
                    >
                      {s.schoolName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.activeFeatures || 0} active features · last seen {s.lastActive ? new Date(s.lastActive).toLocaleDateString('en-IN') : 'never'}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {riskBadge(s.riskLevel || s.risk)}
                  </div>
                </div>
              ))
            )}
          </div>
          {churnSchools.length > 6 && (
            <div className="border-t px-6 py-3">
              <p className="text-xs text-muted-foreground">+{churnSchools.length - 6} more at-risk schools</p>
            </div>
          )}
        </div>
      </div>

      {/* Per-School Usage Table */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Per-School Usage — Last 30 Days</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click "Details" to see full breakdown</p>
          </div>
          {schools.length > 0 && (
            <span className="text-xs text-muted-foreground">{schools.length} schools</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">API Calls</th>
                <th className="px-4 py-3 text-right">Active Users</th>
                <th className="px-4 py-3 text-right">Storage (MB)</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {schoolsQ.isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : schools.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No usage data yet. Metrics appear as schools use the platform.
                </td></tr>
              ) : schools.map((s: any) => (
                <tr key={s.schoolId} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{s.schoolName}</td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{s.planTier}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs capitalize font-medium ${s.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{(s.apiCalls30d || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.activeUsers30d || 0}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.storageMb || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetailSchool(s)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
                    >
                      Details <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* School Detail Slide-over */}
      {detailSchool && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setDetailSchool(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-card shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold">{detailSchool.schoolName}</h2>
                <p className="text-xs text-muted-foreground capitalize">{detailSchool.planTier} · {detailSchool.status}</p>
              </div>
              <button
                onClick={() => setDetailSchool(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Overview numbers */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'API Calls', value: (detailSchool.apiCalls30d || 0).toLocaleString() },
                  { label: 'Active Users', value: detailSchool.activeUsers30d || 0 },
                  { label: 'Storage', value: `${detailSchool.storageMb || 0} MB` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Detail data */}
              {schoolDetailQ.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading details…</p>
              ) : schoolDetailQ.data ? (
                <div className="space-y-4">
                  {schoolDetailQ.data.featureBreakdown && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">Feature Breakdown</h4>
                      <div className="space-y-2">
                        {schoolDetailQ.data.featureBreakdown.map((f: any) => (
                          <div key={f.module} className="flex items-center justify-between text-sm">
                            <span className="capitalize text-foreground">{f.module}</span>
                            <span className="font-medium text-muted-foreground">{(f.actions || 0).toLocaleString()} actions</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {schoolDetailQ.data.topUsers && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">Top Users</h4>
                      <div className="space-y-1.5">
                        {schoolDetailQ.data.topUsers.slice(0, 5).map((u: any) => (
                          <div key={u.userId} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{u.name || u.email}</span>
                            <span className="text-muted-foreground">{(u.actions || 0).toLocaleString()} actions</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-xs text-yellow-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>No detailed breakdown available for this school yet.</span>
                </div>
              )}

              <Link
                to={`/schools/${detailSchool.schoolId}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <TrendingDown className="h-4 w-4" />
                View School Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
