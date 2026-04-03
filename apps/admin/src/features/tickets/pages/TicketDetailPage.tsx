import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Lock, MessageSquare } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { format } from 'date-fns'

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  waiting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  closed: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600 dark:text-gray-400' },
}

const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editPriority, setEditPriority] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const [sidebarInitialized, setSidebarInitialized] = useState(false)

  const [replyContent, setReplyContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: () => adminApi.getTicket(id!),
    enabled: !!id,
  })

  // Initialize sidebar form values when ticket loads
  if (ticket && !sidebarInitialized) {
    setEditPriority(ticket.priority || 'medium')
    setEditStatus(ticket.status || 'open')
    setEditAssignee(ticket.assignee || '')
    setSidebarInitialized(true)
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateTicket(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      setSuccessMessage('Ticket updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const replyMutation = useMutation({
    mutationFn: (data: any) => adminApi.addTicketResponse(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', id] })
      setReplyContent('')
      setIsInternal(false)
      setSuccessMessage('Reply sent successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!ticket) return <div className="text-center py-12 text-muted-foreground">Ticket not found</div>

  const pColor = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium
  const sColor = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
  const responses = ticket.responses || []

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tickets')} className="rounded-lg p-2 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            #{ticket.id?.slice(-8)} &middot; Created {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : ''}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sColor.bg} ${sColor.text}`}>
          {formatLabel(ticket.status)}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pColor.bg} ${pColor.text}`}>
          {formatLabel(ticket.priority)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Conversation Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Original description */}
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium">{ticket.createdBy || 'Reporter'}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : ''}
                </span>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Responses */}
          {responses.map((response: any) => {
            const isNote = response.isInternal || response.type === 'internal'
            return (
              <div
                key={response.id}
                className={`rounded-lg border p-5 ${
                  isNote
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isNote ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-primary/10'
                  }`}>
                    {isNote ? (
                      <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{response.authorName || response.author || 'Agent'}</span>
                    {isNote && (
                      <span className="ml-2 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">
                        Internal Note
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">
                      {response.createdAt ? format(new Date(response.createdAt), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{response.content}</p>
              </div>
            )
          })}

          {responses.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No responses yet. Be the first to reply.
            </div>
          )}

          {/* Reply Form */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Add Reply</h3>
            <textarea
              placeholder="Write your response..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border"
                />
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Internal Note</span>
              </label>
              <button
                onClick={() => replyMutation.mutate({ content: replyContent, isInternal })}
                disabled={replyMutation.isPending || !replyContent.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Ticket Info */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Ticket Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">School</label>
                <p className="text-sm mt-0.5">{ticket.schoolName || ticket.schoolId || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <p className="text-sm mt-0.5">{ticket.category || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Assignee</label>
                <input
                  type="text"
                  placeholder="Assign to..."
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
              <button
                onClick={() => updateMutation.mutate({ priority: editPriority, status: editStatus, assignee: editAssignee })}
                disabled={updateMutation.isPending}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Ticket'}
              </button>
            </div>
          </div>

          {/* Metadata card */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : '-'}</span>
              </div>
              {ticket.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{format(new Date(ticket.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responses</span>
                <span>{responses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
