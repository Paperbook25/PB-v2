import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { format } from 'date-fns'
import { Plus, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  phone: 'Phone',
  meeting: 'Meeting',
  in_app: 'In-App',
}

const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-purple-100 text-purple-700',
  sms: 'bg-yellow-100 text-yellow-700',
  phone: 'bg-orange-100 text-orange-700',
  meeting: 'bg-indigo-100 text-indigo-700',
  in_app: 'bg-cyan-100 text-cyan-700',
}

const DIRECTION_COLORS: Record<string, string> = {
  inbound: 'bg-blue-100 text-blue-700',
  outbound: 'bg-green-100 text-green-700',
}

export function CommunicationLogPage() {
  const queryClient = useQueryClient()
  const [channelFilter, setChannelFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [logError, setLogError] = useState('')
  const [form, setForm] = useState({
    schoolId: '',
    channel: 'email',
    direction: 'outbound',
    subject: '',
    content: '',
  })

  const queryParams: Record<string, string> = {}
  if (channelFilter) queryParams.channel = channelFilter
  if (directionFilter) queryParams.direction = directionFilter

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin', 'communication-logs', channelFilter, directionFilter],
    queryFn: () => adminApi.listCommunicationLogs(queryParams),
  })

  const logs = logsData?.data || []

  const logMutation = useMutation({
    mutationFn: (data: any) => adminApi.logCommunication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communication-logs'] })
      setShowLogDialog(false)
      setForm({ schoolId: '', channel: 'email', direction: 'outbound', subject: '', content: '' })
      setLogError('')
    },
    onError: (err: any) => setLogError(err.message || 'Failed to log communication'),
  })

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = () => {
    setLogError('')
    logMutation.mutate({
      schoolId: form.schoolId,
      channel: form.channel,
      direction: form.direction,
      subject: form.subject,
      content: form.content,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication Log</h1>
          <p className="text-sm text-muted-foreground">
            Track all communications with schools
          </p>
        </div>
        <button
          onClick={() => setShowLogDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Log Communication
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="h-9 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="phone">Phone</option>
          <option value="meeting">Meeting</option>
          <option value="in_app">In-App</option>
        </select>
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          className="h-9 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All Directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Sent By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                    <span>No communication logs found</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log: any) => {
                const isExpanded = expandedRows.has(log.id)
                return (
                  <tr key={log.id} className="group">
                    <td colSpan={7} className="p-0">
                      <div
                        className="flex items-center border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRow(log.id)}
                      >
                        <div className="px-4 py-3 w-8">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          {log.createdAt
                            ? format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')
                            : '-'}
                        </div>
                        <div className="px-4 py-3 text-sm">
                          {log.schoolName || log.schoolId}
                        </div>
                        <div className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              CHANNEL_COLORS[log.channel] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {CHANNEL_LABELS[log.channel] || log.channel}
                          </span>
                        </div>
                        <div className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              DIRECTION_COLORS[log.direction] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {log.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                          </span>
                        </div>
                        <div className="px-4 py-3 text-sm">{log.subject}</div>
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          {log.sentByName || log.sentBy || '-'}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-12 py-4 bg-muted/30 border-b">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {log.content || 'No content available.'}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Log Communication Dialog */}
      {showLogDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowLogDialog(false)}
        >
          <div
            className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Log Communication</h2>
            {logError && (
              <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">
                {logError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  School ID
                </label>
                <input
                  type="text"
                  value={form.schoolId}
                  onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                  placeholder="Enter school ID"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Channel
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="phone">Phone</option>
                    <option value="meeting">Meeting</option>
                    <option value="in_app">In-App</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Direction
                  </label>
                  <select
                    value={form.direction}
                    onChange={(e) => setForm({ ...form, direction: e.target.value })}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Communication subject"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Communication content or notes"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowLogDialog(false)}
                className="px-4 py-2 text-sm text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  logMutation.isPending || !form.schoolId || !form.subject || !form.content
                }
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {logMutation.isPending ? 'Logging...' : 'Log Communication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
