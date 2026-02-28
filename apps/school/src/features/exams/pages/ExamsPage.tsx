import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Plus, FileSpreadsheet, ClipboardList, Settings, Download, Eye, CheckCircle2, Clock, Monitor } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { ExamList } from '../components/ExamList'
import { GradeScaleEditor } from '../components/GradeScaleEditor'
import { OnlineExamCard } from '../components/OnlineExamCard'
import {
  useExams,
  useDeleteExam,
  usePublishExamResults,
  useGradeScales,
  useCreateGradeScale,
  useUpdateGradeScale,
  useDeleteGradeScale,
} from '../hooks/useExams'
import { useOnlineExams } from '@/features/lms/hooks/useQuestionBank'
import { EXAM_TYPES, EXAM_TYPE_LABELS, ACADEMIC_YEARS, EXAM_STATUS_LABELS } from '../types/exams.types'
import type { ExamFilters, ExamStatus, ExamType } from '../types/exams.types'
import { cn, formatDate } from '@/lib/utils'

type TabValue = 'list' | 'online' | 'marks' | 'reports' | 'grades'

export function ExamsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const { hasRole } = useAuthStore()
  const canManageExams = hasRole(['admin', 'principal', 'teacher'])

  const activeTab = (searchParams.get('tab') as TabValue) || 'list'

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ExamType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'all'>('all')
  const [yearFilter, setYearFilter] = useState<string>('2024-25')
  const [page, setPage] = useState(1)

  const filters: ExamFilters = {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    academicYear: yearFilter || undefined,
    page,
    limit: 10,
  }

  // Queries
  const { data: examsData, isLoading: examsLoading } = useExams(filters)
  const { data: gradeScalesData, isLoading: gradeScalesLoading } = useGradeScales()

  // Fetch exams needing marks entry (completed but not published)
  const { data: marksEntryExams } = useExams({ status: 'completed', limit: 20 })

  // Fetch exams with published results for report cards
  const { data: publishedExams } = useExams({ status: 'results_published', limit: 20 })

  // Fetch online exams
  const { data: onlineExamsData, isLoading: onlineExamsLoading } = useOnlineExams({ limit: 20 })

  // Mutations
  const deleteExam = useDeleteExam()
  const publishResults = usePublishExamResults()
  const createGradeScale = useCreateGradeScale()
  const updateGradeScale = useUpdateGradeScale()
  const deleteGradeScale = useDeleteGradeScale()

  const exams = examsData?.data || []
  const gradeScales = gradeScalesData?.data || []
  const meta = examsData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam.mutateAsync(id)
      toast({
        title: 'Exam Deleted',
        description: 'The exam has been deleted successfully.',
      })
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the exam.',
        variant: 'destructive',
      })
    }
  }

  const handlePublishResults = async (id: string) => {
    try {
      await publishResults.mutateAsync(id)
      toast({
        title: 'Results Published',
        description: 'The exam results have been published successfully.',
      })
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: 'Failed to publish the results.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Exams"
        description={`Manage exams, marks, and report cards`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Exams' }]}
        moduleColor="exams"
        actions={
          canManageExams ? (
            <Button onClick={() => navigate('/exams/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 hidden sm:block" />
            All Exams
          </TabsTrigger>
          <TabsTrigger value="online" className="flex items-center gap-2">
            <Monitor className="h-4 w-4 hidden sm:block" />
            Online Exams
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 hidden sm:block" />
            Marks Entry
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            Report Cards
          </TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <Settings className="h-4 w-4 hidden sm:block" />
            Grades
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="list" className="mt-0 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search exams..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-[250px]"
              />
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v as ExamType | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {EXAM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {EXAM_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as ExamStatus | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(['scheduled', 'ongoing', 'completed', 'results_published'] as const).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {EXAM_STATUS_LABELS[status]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam List */}
            {examsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ExamList
                exams={exams}
                onDelete={handleDeleteExam}
                onPublish={handlePublishResults}
                isDeleting={deleteExam.isPending}
                isPublishing={publishResults.isPending}
                canManageExams={canManageExams}
              />
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * meta.limit + 1} to {Math.min(page * meta.limit, meta.total)}{' '}
                  of {meta.total} exams
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
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
          </TabsContent>

          <TabsContent value="online" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {onlineExamsData?.meta.total || 0} online exam(s)
                </p>
                <Button onClick={() => navigate('/lms/question-bank')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Online Exam
                </Button>
              </div>

              {onlineExamsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : (onlineExamsData?.data || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Online Exams</h3>
                  <p className="mb-4">Create online exams for students to take remotely</p>
                  <Button variant="outline" onClick={() => navigate('/lms/question-bank')}>
                    Go to Question Bank
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(onlineExamsData?.data || []).map((exam) => (
                    <OnlineExamCard
                      key={exam.id}
                      exam={exam}
                      onTakeExam={(id) => navigate(`/lms/online-exam/${id}`)}
                      onEdit={(e) => navigate(`/lms/online-exam/${e.id}/edit`)}
                      onViewResults={(id) => navigate(`/lms/online-exam/${id}/results`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="marks" className="mt-0">
            {examsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (marksEntryExams?.data || []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                <p className="mb-4">No exams are pending marks entry</p>
                <Button variant="outline" onClick={() => handleTabChange('list')}>
                  View All Exams
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {(marksEntryExams?.data || []).length} exam(s) ready for marks entry
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(marksEntryExams?.data || []).map((exam) => (
                    <Card key={exam.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{exam.name}</CardTitle>
                            <CardDescription>{EXAM_TYPE_LABELS[exam.type]}</CardDescription>
                          </div>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <p>Classes: {exam.applicableClasses?.join(', ') || 'All'}</p>
                            <p>Subjects: {exam.subjects?.length || 0} subjects</p>
                            <p>Ended: {formatDate(exam.endDate)}</p>
                          </div>
                          <Button asChild className="w-full" size="sm">
                            <Link to={`/exams/${exam.id}/marks`}>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Enter Marks
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            {examsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (publishedExams?.data || []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Published Results</h3>
                <p className="mb-4">No exams with published results available for report cards</p>
                <Button variant="outline" onClick={() => handleTabChange('list')}>
                  View All Exams
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {(publishedExams?.data || []).length} exam(s) with published results
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(publishedExams?.data || []).map((exam) => (
                    <Card key={exam.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{exam.name}</CardTitle>
                            <CardDescription>{EXAM_TYPE_LABELS[exam.type]}</CardDescription>
                          </div>
                          <Badge variant="default" className="text-white" style={{ backgroundColor: 'var(--color-module-attendance)' }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <p>Classes: {exam.applicableClasses?.join(', ') || 'All'}</p>
                            <p>Subjects: {exam.subjects?.length || 0} subjects</p>
                            <p>Term: {exam.term}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link to={`/exams/${exam.id}/analytics`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Results
                              </Link>
                            </Button>
                            <Button asChild size="sm" className="flex-1">
                              <Link to={`/exams/${exam.id}/report-cards`}>
                                <Download className="h-4 w-4 mr-2" />
                                Report Cards
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grades" className="mt-0">
            {gradeScalesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <GradeScaleEditor
                gradeScales={gradeScales}
                onCreate={async (data) => {
                  await createGradeScale.mutateAsync(data)
                  toast({
                    title: 'Grade Scale Created',
                    description: 'The grade scale has been created successfully.',
                  })
                }}
                onUpdate={async (id, data) => {
                  await updateGradeScale.mutateAsync({ id, data })
                  toast({
                    title: 'Grade Scale Updated',
                    description: 'The grade scale has been updated.',
                  })
                }}
                onDelete={async (id) => {
                  await deleteGradeScale.mutateAsync(id)
                  toast({
                    title: 'Grade Scale Deleted',
                    description: 'The grade scale has been deleted.',
                  })
                }}
                isCreating={createGradeScale.isPending}
                isUpdating={updateGradeScale.isPending}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
