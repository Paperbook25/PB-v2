import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
}

export function SchoolsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const params: Record<string, string> = {}
  if (statusFilter !== 'all') params.status = statusFilter
  if (planFilter !== 'all') params.plan = planFilter

  const schoolsQuery = useQuery({
    queryKey: ['admin', 'schools', params],
    queryFn: () => adminApi.listSchools(Object.keys(params).length > 0 ? params : undefined),
  })

  const schools: School[] = schoolsQuery.data?.data || []

  const columns: ColumnDef<School, any>[] = [
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
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
            </>
          }
        />
      )}

      {/* Create School Dialog */}
      <CreateSchoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
