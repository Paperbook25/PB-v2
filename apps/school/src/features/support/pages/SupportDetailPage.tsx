import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, MessageSquare, Loader2 } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api-client'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  waiting:     'bg-purple-100 text-purple-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-600',
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

function fmtLabel(s: string) {
  return s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''
}

export function SupportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [reply, setReply] = useState('')
  const [sent, setSent] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['school', 'support-tickets', id],
    queryFn: () => apiGet<{ data: any }>(`/support-tickets/${id}`),
    enabled: !!id,
  })

  const replyMut = useMutation({
    mutationFn: (content: string) => apiPost(`/support-tickets/${id}/responses`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school', 'support-tickets', id] })
      qc.invalidateQueries({ queryKey: ['school', 'support-tickets'] })
      setReply('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const ticket = data?.data
  if (!ticket) return <div className="p-6 text-sm text-muted-foreground">Ticket not found.</div>

  const responses = ticket.responses || []

  return (
    <div className="space-y-6 p-6">
      {/* Success toast */}
      {sent && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Reply sent successfully.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/support')}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground">{ticket.subject}</h1>
          <p className="text-xs text-muted-foreground">
            Ticket #{ticket.id?.slice(-8)} · Created {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>
            {fmtLabel(ticket.status)}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}>
            {fmtLabel(ticket.priority)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Thread */}
        <div className="space-y-4 lg:col-span-2">
          {/* Original message */}
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{ticket.createdBy || 'You'}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : ''}
                </span>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap text-foreground">{ticket.description}</p>
          </div>

          {/* Responses */}
          {responses.map((r: any) => {
            const isAgent = r.authorType === 'gravity_admin'
            return (
              <div
                key={r.id}
                className={`rounded-lg border p-5 ${isAgent ? 'border-primary/20 bg-primary/5' : 'bg-card'}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isAgent ? 'bg-primary/20' : 'bg-muted'}`}>
                    <MessageSquare className={`h-4 w-4 ${isAgent ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {isAgent ? 'PaperBook Support' : (r.authorName || 'You')}
                    </span>
                    {isAgent && (
                      <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Support Agent
                      </span>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground">{r.content}</p>
              </div>
            )
          })}

          {responses.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No replies yet. Our support team will respond shortly.
            </div>
          )}

          {/* Reply form — only if ticket isn't closed */}
          {ticket.status !== 'closed' && (
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Add Reply</h3>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply…"
                rows={4}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => reply.trim() && replyMut.mutate(reply.trim())}
                  disabled={replyMut.isPending || !reply.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {replyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Ticket Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <div className="mt-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>
                    {fmtLabel(ticket.status)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Priority</span>
                <div className="mt-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}>
                    {fmtLabel(ticket.priority)}
                  </span>
                </div>
              </div>
              {ticket.category && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Category</span>
                  <p className="mt-0.5 capitalize text-foreground">{ticket.category}</p>
                </div>
              )}
              {ticket.assignee && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Assigned To</span>
                  <p className="mt-0.5 text-foreground">{ticket.assignee}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Replies</span>
                <p className="mt-0.5 text-foreground">{responses.length}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Opened</span>
                <p className="mt-0.5 text-foreground">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Need urgent help? Email us at{' '}
              <a href="mailto:support@paperbook.app" className="text-primary hover:underline">
                support@paperbook.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
