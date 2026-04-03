import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { format } from 'date-fns'
import { Plus, FileCheck, CheckCircle2, XCircle } from 'lucide-react'

const CN_STATUS_COLORS: Record<string, string> = {
  cn_draft: 'bg-gray-100 text-gray-700',
  cn_issued: 'bg-blue-100 text-blue-700',
  cn_applied: 'bg-green-100 text-green-700',
  cn_cancelled: 'bg-red-100 text-red-700',
}

const CN_STATUS_LABELS: Record<string, string> = {
  cn_draft: 'Draft',
  cn_issued: 'Issued',
  cn_applied: 'Applied',
  cn_cancelled: 'Cancelled',
}

export function CreditNotesTab() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({
    schoolId: '',
    amount: '',
    reason: '',
    invoiceId: '',
  })

  const { data: creditNotesData, isLoading } = useQuery({
    queryKey: ['admin', 'credit-notes'],
    queryFn: () => adminApi.listCreditNotes({}),
  })

  const creditNotes = creditNotesData?.data || []

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCreditNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-notes'] })
      setShowCreate(false)
      setForm({ schoolId: '', amount: '', reason: '', invoiceId: '' })
      setCreateError('')
    },
    onError: (err: any) => setCreateError(err.message || 'Failed to create credit note'),
  })

  const issueMutation = useMutation({
    mutationFn: (id: string) => adminApi.issueCreditNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'credit-notes'] }),
  })

  const applyMutation = useMutation({
    mutationFn: (id: string) => adminApi.applyCreditNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'credit-notes'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.cancelCreditNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'credit-notes'] }),
  })

  const handleCreate = () => {
    setCreateError('')
    const payload: any = {
      schoolId: form.schoolId,
      amount: Number(form.amount),
      reason: form.reason,
    }
    if (form.invoiceId.trim()) {
      payload.invoiceId = form.invoiceId.trim()
    }
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {creditNotes.length} credit note{creditNotes.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Create Credit Note
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Credit Note ID</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : creditNotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No credit notes yet
                </td>
              </tr>
            ) : (
              creditNotes.map((cn: any) => (
                <tr key={cn.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-mono">
                    {cn.id.substring(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-sm">{cn.schoolName || cn.schoolId}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ₹{Number(cn.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                    {cn.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        CN_STATUS_COLORS[cn.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {CN_STATUS_LABELS[cn.status] || cn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cn.invoiceId ? (
                      <a
                        href={`/billing/invoices/${cn.invoiceId}`}
                        className="text-primary hover:underline font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cn.invoiceNumber || cn.invoiceId.substring(0, 8)}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {cn.createdAt ? format(new Date(cn.createdAt), 'dd MMM yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {cn.status === 'cn_draft' && (
                        <button
                          onClick={() => issueMutation.mutate(cn.id)}
                          disabled={issueMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                          title="Issue credit note"
                        >
                          <FileCheck className="h-3 w-3" /> Issue
                        </button>
                      )}
                      {cn.status === 'cn_issued' && (
                        <button
                          onClick={() => applyMutation.mutate(cn.id)}
                          disabled={applyMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          title="Apply credit note"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Apply
                        </button>
                      )}
                      {cn.status !== 'cn_cancelled' && (
                        <button
                          onClick={() => cancelMutation.mutate(cn.id)}
                          disabled={cancelMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          title="Cancel credit note"
                        >
                          <XCircle className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Credit Note Dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Create Credit Note</h2>
            {createError && (
              <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">
                {createError}
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
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Reason
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Reason for credit note"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Invoice ID (optional)
                </label>
                <input
                  type="text"
                  value={form.invoiceId}
                  onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
                  placeholder="Link to an existing invoice"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  createMutation.isPending || !form.schoolId || !form.amount || !form.reason
                }
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Credit Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
