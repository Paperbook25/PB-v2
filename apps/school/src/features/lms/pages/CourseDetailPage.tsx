import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Users, Star, Clock, BookOpen, Search } from 'lucide-react'
import { useCourse, useDeleteCourse, useEnrollments, useCreateEnrollment } from '../hooks/useLms'
import { CurriculumBuilder } from '../components/CurriculumBuilder'
import { EnrollmentManager } from '../components/EnrollmentManager'
import { ProgressTracker } from '../components/ProgressTracker'
import {
  COURSE_CATEGORY_LABELS,
  COURSE_LEVEL_LABELS,
  COURSE_STATUS_LABELS,
  ENROLLMENT_STATUS_LABELS,
} from '../types/lms.types'
import type { EnrollmentStatus } from '../types/lms.types'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, getInitials } from '@/lib/utils'
import { courseStatusColors, statusColors, ratingColors } from '@/lib/design-tokens'

const enrollmentStatusStyleMap: Record<EnrollmentStatus, { bg: string; text: string }> = {
  active: { bg: statusColors.successLight, text: statusColors.success },
  completed: { bg: statusColors.infoLight, text: statusColors.info },
  dropped: { bg: statusColors.errorLight, text: statusColors.error },
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  // Queries
  const { data: result, isLoading } = useCourse(id!)
  const course = result?.data

  const { data: enrollmentsResult } = useEnrollments({ courseId: id })
  const enrollments = enrollmentsResult?.data ?? []

  // Mutations
  const deleteCourseMutation = useDeleteCourse()
  const createEnrollmentMutation = useCreateEnrollment()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Course not found</p>
        <Button onClick={() => navigate('/lms/courses')}>
          <BookOpen className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    )
  }

  // Handlers
  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    deleteCourseMutation.mutate(id!, {
      onSuccess: () => {
        toast({
          title: 'Course Deleted',
          description: `"${course.title}" has been removed.`,
        })
        navigate('/lms/courses')
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete course',
          variant: 'destructive',
        })
      },
    })
  }

  const handleEnrollStudent = (data: { courseId: string; studentId: string }) => {
    createEnrollmentMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Student Enrolled',
          description: 'Student has been enrolled in the course successfully.',
        })
        setEnrollDialogOpen(false)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to enroll student',
          variant: 'destructive',
        })
      },
    })
  }

  // Filtered enrollments for Students tab
  const filteredEnrollments = enrollments.filter((enrollment) =>
    enrollment.studentName.toLowerCase().includes(studentSearch.toLowerCase())
  )

  // Analytics computations
  const totalEnrolled = enrollments.length
  const completedCount = enrollments.filter((e) => e.status === 'completed').length
  const completionRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
    : 0

  return (
    <div>
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Courses', href: '/lms/courses' },
          { label: course.title },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteCourseMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button size="sm" asChild>
              <Link to={`/lms/courses/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Course
              </Link>
            </Button>
          </div>
        }
      />

      {/* Course Hero Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full md:w-80 max-h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
              <p className="text-muted-foreground mb-3">
                By {course.instructorName}
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {COURSE_CATEGORY_LABELS[course.category]}
                </Badge>
                <Badge variant="outline">
                  {COURSE_LEVEL_LABELS[course.level]}
                </Badge>
                <Badge
                  variant={
                    course.status === 'published'
                      ? 'success'
                      : course.status === 'draft'
                        ? 'warning'
                        : 'secondary'
                  }
                >
                  {COURSE_STATUS_LABELS[course.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">{formatCurrency(course.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" style={{ fill: ratingColors.star, color: ratingColors.star }} />
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{course.enrollmentCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{course.duration}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {course.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="" alt={course.instructorName} />
                  <AvatarFallback>{getInitials(course.instructorName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{course.instructorName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Course instructor for {COURSE_CATEGORY_LABELS[course.category]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <CurriculumBuilder courseId={id!} editable={true} />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setEnrollDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Enroll Student
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {studentSearch
                        ? 'No students match your search.'
                        : 'No students enrolled yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.studentName}
                      </TableCell>
                      <TableCell>
                        {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <ProgressTracker progress={enrollment.progress} size="sm" />
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: enrollmentStatusStyleMap[enrollment.status].bg,
                            color: enrollmentStatusStyleMap[enrollment.status].text,
                          }}
                        >
                          {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{totalEnrolled}</p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: statusColors.success }}>{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: statusColors.info }}>{avgProgress}%</p>
                <p className="text-sm text-muted-foreground">Average Progress</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enrollment Manager Dialog */}
      <EnrollmentManager
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        onSubmit={handleEnrollStudent}
        isLoading={createEnrollmentMutation.isPending}
      />
    </div>
  )
}
