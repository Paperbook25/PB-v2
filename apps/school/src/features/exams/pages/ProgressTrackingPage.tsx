import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressTrackingView } from '../components/ProgressTrackingView'

export function ProgressTrackingPage() {
  return (
    <div>
      <PageHeader
        title="Progress Tracking"
        description="Track student performance across terms and identify improvement trends"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'Progress' },
        ]}
      />

      <ProgressTrackingView />
    </div>
  )
}
