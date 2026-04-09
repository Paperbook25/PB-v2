import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail, CheckCircle, XCircle, AlertCircle, Loader2, Send,
  ToggleLeft, ToggleRight, Trash2, RefreshCw, Settings, Activity, List, Zap,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { useToast } from '@/hooks/use-toast'

// ============================================================================
// Types
// ============================================================================

interface EmailStats {
  totalSent: number
  totalFailed: number
  todaySent: number
  successRate: number
  byTemplate: { template: string; count: number; failCount: number; failRate: number }[]
  recentFailures: { id: string; to: string; subject: string; template: string; error: string; createdAt: string }[]
}

interface EmailLog {
  id: string
  to: string
  subject: string
  template: string
  status: 'sent' | 'failed' | 'skipped'
  messageId: string | null
  error: string | null
  createdAt: string
}

interface EmailConfig {
  hasActiveIntegration: boolean
  provider: string | null
  fromAddress: string | null
  lastTestedAt: string | null
  events: Record<string, boolean>
}

// ============================================================================
// Email Events Config
// ============================================================================

const EMAIL_EVENTS = [
  {
    category: 'Lead & Onboarding',
    events: [
      { key: 'lead_confirmation', label: 'Lead Sign-up Confirmation', description: 'Sent when a lead submits the form at paperbook.app' },
      { key: 'trial_activation', label: 'Trial Activation Link', description: 'Sent when your team sends an activation link from CRM' },
      { key: 'trial_expiry_warning', label: 'Trial Expiry Warning', description: 'Sent 3 days before a trial expires' },
      { key: 'school_activated', label: 'School Activated (Welcome)', description: 'Sent when a school completes setup and goes live' },
    ],
  },
  {
    category: 'Auth & Access',
    events: [
      { key: 'password_reset', label: 'Password Reset', description: 'Sent when a user requests a password reset' },
      { key: 'staff_invitation', label: 'Staff Invitation', description: 'Sent when a staff member is invited to a school' },
      { key: 'otp_verification', label: 'OTP Verification', description: 'Sent for email verification and login OTPs' },
    ],
  },
  {
    category: 'Finance',
    events: [
      { key: 'fee_reminder', label: 'Fee Reminder', description: 'Sent to parents when fees are due' },
      { key: 'payment_receipt', label: 'Payment Receipt', description: 'Sent to parents when a payment is confirmed' },
      { key: 'invoice_notification', label: 'Invoice Notification', description: 'Sent to school admins when a PaperBook invoice is raised' },
      { key: 'overdue_reminder', label: 'Overdue Reminder', description: 'Sent to school admins when an invoice is overdue' },
    ],
  },
  {
    category: 'Support & Comms',
    events: [
      { key: 'new_ticket', label: 'New Support Ticket', description: 'Sent to your support team when a ticket is opened' },
      { key: 'ticket_resolved', label: 'Ticket Resolved', description: 'Sent to the school when a support ticket is closed' },
      { key: 'announcement', label: 'Platform Announcement', description: 'Sent to schools when a platform announcement is broadcast' },
    ],
  },
]

