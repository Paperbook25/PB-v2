import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpCircle,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Heart,
  IdCard,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useStudents, useDeleteStudent } from '@/features/students/hooks/useStudents'
import { BulkImportDialog } from '@/features/students/components/BulkImportDialog'
import { ExportDialog } from '@/features/students/components/ExportDialog'
import { PromotionDialog } from '@/features/students/components/PromotionDialog'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'
import type { StudentsTabProps, StudentSubTab } from '../types/people.types'

const CLASSES = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['All Sections', 'A', 'B', 'C', 'D']
const STATUSES = ['All Status', 'active', 'inactive', 'graduated', 'transferred']

// ============================================
// Dashboard Tab Content
// ============================================
function StudentsDashboardContent() {
  const { data, isLoading } = useStudents({ limit: 5 })
  const students = data?.data || []
  const total = data?.meta?.total || 0
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canManageStudents = hasRole(['admin', 'principal'])

  // Mock stats - in real app would come from API
  const stats = {
    total: total,
    active: Math.floor(total * 0.92),
    newAdmissions: Math.floor(total * 0.05),
    pendingDocuments: Math.floor(total * 0.08),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '-' : stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '-' : stats.active}</p>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '-' : stats.newAdmissions}</p>
              <p className="text-xs text-muted-foreground">New This Year</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '-' : stats.pendingDocuments}</p>
              <p className="text-xs text-muted-foreground">Pending Documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {canManageStudents && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/students/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm" variant="outline">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Promote Students
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently Added Students</CardTitle>
          <CardDescription>Latest student enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No students found</p>
          ) : (
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.photoUrl} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.class} - {student.section} | {student.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Students List Tab Content
// ============================================
function StudentsListContent() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasRole } = useAuthStore()
  const canManageStudents = hasRole(['admin', 'principal'])
  const canEditStudents = hasRole(['admin', 'principal', 'teacher'])
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

  const { data, isLoading } = useStudents({
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

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Student Deleted',
        description: 'The student has been removed successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete student. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
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
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} student{meta.total !== 1 ? 's' : ''}
        </p>
        {canManageStudents && (
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
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={classFilter}
                onValueChange={(v) => {
                  setClassFilter(v)
                  setPage(1)
                }}
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
                onValueChange={(v) => {
                  setSectionFilter(v)
                  setPage(1)
                }}
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
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
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
                    <TableRow
                      key={student.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
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
                            <DropdownMenuItem onClick={() => navigate(`/students/${student.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canEditStudents && (
                              <DropdownMenuItem onClick={() => navigate(`/students/${student.id}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canManageStudents && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteId(student.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
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

// ============================================
// Documents Tab Content (Bulk view)
// ============================================
function DocumentsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bulk Document Management</CardTitle>
        <CardDescription>View and manage documents across all students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Document management view</p>
          <p className="text-sm mt-2">View pending verifications, missing documents, and bulk operations.</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Health Records Tab Content (Overview)
// ============================================
function HealthRecordsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Records Overview</CardTitle>
        <CardDescription>View health information across all students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Health records overview</p>
          <p className="text-sm mt-2">Track allergies, medical conditions, and emergency contacts.</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Promotions Tab Content
// ============================================
function PromotionsContent() {
  const [promotionOpen, setPromotionOpen] = useState(false)
  const { hasRole } = useAuthStore()
  const canManageStudents = hasRole(['admin', 'principal'])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Promotion Workflow</CardTitle>
          <CardDescription>Promote students to the next academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">Promote students from one class to the next</p>
            {canManageStudents ? (
              <Button onClick={() => setPromotionOpen(true)}>
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Start Promotion
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact an administrator to perform student promotions.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <PromotionDialog open={promotionOpen} onOpenChange={setPromotionOpen} />
    </div>
  )
}

// ============================================
// ID Cards Tab Content
// ============================================
function IDCardsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bulk ID Card Generation</CardTitle>
        <CardDescription>Generate and print ID cards for students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <IdCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ID Card generation</p>
          <p className="text-sm mt-2">Select students or classes to generate ID cards in bulk.</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main StudentsTab Component
// ============================================
export function StudentsTab({ subTab, onSubTabChange }: StudentsTabProps) {
  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as StudentSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="dashboard" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="list" className="gap-2">
            <Users className="h-4 w-4" />
            All Students
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="health" className="gap-2">
            <Heart className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="promotions" className="gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="idcards" className="gap-2">
            <IdCard className="h-4 w-4" />
            ID Cards
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="dashboard" className="mt-0">
            <StudentsDashboardContent />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <StudentsListContent />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentsContent />
          </TabsContent>

          <TabsContent value="health" className="mt-0">
            <HealthRecordsContent />
          </TabsContent>

          <TabsContent value="promotions" className="mt-0">
            <PromotionsContent />
          </TabsContent>

          <TabsContent value="idcards" className="mt-0">
            <IDCardsContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
