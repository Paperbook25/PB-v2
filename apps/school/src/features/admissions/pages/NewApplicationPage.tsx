import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ApplicationForm } from '../components/ApplicationForm'
import type { ApplicationFormData } from '../components/ApplicationForm/types'
import { useCreateApplication } from '../hooks/useAdmissions'

export function NewApplicationPage() {
  const navigate = useNavigate()
  const createApplication = useCreateApplication()

  const handleSubmit = (data: ApplicationFormData) => {
    createApplication.mutate(data, {
      onSuccess: (response) => {
        navigate(`/admissions/${response.data.id}`)
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="New Application"
        description="Submit a new admission application"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'New Application' },
        ]}
      />

      <ApplicationForm onSubmit={handleSubmit} isSubmitting={createApplication.isPending} />
    </div>
  )
}
