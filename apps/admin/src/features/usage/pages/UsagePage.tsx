import { useQuery } from '@tanstack/react-query'
import { Activity, Users, HardDrive, Zap } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'

export function UsagePage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin', 'usage', 'overview'],
    queryFn: adminApi.getUsageOverview,
  })

  const { data: schools } = useQuery({
    queryKey: ['admin', 'usage', 'schools'],
    queryFn: adminApi.getSchoolUsage,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usage Tracking</h1>
        <p className="text-sm text-muted-foreground">Monitor platform usage across all schools</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="API Calls Today" value={isLoading ? '...' : (overview?.apiCallsToday || 0).toLocaleString()} icon={Zap} />
        <StatCard title="Active Users Today" value={isLoading ? '...' : overview?.activeUsersToday || 0} icon={Users} />
        <StatCard title="Total Storage" value={isLoading ? '...' : `${overview?.totalStorageMb || 0} MB`} icon={HardDrive} />
        <StatCard title="Avg API/School" value={isLoading ? '...' : overview?.avgApiCallsPerSchool || 0} icon={Activity} />
      </div>

      {/* Per-School Usage Table */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold">Per-School Usage (Last 30 Days)</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">API Calls</th>
              <th className="px-4 py-3 text-right">Active Users</th>
              <th className="px-4 py-3 text-right">Storage (MB)</th>
            </tr>
          </thead>
          <tbody>
            {!schools?.length ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                No usage data yet. Usage metrics will appear as schools use the platform.
              </td></tr>
            ) : schools.map((s: any) => (
              <tr key={s.schoolId} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{s.schoolName}</td>
                <td className="px-4 py-3 text-xs capitalize">{s.planTier}</td>
                <td className="px-4 py-3 text-xs capitalize">{s.status}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">{(s.apiCalls30d || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">{s.activeUsers30d || 0}</td>
                <td className="px-4 py-3 text-sm text-right">{s.storageMb || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
