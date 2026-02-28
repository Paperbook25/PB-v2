import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { ExamForm } from '../components/ExamForm'
import { useExam, useUpdateExam } from '../hooks/useExams'

export function EditExamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: result, isLoading } = useExam(id!)
  const updateExam = useUpdateExam()

  const exam = result?.data

  const handleSubmit = async (data: any) => {
    try {
      await updateExam.mutateAsync({ id: id!, data })
      toast({
        title: 'Exam Updated',
        description: 'The exam has been updated successfully.',
      })
      navigate(`/exams/${id}`)
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update the exam. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Exam"
          description="Update exam details and configuration"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: 'Edit Exam' },
          ]}
        />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div>
        <PageHeader
          title="Exam Not Found"
          description="The requested exam could not be found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: 'Not Found' },
          ]}
          actions={
            <Button variant="outline" onClick={() => navigate('/exams')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${exam.name}`}
        description="Update exam details and configuration"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: exam.name, href: `/exams/${id}` },
          { label: 'Edit' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/exams/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exam
          </Button>
        }
      />

      <div className="mt-6">
        <ExamForm
          onSubmit={handleSubmit}
          initialData={exam}
          isSubmitting={updateExam.isPending}
          submitLabel="Update Exam"
        />
      </div>
    </div>
  )
}
