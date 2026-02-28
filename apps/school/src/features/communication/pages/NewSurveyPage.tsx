import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { useCreateSurvey } from '../hooks/useCommunication'
import { SurveyBuilder } from '../components/SurveyBuilder'
import { CreateSurveyRequest } from '../types/communication.types'

export function NewSurveyPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createMutation = useCreateSurvey()

  const handleSubmit = async (data: CreateSurveyRequest) => {
    try {
      await createMutation.mutateAsync(data)
      toast({
        title: 'Survey created',
        description: 'The survey has been created successfully.',
      })
      navigate('/communication/surveys')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create survey.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Survey"
        description="Build a new survey to collect feedback"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Surveys', href: '/communication/surveys' },
          { label: 'New' },
        ]}
      />

      <SurveyBuilder
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        onCancel={() => navigate('/communication/surveys')}
      />
    </div>
  )
}
