import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { CourseForm } from '../components/CourseForm'
import { useCourse, useUpdateCourse } from '../hooks/useLms'
import { useToast } from '@/hooks/use-toast'
import type { CreateCourseRequest } from '../types/lms.types'

export function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: courseResult, isLoading: courseLoading } = useCourse(id!)
  const course = courseResult?.data
  const { mutateAsync: updateCourse, isPending } = useUpdateCourse()

  const handleSubmit = async (data: CreateCourseRequest) => {
    try {
      await updateCourse({ id: id!, data })
      toast({
        title: 'Course updated successfully',
        description: `"${data.title}" has been updated.`,
      })
      navigate(`/lms/courses/${id}`)
    } catch {
      toast({
        title: 'Failed to update course',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (courseLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Course"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'LMS', href: '/lms' },
            { label: 'Courses', href: '/lms/courses' },
            { label: '...' },
          ]}
        />
        <div className="max-w-2xl space-y-6">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div>
        <PageHeader
          title="Edit Course"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'LMS', href: '/lms' },
            { label: 'Courses', href: '/lms/courses' },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Course"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Courses', href: '/lms/courses' },
          { label: course.title, href: `/lms/courses/${id}` },
          { label: 'Edit' },
        ]}
      />

      <div className="max-w-2xl">
        <CourseForm
          defaultValues={course}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/lms/courses/${id}`)}
          isLoading={isPending}
        />
      </div>
    </div>
  )
}
