import { useQuery } from '@tanstack/react-query'
import { Users, GraduationCap, School, Puzzle, TrendingUp, TrendingDown } from 'lucide-react'
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
    </div>
  )
}
