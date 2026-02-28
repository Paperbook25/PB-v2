import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { ExamForm } from '../components/ExamForm'
import { useCreateExam } from '../hooks/useExams'

export function NewExamPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createExam = useCreateExam()

  const handleSubmit = async (data: any) => {
    try {
      await createExam.mutateAsync(data)
      toast({
        title: 'Exam Created',
        description: 'The exam has been created successfully.',
      })
      navigate('/exams')
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create the exam. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Create New Exam"
        description="Schedule a new exam and configure subjects"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'New Exam' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/exams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        }
      />

      <div className="mt-6">
        <ExamForm
          onSubmit={handleSubmit}
          isSubmitting={createExam.isPending}
          submitLabel="Create Exam"
        />
      </div>
    </div>
  )
}
