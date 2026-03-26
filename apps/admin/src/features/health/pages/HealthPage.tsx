import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartPulse, Clock, AlertTriangle, Server, Check, Plus } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'

const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

export function HealthPage() {
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState('24h')
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [alertForm, setAlertForm] = useState({ type: 'maintenance', severity: 'info', message: '' })

  const { data: status, isLoading } = useQuery({
    queryKey: ['admin', 'health', 'status'],
    queryFn: adminApi.getHealthStatus,
    refetchInterval: 30000, // Refresh every 30s
  })

  const { data: alerts } = useQuery({
    queryKey: ['admin', 'health', 'alerts'],
    queryFn: adminApi.getHealthAlerts,
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => adminApi.resolveAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'health'] }),
  })

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'health'] })
      setShowCreateAlert(false)
      setAlertForm({ type: 'maintenance', severity: 'info', message: '' })
    },
  })

  const activeAlerts = (alerts || []).filter((a: any) => !a.isResolved)
  const resolvedAlerts = (alerts || []).filter((a: any) => a.isResolved)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-sm text-muted-foreground">Monitor server performance, uptime, and alerts</p>
        </div>
        <button onClick={() => setShowCreateAlert(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Maintenance Alert
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Uptime" value={isLoading ? '...' : status?.uptimeFormatted || '0m'} icon={Clock} />
        <StatCard title="Avg Response Time" value={isLoading ? '...' : `${status?.avgResponseTime || 0}ms`} icon={HeartPulse} />
        <StatCard title="Active Alerts" value={isLoading ? '...' : status?.activeAlerts || 0} icon={AlertTriangle} />
        <StatCard title="Database" value={isLoading ? '...' : status?.database || 'checking...'} icon={Server} />
      </div>

      {/* System Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-3">Server Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Node.js</span><span className="font-mono">{status?.nodeVersion || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span className="font-mono">{status?.platform || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CPUs</span><span>{status?.cpu?.cpus || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Load Average</span><span className="font-mono">{status?.cpu?.loadAvg?.join(', ') || '-'}</span></div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-3">Memory Usage</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Heap Used</span><span>{status?.memory?.heapUsed || 0} MB</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Heap Total</span><span>{status?.memory?.heapTotal || 0} MB</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">RSS</span><span>{status?.memory?.rss || 0} MB</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">External</span><span>{status?.memory?.external || 0} MB</span></div>
          </div>
          {status?.memory && (
            <div className="mt-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (status.memory.heapUsed / status.memory.heapTotal) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{Math.round((status.memory.heapUsed / status.memory.heapTotal) * 100)}% heap used</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active Alerts ({activeAlerts.length})</h3>
        </div>
        {activeAlerts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            All clear — no active alerts
          </div>
        ) : (
          <div className="divide-y">
            {activeAlerts.map((alert: any) => (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}`}>
                    {alert.severity}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.type} — {new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => resolveMutation.mutate(alert.id)}
                  className="text-xs px-3 py-1 rounded-md border hover:bg-muted"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="px-6 py-4 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground">Recently Resolved ({resolvedAlerts.length})</h3>
          </div>
          <div className="divide-y">
            {resolvedAlerts.slice(0, 10).map((alert: any) => (
              <div key={alert.id} className="px-6 py-3 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">Resolved {new Date(alert.resolvedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alert Dialog */}
      {showCreateAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateAlert(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Maintenance Alert</h2>
            <div className="space-y-3">
              <select value={alertForm.severity} onChange={(e) => setAlertForm({...alertForm, severity: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <textarea placeholder="Alert message..." value={alertForm.message} onChange={(e) => setAlertForm({...alertForm, message: e.target.value})} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreateAlert(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => createAlertMutation.mutate(alertForm)} disabled={!alertForm.message} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
