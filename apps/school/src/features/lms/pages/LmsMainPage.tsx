import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Video,
  TrendingUp,
  Calendar,
  Eye,
  FileUp,
  Target,
  BarChart3,
  Filter,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// LMS Hooks
import {
  useLmsStats,
  useLiveClasses,
  useCourses,
  useCreateLiveClass,
  useEnrollments,
  useCreateEnrollment,
  useAssignments,
  useCreateAssignment,
  useSubmissions,
  useGradeSubmission,
} from '../hooks/useLms'
import { useQuestions, useQuestionBankStats } from '../hooks/useQuestionBank'

// LMS Components
import { CourseCard } from '../components/CourseCard'
import { LiveClassCard } from '../components/LiveClassCard'
import { LiveClassScheduler } from '../components/LiveClassScheduler'
import { EnrollmentManager } from '../components/EnrollmentManager'
import { ProgressTracker } from '../components/ProgressTracker'
import { AssignmentForm } from '../components/AssignmentForm'
import { QuestionList } from '../components/QuestionBank/QuestionList'
import { QuestionEditor } from '../components/QuestionBank/QuestionEditor'
import { QuestionImport } from '../components/QuestionBank/QuestionImport'

// Types
import {
  LIVE_CLASS_STATUS_LABELS,
  ENROLLMENT_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  COURSE_LEVEL_LABELS,
  type CourseCategory,
  type CourseLevel,
  type CourseStatus,
  type LiveClassStatus,
  type EnrollmentStatus,
  type SubmissionStatus,
} from '../types/lms.types'
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  SUBJECT_TOPICS,
  type QuestionFilters,
  type BankQuestion,
  type QuestionDifficulty,
} from '../types/question-bank.types'
import type { QuizQuestionType } from '../types/lms.types'

// Tab types
type PrimaryTab = 'dashboard' | 'courses' | 'live-classes' | 'enrollments' | 'assignments' | 'question-bank'

// Constants
const popularCoursesData = [
  { name: 'Math 10', students: 45 },
  { name: 'Physics', students: 38 },
  { name: 'Biology', students: 35 },
  { name: 'English', students: 30 },
  { name: 'CS', students: 28 },
]

const statusBadgeVariant: Record<EnrollmentStatus, 'success' | 'default' | 'secondary'> = {
  active: 'success',
  completed: 'default',
  dropped: 'secondary',
}

const submissionBadgeVariant: Record<SubmissionStatus, 'secondary' | 'default' | 'success'> = {
  not_submitted: 'secondary',
  submitted: 'default',
  graded: 'success',
}

