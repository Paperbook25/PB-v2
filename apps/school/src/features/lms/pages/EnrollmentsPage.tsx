import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search } from 'lucide-react'
import { useEnrollments, useCreateEnrollment } from '../hooks/useLms'
import { EnrollmentManager } from '../components/EnrollmentManager'
import { ProgressTracker } from '../components/ProgressTracker'
import { ENROLLMENT_STATUS_LABELS } from '../types/lms.types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { EnrollmentStatus } from '../types/lms.types'

const statusBadgeVariant: Record<EnrollmentStatus, 'success' | 'default' | 'secondary'> = {
  active: 'success',
  completed: 'default',
  dropped: 'secondary',
}

export function EnrollmentsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EnrollmentStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const limit = 10

  const { data, isLoading } = useEnrollments({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    page,
    limit,
  })

  const createEnrollment = useCreateEnrollment()

  const enrollments = data?.data ?? []
  const meta = data?.meta ?? { total: 0, page: 1, limit, totalPages: 1 }

  const handleEnroll = async (formData: { courseId: string; studentId: string }) => {
    try {
      await createEnrollment.mutateAsync(formData)
      toast({
        title: 'Student Enrolled',
        description: 'Student has been enrolled successfully.',
      })
      setDialogOpen(false)
    } catch {
      toast({
        title: 'Enrollment Failed',
        description: 'Failed to enroll student. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Enrollments' },
        ]}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as typeof status)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead className="w-[180px]">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lessons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                  <TableCell>{enrollment.courseName}</TableCell>
                  <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
                  <TableCell>
                    <ProgressTracker progress={enrollment.progress} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[enrollment.status]}>
                      {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {enrollment.lessonsCompleted}/{enrollment.totalLessons}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of{' '}
            {meta.total} enrollments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Enroll Dialog */}
      <EnrollmentManager
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleEnroll}
        isLoading={createEnrollment.isPending}
      />
    </div>
  )
}
