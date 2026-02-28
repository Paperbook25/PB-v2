import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApplications, useUpdateStatus, useApplicationStats } from '../hooks/useAdmissions'
import type { ApplicationStatus } from '../types/admission.types'
import { APPLICATION_STATUSES, CLASSES } from '../types/admission.types'
import { AdmissionPipeline } from '../components/AdmissionPipeline'
import { StatusChangeDialog } from '../components/StatusChangeDialog'

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PipelineLoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[300px]">
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-3 bg-muted/50 rounded-lg p-3 min-h-[400px]">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdmissionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'pipeline' | 'list'>('pipeline')

  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<ApplicationStatus>('applied')

  const { data: applicationsData, isLoading: isLoadingApps } = useApplications({
    search: search || undefined,
    class: classFilter || undefined,
    limit: 100, // Load more for pipeline view
  })

  const { data: statsData, isLoading: isLoadingStats } = useApplicationStats()

  const updateStatus = useUpdateStatus()

  const applications = applicationsData?.data || []
  const stats = statsData?.data

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find((a) => a.id === applicationId)
    if (app) {
      setSelectedApplicationId(applicationId)
      setSelectedCurrentStatus(app.status)
      setStatusDialogOpen(true)
    }
  }

  const handleConfirmStatusChange = (newStatus: ApplicationStatus, note?: string) => {
    if (selectedApplicationId) {
      updateStatus.mutate(
        { id: selectedApplicationId, data: { status: newStatus, note } },
        {
          onSuccess: () => {
            setStatusDialogOpen(false)
            setSelectedApplicationId(null)
          },
        }
      )
    }
  }

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      app.studentName.toLowerCase().includes(searchLower) ||
      app.applicationNumber.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      <PageHeader
        title="Admissions"
        description="Manage student admissions and applications"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Admissions' }]}
        actions={
          <Button size="sm" onClick={() => navigate('/admissions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        }
      />

      {/* Stats */}
      {isLoadingStats ? (
        <StatsLoadingSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{stats?.byStatus?.applied || 0}</p>
              <p className="text-xs text-muted-foreground">New Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.under_review || 0}</p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{stats?.byStatus?.approved || 0}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">{stats?.byStatus?.enrolled || 0}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pipeline' | 'list')} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            <TabsTrigger value="list" onClick={() => navigate('/admissions')}>
              List View
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={classFilter || 'all'} onValueChange={(v) => setClassFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pipeline">
          {isLoadingApps ? (
            <PipelineLoadingSkeleton />
          ) : (
            <AdmissionPipeline applications={filteredApplications} onStatusChange={handleStatusChange} />
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground">
                Switch to the{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/admissions')}>
                  full list view
                </Button>{' '}
                for table view with pagination.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={selectedCurrentStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
