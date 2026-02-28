import { useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, Upload, MoreHorizontal, Eye, Pencil, Trash2, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ErrorBoundary'
import { BulkImportDialog } from '../components/BulkImportDialog'
import { ExportDialog } from '../components/ExportDialog'
import { PromotionDialog } from '../components/PromotionDialog'
import { useStudents, useDeleteStudent } from '../hooks/useStudents'
import { useToast } from '@/hooks/use-toast'
import { getInitials, formatDate } from '@/lib/utils'

const CLASSES = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] as const
const SECTIONS = ['All Sections', 'A', 'B', 'C', 'D'] as const
const STATUSES = ['All Status', 'active', 'inactive', 'graduated', 'transferred'] as const

// Memoized table row component to prevent unnecessary re-renders
const StudentRow = memo(function StudentRow({
  student,
  onNavigate,
  onDelete,
  getStatusBadge,
}: {
  student: any
  onNavigate: (id: string) => void
  onDelete: (id: string) => void
  getStatusBadge: (status: string) => React.ReactNode
}) {
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onNavigate(student.id)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={student.photoUrl} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{student.admissionNumber}</TableCell>
      <TableCell>
        {student.class} - {student.section}
      </TableCell>
      <TableCell>
        <p className="text-sm">{student.parent.fatherName}</p>
        <p className="text-xs text-muted-foreground">{student.parent.guardianPhone}</p>
      </TableCell>
      <TableCell>{getStatusBadge(student.status)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onNavigate(student.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate(`${student.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(student.id)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
})

export function StudentsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All Classes')
  const [sectionFilter, setSectionFilter] = useState('All Sections')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [page, setPage] = useState(1)
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [promotionOpen, setPromotionOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const limit = 10

  const deleteMutation = useDeleteStudent()

  const { data, isLoading, error, refetch } = useStudents({
    search: search || undefined,
    class: classFilter !== 'All Classes' ? classFilter : undefined,
    section: sectionFilter !== 'All Sections' ? sectionFilter : undefined,
    status: statusFilter !== 'All Status' ? statusFilter : undefined,
    page,
    limit,
  })

  const students = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const studentToDelete = students.find((s: any) => s.id === deleteId)

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleClassChange = useCallback((v: string) => {
    setClassFilter(v)
    setPage(1)
  }, [])

  const handleSectionChange = useCallback((v: string) => {
    setSectionFilter(v)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((v: string) => {
    setStatusFilter(v)
    setPage(1)
  }, [])

  const handleNavigate = useCallback((path: string) => {
    navigate(`/students/${path}`)
  }, [navigate])

  const handleSetDeleteId = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Student Deleted',
        description: 'The student has been removed successfully.',
      })
      setDeleteId(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'graduated':
        return <Badge variant="default">Graduated</Badge>
      case 'transferred':
        return <Badge variant="outline">Transferred</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Students"
        description={`Manage all ${meta.total} students in your institution`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Students' }]}
        moduleColor="students"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPromotionOpen(true)}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Promote
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/students/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, or email..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={classFilter}
                onValueChange={handleClassChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sectionFilter}
                onValueChange={handleSectionChange}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === 'All Status' ? s : s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {error ? (
            <ErrorCard
              title="Failed to load students"
              message="An error occurred while loading the student list. Please try again."
              onRetry={() => refetch()}
            />
          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student: any) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onNavigate={handleNavigate}
                      onDelete={handleSetDeleteId}
                      getStatusBadge={getStatusBadge}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          )}

          {/* Pagination */}
          {!error && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} students
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BulkImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <PromotionDialog open={promotionOpen} onOpenChange={setPromotionOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone
              and will remove all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
