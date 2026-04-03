import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Receipt, IndianRupee, AlertCircle, TrendingUp, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { School } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CreditNotesTab } from '../components/CreditNotesTab'

const STATUS_LABELS: Record<string, string> = {
  inv_draft: 'Draft',
  inv_sent: 'Sent',
  inv_paid: 'Paid',
  inv_overdue: 'Overdue',
  inv_cancelled: 'Cancelled',
  inv_refunded: 'Refunded',
}

export function BillingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'credit-notes'>('invoices')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ schoolId: '', lineItems: [{ description: '', quantity: 1, unitPrice: 0 }], taxRate: 18, discount: 0, dueDate: '', notes: '' })
  const [invoiceError, setInvoiceError] = useState('')

  const { data: schoolsList } = useQuery({
    queryKey: ['admin', 'schools-list'],
    queryFn: () => adminApi.listSchools({}),
    enabled: showCreateInvoice,
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => adminApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] })
      setShowCreateInvoice(false)
      setInvoiceForm({ schoolId: '', lineItems: [{ description: '', quantity: 1, unitPrice: 0 }], taxRate: 18, discount: 0, dueDate: '', notes: '' })
    },
    onError: (err: any) => setInvoiceError(err.message || 'Failed to create invoice'),
  })

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin', 'billing', 'revenue'],
    queryFn: adminApi.getRevenueSummary,
  })

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['admin', 'billing', 'invoices', statusFilter],
    queryFn: () => adminApi.listInvoices(statusFilter ? { status: statusFilter } : {}),
    enabled: activeTab === 'invoices',
  })

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin', 'billing', 'payments'],
    queryFn: () => adminApi.listPayments({}),
    enabled: activeTab === 'payments',
  })

  const invoices = invoicesData?.data || []
  const payments = paymentsData?.data || []

  const formatCurrency = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toLocaleString('en-IN')}`
  }

  const METHOD_LABELS: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    upi: 'UPI',
    card: 'Card',
    cash: 'Cash',
    cheque: 'Cheque',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-sm text-muted-foreground">Invoices, payments, and revenue tracking</p>
        </div>
        <button
          onClick={() => setShowCreateInvoice(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={revenueLoading ? '...' : formatCurrency(revenue?.totalRevenue || 0)}
          icon={IndianRupee}
        />
        <StatCard
          title="Revenue This Month"
          value={revenueLoading ? '...' : formatCurrency(revenue?.revenueThisMonth || 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Outstanding"
          value={revenueLoading ? '...' : formatCurrency(revenue?.outstandingAmount || 0)}
          icon={AlertCircle}
        />
        <StatCard
          title="Collection Rate"
          value={revenueLoading ? '...' : `${revenue?.collectionRate || 0}%`}
          icon={Receipt}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Monthly Revenue (Last 12 Months)</h3>
        {revenue?.monthlyRevenue?.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Legend />
              <Bar dataKey="invoiced" name="Invoiced" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No revenue data yet</p>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('credit-notes')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'credit-notes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Credit Notes
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border bg-card px-3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="inv_draft">Draft</option>
              <option value="inv_sent">Sent</option>
              <option value="inv_paid">Paid</option>
              <option value="inv_overdue">Overdue</option>
              <option value="inv_cancelled">Cancelled</option>
            </select>
          </div>
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {invoicesLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No invoices yet</td></tr>
                ) : (
                  invoices.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-mono">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm">{inv.schoolName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status.replace('inv_', '')} />
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No payments recorded yet</td></tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-mono">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">{p.schoolName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{p.transactionRef || '-'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Credit Notes Tab */}
      {activeTab === 'credit-notes' && <CreditNotesTab />}

      {/* Create Invoice Dialog */}
      {showCreateInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateInvoice(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Invoice</h2>
            {invoiceError && <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md mb-3">{invoiceError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">School</label>
                <select value={invoiceForm.schoolId} onChange={(e) => setInvoiceForm({ ...invoiceForm, schoolId: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="">Select school...</option>
                  {(schoolsList?.data || []).map((s: School) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Line Items</label>
                {invoiceForm.lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Description" value={item.description} onChange={(e) => {
                      const items = [...invoiceForm.lineItems]; items[i] = { ...items[i], description: e.target.value }; setInvoiceForm({ ...invoiceForm, lineItems: items })
                    }} className="h-8 flex-1 rounded-lg border bg-background px-2 text-sm" />
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {
                      const items = [...invoiceForm.lineItems]; items[i] = { ...items[i], quantity: Number(e.target.value) }; setInvoiceForm({ ...invoiceForm, lineItems: items })
                    }} className="h-8 w-16 rounded-lg border bg-background px-2 text-sm" />
                    <input type="number" placeholder="Price" value={item.unitPrice || ''} onChange={(e) => {
                      const items = [...invoiceForm.lineItems]; items[i] = { ...items[i], unitPrice: Number(e.target.value) }; setInvoiceForm({ ...invoiceForm, lineItems: items })
                    }} className="h-8 w-24 rounded-lg border bg-background px-2 text-sm" />
                    {invoiceForm.lineItems.length > 1 && (
                      <button onClick={() => {
                        const items = invoiceForm.lineItems.filter((_, idx) => idx !== i); setInvoiceForm({ ...invoiceForm, lineItems: items })
                      }} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setInvoiceForm({ ...invoiceForm, lineItems: [...invoiceForm.lineItems, { description: '', quantity: 1, unitPrice: 0 }] })} className="text-xs text-primary hover:underline">
                  + Add line item
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tax Rate (%)</label>
                  <input type="number" value={invoiceForm.taxRate} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: Number(e.target.value) })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount (₹)</label>
                  <input type="number" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                  <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} placeholder="Optional notes" className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[50px]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreateInvoice(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => {
                  setInvoiceError('')
                  createInvoiceMutation.mutate({
                    schoolId: invoiceForm.schoolId,
                    lineItems: invoiceForm.lineItems.filter((li) => li.description && li.unitPrice > 0),
                    taxRate: invoiceForm.taxRate,
                    discount: invoiceForm.discount,
                    dueDate: invoiceForm.dueDate,
                    notes: invoiceForm.notes || undefined,
                  })
                }}
                disabled={createInvoiceMutation.isPending || !invoiceForm.schoolId || !invoiceForm.dueDate}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
