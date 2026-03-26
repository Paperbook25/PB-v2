import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Ban, IndianRupee, Plus } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatusBadge } from '@/components/shared/StatusBadge'

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer', upi: 'UPI', card: 'Card', cash: 'Cash', cheque: 'Cheque', other: 'Other',
}

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPayment, setShowPayment] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'bank_transfer', transactionRef: '', notes: '' })
  const [payError, setPayError] = useState('')

  const { data: inv, isLoading } = useQuery({
    queryKey: ['admin', 'invoice', id],
    queryFn: () => adminApi.getInvoice(id!),
    enabled: !!id,
  })

  const sendMutation = useMutation({
    mutationFn: () => adminApi.sendInvoice(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] }),
  })

  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelInvoice(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] }),
  })

  const payMutation = useMutation({
    mutationFn: (data: any) => adminApi.recordPayment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] })
      setShowPayment(false)
      setPayForm({ amount: '', paymentMethod: 'bank_transfer', transactionRef: '', notes: '' })
    },
    onError: (err: any) => setPayError(err.message || 'Failed to record payment'),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!inv) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>

  const paidTotal = inv.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0
  const remaining = inv.totalAmount - paidTotal

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/billing')} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-mono">{inv.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">{inv.school?.name} {inv.school?.city ? `— ${inv.school.city}` : ''}</p>
        </div>
        <StatusBadge status={inv.status.replace('inv_', '')} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold mt-1">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-xl font-bold text-green-600 mt-1">₹{paidTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`text-xl font-bold mt-1 ${remaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>₹{remaining.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Due Date</p>
          <p className="text-xl font-bold mt-1">{new Date(inv.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {inv.status === 'inv_draft' && (
          <button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Send className="h-3.5 w-3.5" /> {sendMutation.isPending ? 'Sending...' : 'Mark as Sent'}
          </button>
        )}
        {inv.status !== 'inv_paid' && inv.status !== 'inv_cancelled' && (
          <button onClick={() => { setPayForm({ ...payForm, amount: String(remaining) }); setShowPayment(true) }} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50">
            <IndianRupee className="h-3.5 w-3.5" /> Record Payment
          </button>
        )}
        {inv.status !== 'inv_paid' && inv.status !== 'inv_cancelled' && (
          <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
            <Ban className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
      </div>

      {/* Invoice Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Invoice Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{inv.subtotal.toLocaleString('en-IN')}</span></div>
            {inv.taxAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax ({inv.taxRate}%)</span><span>₹{inv.taxAmount.toLocaleString('en-IN')}</span></div>}
            {inv.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-₹{inv.discount.toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>₹{inv.totalAmount.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Billing Period</h3>
          <div className="space-y-2 text-sm">
            {inv.billingPeriodStart && <div className="flex justify-between"><span className="text-muted-foreground">From</span><span>{new Date(inv.billingPeriodStart).toLocaleDateString()}</span></div>}
            {inv.billingPeriodEnd && <div className="flex justify-between"><span className="text-muted-foreground">To</span><span>{new Date(inv.billingPeriodEnd).toLocaleDateString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(inv.createdAt).toLocaleDateString()}</span></div>
            {inv.paidAt && <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-green-600">{new Date(inv.paidAt).toLocaleDateString()}</span></div>}
          </div>
          {inv.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{inv.notes}</p>}
        </div>
      </div>

      {/* Line Items */}
      {inv.lineItems?.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Line Items</h3></div>
          <table className="w-full">
            <thead><tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th><th className="px-4 py-3 text-right">Amount</th>
            </tr></thead>
            <tbody>
              {inv.lineItems.map((item: any, i: number) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Payments ({inv.payments?.length || 0})</h3></div>
        {!inv.payments?.length ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">No payments recorded</div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Method</th><th className="px-4 py-3">Reference</th>
            </tr></thead>
            <tbody>
              {inv.payments.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">{new Date(p.paidAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.transactionRef || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Payment Dialog */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
            {payError && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{payError}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
                <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option>
                  <option value="card">Card</option><option value="cash">Cash</option>
                  <option value="cheque">Cheque</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Transaction Reference</label>
                <input value={payForm.transactionRef} onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })} placeholder="Transaction ID / UTR" className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Optional notes" className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[50px]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPayment(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => { setPayError(''); payMutation.mutate({ amount: Number(payForm.amount), paymentMethod: payForm.paymentMethod, transactionRef: payForm.transactionRef || undefined, notes: payForm.notes || undefined }) }} disabled={payMutation.isPending || !payForm.amount} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                {payMutation.isPending ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
