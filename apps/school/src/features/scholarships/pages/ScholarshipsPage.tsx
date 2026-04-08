import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Award, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { AddonGate } from '@/components/AddonGate'
import { fetchScholarships, fetchScholarshipStats, createScholarship } from '../api/scholarships.api'
import { SCHOLARSHIP_TYPE_LABELS } from '../types/scholarships.types'
import type { Scholarship } from '../types/scholarships.types'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  suspended: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
}

export function ScholarshipsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'merit' as const,
    description: '',
    amount: '',
    amountType: 'fixed' as 'fixed' | 'percentage',
    applicationDeadline: '',
  })

  const statsQ = useQuery({ queryKey: ['scholarships', 'stats'], queryFn: fetchScholarshipStats })
  const scholarshipsQ = useQuery({
    queryKey: ['scholarships', 'list', search],
    queryFn: () => fetchScholarships({ search: search || undefined }),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => createScholarship({ ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      setShowDialog(false)
      setForm({ name: '', code: '', type: 'merit', description: '', amount: '', amountType: 'fixed', applicationDeadline: '' })
    },
  })

  const stats = statsQ.data?.data
  const scholarships: Scholarship[] = scholarshipsQ.data?.data || []

  return (
    <AddonGate slug="scholarships">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Scholarships</h1>
            <p className="text-sm text-muted-foreground">Manage school scholarships and financial aid programs</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Scholarship
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Scholarships', value: stats.totalScholarships },
              { label: 'Active', value: stats.activeScholarships },
              { label: 'Beneficiaries', value: stats.totalBeneficiaries },
              { label: 'Total Disbursed', value: stats.totalDisbursed ? `₹${Number(stats.totalDisbursed).toLocaleString('en-IN')}` : '₹0' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scholarships..."
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {scholarshipsQ.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : scholarshipsQ.isError ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> Failed to load scholarships
            </div>
          ) : scholarships.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Award className="h-10 w-10 opacity-30" />
              <p className="text-sm">No scholarships yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deadline</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.code}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {SCHOLARSHIP_TYPE_LABELS[s.type as keyof typeof SCHOLARSHIP_TYPE_LABELS] || s.type}
                      </td>
                      <td className="px-4 py-3">
                        {s.amountType === 'percentage'
                          ? `${s.amount}%`
                          : `₹${Number(s.amount).toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {(s as any).applicationDeadline
                          ? new Date((s as any).applicationDeadline).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[s.status] || 'bg-muted text-muted-foreground'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Scholarship</h2>
            <div className="space-y-3">
              <input placeholder="Scholarship name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <input placeholder="Code (e.g. SCH-MERIT-01) *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                {Object.entries(SCHOLARSHIP_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Amount *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                <select value={form.amountType} onChange={(e) => setForm({ ...form, amountType: e.target.value as any })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <input type="date" placeholder="Application deadline" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => { if (!form.name.trim() || !form.code.trim() || !form.amount) return; createMut.mutate(form) }}
                disabled={!form.name.trim() || !form.code.trim() || !form.amount || createMut.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {createMut.isPending ? 'Creating...' : 'Create Scholarship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AddonGate>
  )
}