// ============================================
// Dashboard Tab Component
// ============================================
function DashboardTab() {
  const { data: statsResult, isLoading: statsLoading } = useLmsStats()
  const stats = statsResult?.data

  const { data: liveClassesResult } = useLiveClasses({ status: 'scheduled', limit: 5 })
  const liveClasses = liveClassesResult?.data ?? []

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      bgColor: 'var(--color-module-lms-light)',
      textColor: 'var(--color-module-lms)',
    },
    {
      title: 'Active Students',
      value: stats?.activeEnrollments ?? 0,
      icon: Users,
      bgColor: 'var(--color-module-students-light)',
      textColor: 'var(--color-module-students)',
    },
    {
      title: 'Live Classes Today',
      value: stats?.liveClassesToday ?? 0,
      icon: Video,
      bgColor: 'var(--color-module-communication-light)',
      textColor: 'var(--color-module-communication)',
    },
    {
      title: 'Avg Completion Rate',
      value: `${stats?.avgCompletionRate ?? 0}%`,
      icon: TrendingUp,
      bgColor: 'var(--color-module-finance-light)',
      textColor: 'var(--color-module-finance)',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: stat.bgColor, color: stat.textColor }}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/lms/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/lms?tab=live-classes">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Live Class
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Live Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Live Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {liveClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming live classes scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {liveClasses.map((lc) => (
                  <div
                    key={lc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lc.instructorName} &middot;{' '}
                        {new Date(lc.scheduledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {LIVE_CLASS_STATUS_LABELS[lc.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Courses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularCoursesData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="students"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Courses Tab Component
// ============================================
function CoursesTab() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CourseCategory | 'all'>('all')
  const [level, setLevel] = useState<CourseLevel | 'all'>('all')
  const [status, setStatus] = useState<CourseStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useCourses({
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    level: level !== 'all' ? level : undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit: 9,
  })

  const courses = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v as CourseCategory | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {COURSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {COURSE_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v as CourseLevel | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {(
              Object.entries(COURSE_LEVEL_LABELS) as [CourseLevel, string][]
            ).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as CourseStatus | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No courses found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or create a new course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/lms/courses/${course.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} courses)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Live Classes Tab Component
// ============================================
function LiveClassesTab() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [schedulerOpen, setSchedulerOpen] = useState(false)

  const statusFilter: LiveClassStatus | undefined =
    tab === 'upcoming' ? 'scheduled' : tab === 'past' ? 'completed' : undefined

  const { data, isLoading } = useLiveClasses({
    search: search || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  })

  const createLiveClass = useCreateLiveClass()

  const liveClasses = data?.data ?? []
  const meta = data?.meta

  const handleCreateClass = async (formData: Parameters<typeof createLiveClass.mutateAsync>[0]) => {
    try {
      await createLiveClass.mutateAsync(formData)
      toast({
        title: 'Class Scheduled',
        description: 'Live class has been scheduled successfully.',
      })
      setSchedulerOpen(false)
    } catch {
      toast({
        title: 'Scheduling Failed',
        description: 'Failed to schedule live class. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta?.total ?? 0} live class{(meta?.total ?? 0) !== 1 ? 'es' : ''}
        </p>
        <Button size="sm" onClick={() => setSchedulerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search live classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger variant="secondary" value="past">Past</TabsTrigger>
          <TabsTrigger variant="secondary" value="all">All</TabsTrigger>
        </TabsList>

        <div className="mt-6">
        {['upcoming', 'past', 'all'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-lg" />
                ))}
              </div>
            ) : liveClasses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No live classes found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveClasses.map((liveClass) => (
                    <LiveClassCard key={liveClass.id} liveClass={liveClass} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={meta.page <= 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
        </div>
      </Tabs>

      {/* Schedule Dialog */}
      <LiveClassScheduler
        open={schedulerOpen}
        onOpenChange={setSchedulerOpen}
        onSubmit={handleCreateClass}
        isLoading={createLiveClass.isPending}
      />
    </div>
  )
}

// ============================================
// Enrollments Tab Component
// ============================================
function EnrollmentsTab() {
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} enrollment{meta.total !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </div>

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

// ============================================
// Assignments Tab Component
// ============================================
function AssignmentsTab() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')

  // Data queries
  const { data: assignmentsData, isLoading } = useAssignments({
    search: search || undefined,
  })
  const { data: coursesData } = useCourses({ limit: 100 })
  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions(
    selectedAssignmentId ?? ''
  )

  // Mutations
  const createAssignment = useCreateAssignment()
  const gradeSubmission = useGradeSubmission()

  const assignments = assignmentsData?.data ?? []
  const courses = coursesData?.data?.map((c) => ({ id: c.id, title: c.title })) ?? []
  const submissions = submissionsData?.data ?? []

  const handleCreateAssignment = async (
    formData: Parameters<typeof createAssignment.mutateAsync>[0]
  ) => {
    try {
      await createAssignment.mutateAsync(formData)
      toast({
        title: 'Assignment Created',
        description: 'Assignment has been created successfully.',
      })
      setFormOpen(false)
    } catch {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleGrade = async (submissionId: string) => {
    const score = Number(gradeScore)
    if (isNaN(score) || score < 0) {
      toast({
        title: 'Invalid Score',
        description: 'Please enter a valid score.',
        variant: 'destructive',
      })
      return
    }

    try {
      await gradeSubmission.mutateAsync({
        id: submissionId,
        data: { score, feedback: gradeFeedback },
      })
      toast({
        title: 'Submission Graded',
        description: 'Submission has been graded successfully.',
      })
      setGradingId(null)
      setGradeScore('')
      setGradeFeedback('')
    } catch {
      toast({
        title: 'Grading Failed',
        description: 'Failed to grade submission. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Assignments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.courseName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {formatDate(assignment.dueDate)}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive" className="text-[10px]">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{assignment.maxScore}</TableCell>
                  <TableCell>{assignment.submissionCount}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                      title="View Submissions"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Assignment Dialog */}
      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateAssignment}
        isLoading={createAssignment.isPending}
        courses={courses}
      />

      {/* Submissions Dialog */}
      <Dialog
        open={!!selectedAssignmentId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssignmentId(null)
            setGradingId(null)
            setGradeScore('')
            setGradeFeedback('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions</DialogTitle>
          </DialogHeader>

          {submissionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.studentName}</TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={submissionBadgeVariant[submission.status]}>
                        {SUBMISSION_STATUS_LABELS[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.score !== null ? submission.score : '-'}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGradingId(submission.id)
                            setGradeScore(submission.score !== null ? String(submission.score) : '')
                            setGradeFeedback(submission.feedback || '')
                          }}
                        >
                          Grade
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Inline grading form */}
                {gradingId && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="space-y-3 py-2">
                        <p className="text-sm font-medium">Grade Submission</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="grade-score">Score</Label>
                            <Input
                              id="grade-score"
                              type="number"
                              min={0}
                              placeholder="Enter score"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="grade-feedback">Feedback</Label>
                            <Textarea
                              id="grade-feedback"
                              placeholder="Enter feedback"
                              rows={2}
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradingId(null)
                              setGradeScore('')
                              setGradeFeedback('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={gradeSubmission.isPending}
                            onClick={() => handleGrade(gradingId)}
                          >
                            {gradeSubmission.isPending ? 'Saving...' : 'Save Grade'}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Question Bank Tab Component
// ============================================
function QuestionBankTab() {
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 20,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | undefined>()

  const { data: questionsResult, isLoading } = useQuestions(filters)
  const { data: statsResult } = useQuestionBankStats()

  const questions = questionsResult?.data || []
  const meta = questionsResult?.meta
  const stats = statsResult?.data

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key: keyof QuestionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleEdit = (question: BankQuestion) => {
    setEditingQuestion(question)
    setEditorOpen(true)
  }

  const handleAddNew = () => {
    setEditingQuestion(undefined)
    setEditorOpen(true)
  }

  const topics = filters.subject ? SUBJECT_TOPICS[filters.subject] || [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stats?.totalQuestions ?? 0} question{(stats?.totalQuestions ?? 0) !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentlyAdded} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">By Difficulty</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }}
                >
                  Easy: {stats.byDifficulty.easy}
                </Badge>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }}
                >
                  Med: {stats.byDifficulty.medium}
                </Badge>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: 'var(--color-module-exams-light)', color: 'var(--color-module-exams)' }}
                >
                  Hard: {stats.byDifficulty.hard}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">By Type</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">MCQ: {stats.byType.mcq}</Badge>
                <Badge variant="outline">T/F: {stats.byType.true_false}</Badge>
                <Badge variant="outline">Short: {stats.byType.short_answer}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.bySubject)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([subject, count]) => (
                    <Badge key={subject} variant="secondary">
                      {COURSE_CATEGORY_LABELS[subject as CourseCategory]}: {count}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.subject || filters.difficulty || filters.type) && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Row */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.subject || ''}
                  onValueChange={(v) => {
                    handleFilterChange('subject', v)
                    if (!v) handleFilterChange('topic', '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {COURSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {COURSE_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.topic || ''}
                  onValueChange={(v) => handleFilterChange('topic', v)}
                  disabled={!filters.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.difficulty || ''}
                  onValueChange={(v) => handleFilterChange('difficulty', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    {(Object.keys(QUESTION_DIFFICULTY_LABELS) as QuestionDifficulty[]).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {QUESTION_DIFFICULTY_LABELS[d]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type || ''}
                  onValueChange={(v) => handleFilterChange('type', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuizQuestionType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {QUESTION_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <QuestionList
        questions={questions}
        isLoading={isLoading}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
      />

      {/* Question Editor Dialog */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editingQuestion}
      />

      {/* Import Dialog */}
      <QuestionImport open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}

// ============================================
// Main LmsMainPage Component
// ============================================
export function LmsMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()

  // Primary tab
  const activeTab = (searchParams.get('tab') as PrimaryTab) || 'dashboard'

  // Check if user can see question bank tab
  const canSeeQuestionBank = hasRole(['admin', 'principal', 'teacher'])

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const getHeaderAction = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <Button onClick={() => navigate('/lms/courses/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        )
      default:
        return undefined
    }
  }

  return (
    <div>
      <PageHeader
        title="Learning Management System"
        description="Manage courses, live classes, enrollments, and assessments"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'LMS' }]}
        actions={getHeaderAction()}
        moduleColor="lms"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={`grid w-full ${canSeeQuestionBank ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 hidden sm:block" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="live-classes" className="flex items-center gap-2">
            <Video className="h-4 w-4 hidden sm:block" />
            Live Classes
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="flex items-center gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Target className="h-4 w-4 hidden sm:block" />
            Assignments
          </TabsTrigger>
          {canSeeQuestionBank && (
            <TabsTrigger value="question-bank" className="flex items-center gap-2">
              <FileUp className="h-4 w-4 hidden sm:block" />
              Question Bank
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <CoursesTab />
          </TabsContent>

          <TabsContent value="live-classes" className="mt-0">
            <LiveClassesTab />
          </TabsContent>

          <TabsContent value="enrollments" className="mt-0">
            <EnrollmentsTab />
          </TabsContent>

          <TabsContent value="assignments" className="mt-0">
            <AssignmentsTab />
          </TabsContent>

          {canSeeQuestionBank && (
            <TabsContent value="question-bank" className="mt-0">
              <QuestionBankTab />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
