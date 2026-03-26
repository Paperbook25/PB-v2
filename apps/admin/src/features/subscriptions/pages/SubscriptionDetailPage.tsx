import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, Ban, Edit2, Check } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8', starter: '#3b82f6', professional: '#8b5cf6', enterprise: '#f59e0b',
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual',
}

export function SubscriptionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ planTier: '', billingCycle: '', amount: '' })
  const [cancelReason, setCancelReason] = useState('')
  const [showCancel, setShowCancel] = useState(false)

  const { data: sub, isLoading } = useQuery({
    queryKey: ['admin', 'subscription', id],
    queryFn: () => adminApi.getSubscription(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSubscription(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', id] })
      setEditing(false)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelSubscription(id!, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscription', id] })
      setShowCancel(false)
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!sub) return <div className="text-center py-12 text-muted-foreground">Subscription not found</div>

  const startEdit = () => {
    setEditForm({ planTier: sub.planTier, billingCycle: sub.billingCycle, amount: String(sub.amount) })
    setEditing(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/subscriptions')} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{sub.school?.name || 'Subscription'}</h1>
          <p className="text-sm text-muted-foreground">{sub.school?.email} {sub.school?.city ? `— ${sub.school.city}` : ''}</p>
        </div>
        <StatusBadge status={sub.status.replace('sub_', '')} />
      </div>

      {/* Subscription Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Plan</p>
          {editing ? (
            <select value={editForm.planTier} onChange={(e) => setEditForm({ ...editForm, planTier: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="free">Free</option><option value="starter">Starter</option>
              <option value="professional">Professional</option><option value="enterprise">Enterprise</option>
            </select>
          ) : (
            <p className="text-lg font-bold capitalize" style={{ color: PLAN_COLORS[sub.planTier] }}>{sub.planTier}</p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Billing Cycle</p>
          {editing ? (
            <select value={editForm.billingCycle} onChange={(e) => setEditForm({ ...editForm, billingCycle: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
              <option value="semi_annual">Semi-Annual</option><option value="annual">Annual</option>
            </select>
          ) : (
            <p className="text-lg font-bold">{CYCLE_LABELS[sub.billingCycle] || sub.billingCycle}</p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Amount</p>
          {editing ? (
            <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
          ) : (
            <p className="text-lg font-bold">₹{sub.amount.toLocaleString('en-IN')}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <button onClick={() => updateMutation.mutate({ planTier: editForm.planTier, billingCycle: editForm.billingCycle, amount: Number(editForm.amount) })} disabled={updateMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Check className="h-4 w-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </>
        ) : (
          <>
            {sub.status !== 'sub_cancelled' && (
              <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                <Edit2 className="h-3.5 w-3.5" /> Edit Subscription
              </button>
            )}
            {sub.status !== 'sub_cancelled' && (
              <button onClick={() => setShowCancel(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                <Ban className="h-3.5 w-3.5" /> Cancel Subscription
              </button>
            )}
          </>
        )}
      </div>

      {/* Key Dates */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Key Dates</h3>
        <div className="grid gap-3 md:grid-cols-4 text-sm">
          <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{new Date(sub.createdAt).toLocaleDateString()}</span></div>
          {sub.trialEndsAt && <div><span className="text-muted-foreground">Trial Ends:</span> <span className="font-medium">{new Date(sub.trialEndsAt).toLocaleDateString()}</span></div>}
          {sub.currentPeriodEnd && <div><span className="text-muted-foreground">Period Ends:</span> <span className="font-medium">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span></div>}
          {sub.nextBillingDate && <div><span className="text-muted-foreground">Next Billing:</span> <span className="font-medium">{new Date(sub.nextBillingDate).toLocaleDateString()}</span></div>}
          {sub.cancelledAt && <div><span className="text-muted-foreground">Cancelled:</span> <span className="font-medium text-red-600">{new Date(sub.cancelledAt).toLocaleDateString()}</span></div>}
        </div>
        {sub.cancelReason && <p className="text-sm text-red-600 mt-2">Reason: {sub.cancelReason}</p>}
      </div>

      {/* Invoices */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Invoices ({sub.invoices?.length || 0})</h3></div>
        {!sub.invoices?.length ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">No invoices for this subscription</div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Invoice #</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Due Date</th>
            </tr></thead>
            <tbody>
              {sub.invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/billing/invoices/${inv.id}`)}>
                  <td className="px-4 py-3 text-sm font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status.replace('inv_', '')} /></td>
                  <td className="px-4 py-3 text-sm text-right font-medium">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Dialog */}
      {showCancel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Cancel Subscription</h2>
            <p className="text-sm text-muted-foreground mb-4">This will cancel the subscription for <strong>{sub.school?.name}</strong>.</p>
            <textarea placeholder="Reason (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[60px] mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancel(false)} className="px-4 py-2 text-sm text-muted-foreground">Keep Active</button>
              <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
