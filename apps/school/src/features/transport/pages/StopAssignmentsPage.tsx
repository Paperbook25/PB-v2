import { PageHeader } from '@/components/layout/PageHeader'
import { StopAssignmentView } from '../components/StopAssignmentView'

export function StopAssignmentsPage() {
  return (
    <div>
      <PageHeader
        title="Stop Assignments"
        description="Assign students to bus stops and manage transport enrollment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Stop Assignments' },
        ]}
      />
      <StopAssignmentView />
    </div>
  )
}
