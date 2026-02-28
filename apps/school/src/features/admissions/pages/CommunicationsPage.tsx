import { PageHeader } from '@/components/layout/PageHeader'
import { CommunicationManager } from '../components/CommunicationManager'

export function CommunicationsPage() {
  return (
    <div>
      <PageHeader
        title="Communication Center"
        description="Manage admission-related communications and notifications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'Communications' },
        ]}
      />

      <CommunicationManager />
    </div>
  )
}
