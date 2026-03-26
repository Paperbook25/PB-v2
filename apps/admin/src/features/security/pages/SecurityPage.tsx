import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, UserPlus, Check, X, ShieldCheck, AlertTriangle, Clock } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Viewer',
  billing_admin: 'Billing Admin',
  support: 'Support',
}

export function SecurityPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'admins' | 'compliance' | 'history'>('admins')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'admin' })
  const [inviteError, setInviteError] = useState('')

  const { data: admins } = useQuery({
    queryKey: ['admin', 'security', 'admins'],
    queryFn: adminApi.listGravityAdmins,
    enabled: activeTab === 'admins',
  })

  const { data: compliance } = useQuery({
    queryKey: ['admin', 'security', 'compliance'],
    queryFn: adminApi.getComplianceStatus,
    enabled: activeTab === 'compliance',
  })

  const { data: loginHistory } = useQuery({
    queryKey: ['admin', 'security', 'login-history'],
    queryFn: adminApi.getLoginHistory,
    enabled: activeTab === 'history',
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createGravityAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security'] })
      setShowInvite(false)
      setInviteForm({ email: '', name: '', role: 'admin' })
    },
    onError: (err: any) => setInviteError(err.message),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeGravityAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'security'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security & Compliance</h1>
          <p className="text-sm text-muted-foreground">Manage admin access, monitor compliance, and review activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['admins', 'compliance', 'history'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >{tab === 'history' ? 'Login History' : tab === 'admins' ? 'Admin Roles' : 'Compliance'}</button>
        ))}
      </div>

      {/* Admin Roles Tab */}
      {activeTab === 'admins' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <UserPlus className="h-4 w-4" /> Add Admin
            </button>
          </div>
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!admins?.length ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No Gravity admins configured. Current access is via better-auth admin role.</td></tr>
                ) : admins.map((admin: any) => (
                  <tr key={admin.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{admin.name}</div>
                      <div className="text-xs text-muted-foreground">{admin.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Shield className="h-3 w-3" /> {ROLE_LABELS[admin.role] || admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={admin.isActive ? 'active' : 'banned'} /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeMutation.mutate(admin.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && compliance && (
        <>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Compliance Score</h3>
              <span className={`text-2xl font-bold ${compliance.score >= 80 ? 'text-green-600' : compliance.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {compliance.score}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${compliance.score >= 80 ? 'bg-green-500' : compliance.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${compliance.score}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{compliance.passCount} of {compliance.totalChecks} checks passing</p>
          </div>

          <div className="space-y-3">
            {compliance.checks.map((check: any) => (
              <div key={check.id} className="rounded-lg border bg-card p-4 flex items-start gap-3">
                {check.status === 'pass' ? (
                  <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{check.name}</h4>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      check.status === 'pass' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>{check.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Login History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {!loginHistory?.length ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No login history available</td></tr>
              ) : loginHistory.map((log: any) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{log.userName}</td>
                  <td className="px-4 py-3 text-xs capitalize">{log.userRole}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{log.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Dialog */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Gravity Admin</h2>
            {inviteError && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{inviteError}</div>}
            <div className="space-y-3">
              <input placeholder="Email (must have existing account)" type="email" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <input placeholder="Name" value={inviteForm.name} onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <select value={inviteForm.role} onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="billing_admin">Billing Admin</option>
                <option value="support">Support</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => { setInviteError(''); createMutation.mutate(inviteForm) }} disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50">
                {createMutation.isPending ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