const TEMPLATE_LABELS: Record<string, string> = {
  lead_confirmation: 'Lead Confirmation',
  trial_activation: 'Trial Activation',
  trial_expiry_warning: 'Trial Expiry Warning',
  school_activated: 'School Activated',
  password_reset: 'Password Reset',
  staff_invitation: 'Staff Invitation',
  otp_verification: 'OTP Verification',
  fee_reminder: 'Fee Reminder',
  payment_receipt: 'Payment Receipt',
  invoice_notification: 'Invoice Notification',
  overdue_reminder: 'Overdue Reminder',
  new_ticket: 'New Ticket',
  ticket_resolved: 'Ticket Resolved',
  announcement: 'Announcement',
  test: 'Test Email',
  unknown: 'Unknown',
}

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    sent: { color: 'text-green-700 bg-green-50 border-green-200', label: 'Sent' },
    failed: { color: 'text-red-700 bg-red-50 border-red-200', label: 'Failed' },
    skipped: { color: 'text-gray-500 bg-gray-50 border-gray-200', label: 'Skipped' },
  }[status] || { color: 'text-gray-500 bg-gray-50 border-gray-200', label: status }

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, sub, color = 'text-foreground' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ stats }: { stats: EmailStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sent (30 days)" value={stats.totalSent.toLocaleString()} color="text-green-600" />
        <StatCard label="Failed (30 days)" value={stats.totalFailed.toLocaleString()} color="text-red-600" />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} color={stats.successRate >= 95 ? 'text-green-600' : 'text-orange-500'} />
        <StatCard label="Sent Today" value={stats.todaySent.toLocaleString()} />
      </div>

      {stats.byTemplate.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Emails by Template (30 days)</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Template</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">Sent</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">Failed</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">Fail Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.byTemplate.map(t => (
                <tr key={t.template} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-2.5 font-medium">{TEMPLATE_LABELS[t.template] || t.template}</td>
                  <td className="px-5 py-2.5 text-right text-green-600">{t.count}</td>
                  <td className="px-5 py-2.5 text-right text-red-600">{t.failCount}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={t.failRate > 10 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                      {t.failRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.recentFailures.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold text-red-600">Recent Failures</h3>
          </div>
          <div className="divide-y">
            {stats.recentFailures.map(f => (
              <div key={f.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.to}</p>
                    <p className="truncate text-xs text-muted-foreground">{f.subject}</p>
                    {f.error && <p className="mt-1 text-xs text-red-600">{f.error}</p>}
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {new Date(f.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalSent === 0 && stats.totalFailed === 0 && (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border bg-card text-center">
          <Mail className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No emails sent in the last 30 days</p>
          <p className="text-xs text-muted-foreground">Configure your email provider to start sending</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Configuration Tab
// ============================================================================

function ConfigurationTab({ config }: { config: EmailConfig }) {
  const { toast } = useToast()
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    if (!testEmail.trim()) return
    setTesting(true)
    try {
      const res = await adminApi.testEmail(testEmail.trim())
      if (res.success) {
        toast({ title: 'Test email sent!', description: `Check inbox at ${testEmail}` })
      } else {
        toast({ title: 'Failed to send', description: res.message, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Provider Status */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Email Provider</h3>
        {config.hasActiveIntegration ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  {config.provider ? config.provider.charAt(0).toUpperCase() + config.provider.slice(1) : 'Email'} connected
                </p>
                {config.lastTestedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last tested: {new Date(config.lastTestedAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">No email provider configured</p>
                <p className="text-xs text-muted-foreground">All transactional emails are currently failing silently</p>
              </div>
            </div>
            <a
              href="/integrations"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Settings className="h-3.5 w-3.5" />
              Configure in Integrations → Email Service
            </a>
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">How to set up Resend (recommended):</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Go to Integrations → Email Service tab</li>
                <li>Click "Add Integration" and select Resend</li>
                <li>Enter your Resend API key (from resend.com)</li>
                <li>Set From Address: <code className="bg-blue-100 px-1 rounded">PaperBook &lt;noreply@paperbook.app&gt;</code></li>
                <li>Click "Test Connection" to verify — then mark as Default + Active</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Send Test Email */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Send Test Email</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Sends a real email using your active integration. Use this to verify delivery.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={e => e.key === 'Enter' && handleTest()}
          />
          <button
            onClick={handleTest}
            disabled={testing || !testEmail.trim() || !config.hasActiveIntegration}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send Test
          </button>
        </div>
        {!config.hasActiveIntegration && (
          <p className="mt-2 text-xs text-orange-600">Configure an email provider first to send test emails.</p>
        )}
      </div>

      {/* Domain Info */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Domain Authentication</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          PaperBook sends emails from <code className="rounded bg-muted px-1 py-0.5 font-mono">noreply@paperbook.app</code>.
          DNS records are managed on your domain.
        </p>
        <div className="space-y-2 text-xs">
          {[
            { type: 'SPF', description: 'Authorises Resend to send on your behalf', status: 'configured' },
            { type: 'DKIM', description: 'Cryptographic signature for email authenticity', status: 'configured' },
            { type: 'DMARC', description: 'Policy for handling unauthenticated emails', status: 'configured' },
          ].map(r => (
            <div key={r.type} className="flex items-center gap-3">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
              <span className="w-14 font-mono font-medium">{r.type}</span>
              <span className="text-muted-foreground">{r.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Event Triggers Tab
// ============================================================================

function EventTriggersTab({ config }: { config: EmailConfig }) {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [localEvents, setLocalEvents] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    EMAIL_EVENTS.forEach(cat => cat.events.forEach(e => { defaults[e.key] = true }))
    return { ...defaults, ...config.events }
  })
  const [dirty, setDirty] = useState(false)

  const saveMut = useMutation({
    mutationFn: (events: Record<string, boolean>) => adminApi.updateEmailEvents(events),
    onSuccess: () => {
      setDirty(false)
      qc.invalidateQueries({ queryKey: ['admin', 'email-config'] })
      toast({ title: 'Event settings saved' })
    },
    onError: (err: any) => toast({ title: 'Failed to save', description: err.message, variant: 'destructive' }),
  })

  const toggle = (key: string) => {
    setLocalEvents(prev => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Toggle which email events are active. Disabled events are logged as "skipped".
        </p>
        {dirty && (
          <button
            onClick={() => saveMut.mutate(localEvents)}
            disabled={saveMut.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save Changes
          </button>
        )}
      </div>

      {EMAIL_EVENTS.map(cat => (
        <div key={cat.category} className="rounded-lg border bg-card">
          <div className="border-b bg-muted/30 px-5 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat.category}</h3>
          </div>
          <div className="divide-y">
            {cat.events.map(event => {
              const enabled = localEvents[event.key] !== false
              return (
                <div key={event.key} className="flex items-center gap-4 px-5 py-3.5">
                  <button
                    onClick={() => toggle(event.key)}
                    className={`shrink-0 transition-colors ${enabled ? 'text-primary' : 'text-muted-foreground/40'}`}
                    title={enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    {enabled
                      ? <ToggleRight className="h-7 w-7" />
                      : <ToggleLeft className="h-7 w-7" />
                    }
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {event.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Logs Tab
// ============================================================================

function LogsTab() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ status: '', template: '', search: '' })
  const [page, setPage] = useState(1)

  const logsQuery = useQuery({
    queryKey: ['admin', 'email-logs', filters, page],
    queryFn: () => adminApi.getEmailLogs({ ...filters, page: String(page), limit: '25' }),
  })

  const clearMut = useMutation({
    mutationFn: () => adminApi.clearOldEmailLogs(),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-logs'] })
      toast({ title: `Cleared ${data.deleted} old log entries` })
    },
    onError: (err: any) => toast({ title: 'Failed to clear logs', description: err.message, variant: 'destructive' }),
  })

  const logs: EmailLog[] = logsQuery.data?.data || []
  const pagination = logsQuery.data?.pagination

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1) }}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <select
          value={filters.template}
          onChange={e => { setFilters(p => ({ ...p, template: e.target.value })); setPage(1) }}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All templates</option>
          {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          value={filters.search}
          onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1) }}
          placeholder="Search by email or subject..."
          className="h-9 flex-1 min-w-48 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => clearMut.mutate()}
          disabled={clearMut.isPending}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 ml-auto"
        >
          {clearMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Clear old logs (90+ days)
        </button>
      </div>

      {/* Table */}
      {logsQuery.isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border bg-card">
          <List className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No email logs found</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">To</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Subject</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Template</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs">{log.to}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate text-xs" title={log.subject}>{log.subject}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{TEMPLATE_LABELS[log.template] || log.template}</td>
                  <td className="px-4 py-2.5">
                    <div className="space-y-0.5">
                      <StatusBadge status={log.status} />
                      {log.error && (
                        <p className="text-xs text-red-600 max-w-xs truncate" title={log.error}>{log.error}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pagination.total} total entries</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-40"
            >Prev</button>
            <span className="flex items-center px-2">Page {page} of {pagination.totalPages}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Page
// ============================================================================

const TABS = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'configuration', label: 'Configuration', icon: Settings },
  { key: 'triggers', label: 'Event Triggers', icon: Zap },
  { key: 'logs', label: 'Logs', icon: List },
]

export function EmailManagementPage() {
  const [tab, setTab] = useState('overview')

  const statsQuery = useQuery({
    queryKey: ['admin', 'email-stats'],
    queryFn: () => adminApi.getEmailStats(),
    refetchInterval: 60_000,
  })

  const configQuery = useQuery({
    queryKey: ['admin', 'email-config'],
    queryFn: () => adminApi.getEmailConfig(),
  })

  const stats: EmailStats = statsQuery.data?.data || {
    totalSent: 0, totalFailed: 0, todaySent: 0, successRate: 100, byTemplate: [], recentFailures: [],
  }
  const config: EmailConfig = configQuery.data?.data || {
    hasActiveIntegration: false, provider: null, fromAddress: null, lastTestedAt: null, events: {},
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Email</h1>
          <p className="text-sm text-muted-foreground">
            Monitor email delivery, configure your provider, and control which events trigger emails
          </p>
        </div>
        {!config.hasActiveIntegration && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            No email provider — all emails are failing
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.key === 'overview' && stats.totalFailed > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {stats.totalFailed > 99 ? '99+' : stats.totalFailed}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {(statsQuery.isLoading || configQuery.isLoading) && tab !== 'logs' ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {tab === 'overview' && <OverviewTab stats={stats} />}
          {tab === 'configuration' && <ConfigurationTab config={config} />}
          {tab === 'triggers' && <EventTriggersTab config={config} />}
          {tab === 'logs' && <LogsTab />}
        </>
      )}
    </div>
  )
}
