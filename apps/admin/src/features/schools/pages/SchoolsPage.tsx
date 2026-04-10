import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'
import { DataTable } from '../../../components/shared/DataTable'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { ExportButton } from '../../../components/shared/ExportButton'
import { CreateSchoolDialog } from '../components/CreateSchoolDialog'

interface School {
  id: string
  name: string
  slug: string | null
  status: string
  planTier: string
  maxUsers: number
  maxStudents: number
  addonCount?: number
  createdAt: string
  trialEndsAt?: string | null
}

function trialDaysLeft(endsAt?: string | null): number | null {
  if (!endsAt) return null
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
}

export function SchoolsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'suspend' | 'plan' | null>(null)
  const [bulkPlan, setBulkPlan] = useState('')

  const params: Record<string, string> = {}
  if (statusFilter !== 'all') params.status = statusFilter
  if (planFilter !== 'all') params.plan = planFilter

  const schoolsQuery = useQuery({
    queryKey: ['admin', 'schools', params],
    queryFn: () => adminApi.listSchools(Object.keys(params).length > 0 ? params : undefined),
  })

  const schools: School[] = schoolsQuery.data?.data || []

  const bulkSuspendMutation = useMutation({
    mutationFn: (ids: string[]) => fetch('/api/admin/schools/bulk-suspend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ schoolIds: ids })
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] })
      setSelectedSchools(new Set())
      setBulkAction(null)
    },
  })

  const bulkPlanMutation = useMutation({
    mutationFn: ({ ids, planTier }: { ids: string[]; planTier: string }) => fetch('/api/admin/schools/bulk-plan-change', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ schoolIds: ids, planTier })
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] })
      setSelectedSchools(new Set())
      setBulkAction(null)
    },
  })

  const columns: ColumnDef<School, any>[] = [
    {
      id: 'select',
      header: () => (
        <input type="checkbox" checked={selectedSchools.size === schools.length && schools.length > 0}
          onChange={(e) => { if (e.target.checked) setSelectedSchools(new Set(schools.map(s => s.id))); else setSelectedSchools(new Set()) }}
          className="rounded border-gray-300" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selectedSchools.has(row.original.id)}
          onChange={(e) => {
            const next = new Set(selectedSchools)
            if (e.target.checked) next.add(row.original.id); else next.delete(row.original.id)
            setSelectedSchools(next)
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'School Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const school = row.original
        const days = school.status === 'trial' ? trialDaysLeft(school.trialEndsAt) : null
        const chipColor = days === null ? '' : days <= 0 ? 'bg-red-100 text-red-700' : days <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
        const chipLabel = days === null ? '' : days <= 0 ? 'Expired' : `${days}d left`
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={school.status} />
            {days !== null && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${chipColor}`}>{chipLabel}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'planTier',
      header: 'Plan',
      cell: ({ row }) => (
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize text-foreground">
          {row.original.planTier || 'free'}
        </span>
      ),
    },
    {
      accessorKey: 'maxUsers',
      header: 'Max Users',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.maxUsers ?? 0}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? format(new Date(row.original.createdAt), 'MMM d, yyyy')
            : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Schools</h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered schools on the platform
          </p>
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create School
        </button>
      </div>

      {/* Content */}
      {schoolsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading schools...</span>
          </div>
        </div>
      ) : schoolsQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load schools. Please try again.
        </div>
      ) : (
        <>
        {selectedSchools.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border bg-primary/5 px-4 py-2.5">
            <span className="text-sm font-medium">{selectedSchools.size} selected</span>
            <button onClick={() => setBulkAction('suspend')} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100">Suspend Selected</button>
            <button onClick={() => setBulkAction('plan')} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">Change Plan</button>
            <button onClick={() => setSelectedSchools(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
        )}
        <DataTable
          data={schools}
          columns={columns}
          searchPlaceholder="Search schools..."
          onRowClick={(school) => navigate(`/schools/${school.id}`)}
          toolbar={
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="trial">Trial</option>
                <option value="churned">Churned</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <ExportButton endpoint="/schools/export" filename="schools.csv" />
            </>
          }
        />
        </>
      )}

      {/* Create School Dialog */}
      <CreateSchoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {bulkAction === 'suspend' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBulkAction(null)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-sm p-6 border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Suspend {selectedSchools.size} schools?</h2>
            <p className="text-sm text-muted-foreground mb-4">These schools will be suspended immediately.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkAction(null)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => bulkSuspendMutation.mutate([...selectedSchools])} disabled={bulkSuspendMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {bulkSuspendMutation.isPending ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkAction === 'plan' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBulkAction(null)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-sm p-6 border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Change Plan ({selectedSchools.size} schools)</h2>
            <select value={bulkPlan} onChange={e => setBulkPlan(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-sm mb-4">
              <option value="">Select plan...</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkAction(null)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => bulkPlanMutation.mutate({ ids: [...selectedSchools], planTier: bulkPlan })} disabled={!bulkPlan || bulkPlanMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50">
                {bulkPlanMutation.isPending ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
