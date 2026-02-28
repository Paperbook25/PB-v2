import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { CourseForm } from '../components/CourseForm'
import { useCreateCourse } from '../hooks/useLms'
import { useToast } from '@/hooks/use-toast'
import type { CreateCourseRequest } from '../types/lms.types'

export function NewCoursePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutateAsync: createCourse, isPending } = useCreateCourse()

  const handleSubmit = async (data: CreateCourseRequest) => {
    try {
      const result = await createCourse(data)
      toast({
        title: 'Course created successfully',
        description: `"${result.data.title}" has been created.`,
      })
      navigate(`/lms/courses/${result.data.id}`)
    } catch {
      toast({
        title: 'Failed to create course',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Create New Course"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Courses', href: '/lms/courses' },
          { label: 'New Course' },
        ]}
      />

      <div className="max-w-2xl">
        <CourseForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/lms/courses')}
          isLoading={isPending}
        />
      </div>
    </div>
  )
}
