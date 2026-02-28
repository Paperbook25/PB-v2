import { PageHeader } from '@/components/layout/PageHeader'
import { MaintenanceTracker } from '../components/MaintenanceTracker'

export function MaintenancePage() {
  return (
    <div>
      <PageHeader
        title="Vehicle Maintenance"
        description="Track service schedules, insurance renewals, and fitness certificates"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Maintenance' },
        ]}
      />
      <MaintenanceTracker />
    </div>
  )
}
