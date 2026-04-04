import { useQuery } from '@tanstack/react-query'
import { Users, GraduationCap, School, Puzzle, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: adminApi.getAnalyticsOverview,
  })

  const { data: adoption } = useQuery({
    queryKey: ['admin', 'analytics', 'feature-adoption'],
    queryFn: adminApi.getFeatureAdoption,
  })

  const { data: benchmarks } = useQuery({
    queryKey: ['admin', 'analytics', 'benchmarks'],
    queryFn: adminApi.getBenchmarks,
  })

  const { data: trends } = useQuery({
    queryKey: ['admin', 'analytics', 'trends'],
    queryFn: adminApi.getAnalyticsTrends,
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin', 'billing', 'revenue'],
    queryFn: adminApi.getRevenueSummary,
  })

  const { data: cohort } = useQuery({
    queryKey: ['admin', 'analytics', 'cohort'],
    queryFn: adminApi.getCohortAnalysis,
  })

  const { data: funnel } = useQuery({
    queryKey: ['admin', 'analytics', 'funnel'],
    queryFn: adminApi.getFunnelAnalysis,
  })

  const { data: ltv } = useQuery({
    queryKey: ['admin', 'analytics', 'ltv'],
    queryFn: adminApi.getLtvAnalysis,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground">Cross-institution insights, benchmarks, and adoption metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Students" value={overviewLoading ? '...' : (overview?.totalStudents || 0).toLocaleString()} icon={GraduationCap} />
        <StatCard title="Total Staff" value={overviewLoading ? '...' : overview?.totalStaff || 0} icon={Users} />
        <StatCard title="Active Schools" value={overviewLoading ? '...' : overview?.activeSchools || 0} icon={School} />
        <StatCard title="Most Popular Addon" value={overviewLoading ? '...' : overview?.mostPopularAddon || 'N/A'} icon={Puzzle} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Avg Students/School" value={overviewLoading ? '...' : overview?.avgStudentsPerSchool || 0} icon={TrendingUp} />
        <StatCard title="Churned Schools" value={overviewLoading ? '...' : overview?.churnedSchools || 0} icon={TrendingDown} />
      </div>

      {/* Revenue Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Revenue Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Revenue" value={`₹${((revenue?.totalRevenue || 0) / 1000).toFixed(1)}K`} icon={IndianRupee} />
          <StatCard title="Revenue This Month" value={`₹${((revenue?.revenueThisMonth || 0) / 1000).toFixed(1)}K`} icon={IndianRupee} />
          <StatCard title="Outstanding" value={`₹${revenue?.outstanding || 0}`} icon={IndianRupee} />
          <StatCard title="Collection Rate" value={`${revenue?.collectionRate || 0}%`} icon={IndianRupee} />
        </div>
      </div>

      {/* Trends Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Platform Growth Trends (12 months)</h3>
        {trends?.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newSchools" name="New Schools" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="newStudents" name="New Students" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground py-8 text-center">No trend data yet</p>}
      </div>

      {/* Revenue Trend */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Monthly Revenue (Last 12 Months)</h3>
        {revenue?.monthlyRevenue?.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="invoiced" name="Invoiced" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground py-8 text-center">No revenue data yet</p>}
      </div>

      {/* Feature Adoption */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Feature Adoption</h3>
        {adoption?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adoption} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Adoption']} />
              <Bar dataKey="adoptionRate" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground py-8 text-center">No adoption data</p>}
      </div>

      {/* School Benchmarks Table */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold">School Rankings</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3 text-right">Students</th>
              <th className="px-4 py-3 text-right">Staff</th>
              <th className="px-4 py-3 text-right">Student:Staff</th>
              <th className="px-4 py-3 text-right">Addons</th>
            </tr>
          </thead>
          <tbody>
            {!benchmarks?.length ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No school data</td></tr>
            ) : benchmarks.map((s: any, i: number) => (
              <tr key={s.schoolId} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3"><div className="text-sm font-medium">{s.schoolName}</div><div className="text-xs text-muted-foreground">{s.city || ''}</div></td>
                <td className="px-4 py-3 text-xs capitalize">{s.planTier}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{s.studentCount}</td>
                <td className="px-4 py-3 text-sm text-right">{s.staffCount}</td>
                <td className="px-4 py-3 text-sm text-right">{s.studentStaffRatio}:1</td>
                <td className="px-4 py-3 text-sm text-right">{s.addonsEnabled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Schools */}
      {overview?.topSchools?.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-3">Top Schools by Students</h3>
          <div className="space-y-2">
            {overview.topSchools.map((s: any, i: number) => (
              <div key={s.schoolId} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium">{s.schoolName}</span>
                    {s.city && <span className="text-xs text-muted-foreground ml-2">{s.city}</span>}
                  </div>
                </div>
                <span className="text-sm font-semibold">{s.studentCount} students</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Conversion Funnel</h3>
        {funnel?.stages?.length ? (
          <div className="space-y-3">
            {funnel.stages.map((stage: any, i: number) => (
              <div key={stage.name} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium">{stage.name}</span>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: ['#6366f1', '#3b82f6', '#22c55e', '#ef4444'][i] || '#94a3b8',
                    }}
                  />
                </div>
                <span className="w-20 text-sm text-right">{stage.count} ({stage.percentage}%)</span>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{funnel.conversionRates?.signupToTrial || 0}%</p>
                <p className="text-xs text-muted-foreground">Signup → Trial</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{funnel.conversionRates?.trialToActive || 0}%</p>
                <p className="text-xs text-muted-foreground">Trial → Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{funnel.conversionRates?.overallConversion || 0}%</p>
                <p className="text-xs text-muted-foreground">Overall Conversion</p>
              </div>
            </div>
          </div>
        ) : <p className="text-sm text-muted-foreground py-8 text-center">No funnel data</p>}
      </div>

      {/* Cohort Retention */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold">Cohort Retention</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Schools grouped by signup month</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3 text-right">Signups</th>
              <th className="px-4 py-3 text-right">Active</th>
              <th className="px-4 py-3 text-right">Trial</th>
              <th className="px-4 py-3 text-right">Churned</th>
              <th className="px-4 py-3 text-right">Retention</th>
            </tr>
          </thead>
          <tbody>
            {!cohort?.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No cohort data</td></tr>
            ) : cohort.map((c: any) => (
              <tr key={c.month} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{c.month}</td>
                <td className="px-4 py-3 text-sm text-right">{c.total}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{c.active}</td>
                <td className="px-4 py-3 text-sm text-right text-blue-600">{c.trial}</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">{c.churned}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-semibold ${c.retentionRate >= 70 ? 'text-green-600' : c.retentionRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {c.retentionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LTV by Plan */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold">Lifetime Value by Plan</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3 text-right">Schools</th>
              <th className="px-4 py-3 text-right">Total Revenue</th>
              <th className="px-4 py-3 text-right">Avg/School</th>
              <th className="px-4 py-3 text-right">Avg Monthly</th>
              <th className="px-4 py-3 text-right">Est. 12m LTV</th>
            </tr>
          </thead>
          <tbody>
            {!ltv?.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No LTV data</td></tr>
            ) : ltv.map((l: any) => (
              <tr key={l.planTier} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium capitalize">{l.planTier}</td>
                <td className="px-4 py-3 text-sm text-right">{l.schoolCount}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">₹{l.totalRevenue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right">₹{l.avgRevenuePerSchool.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right">₹{l.avgMonthlyRevenue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-primary">₹{l.estimatedLtv12m.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
