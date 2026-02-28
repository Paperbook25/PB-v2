import { PageHeader } from '@/components/layout/PageHeader'
import { VehicleManager } from '../components/VehicleManager'

export function VehiclesPage() {
  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        description="Manage school transport fleet, track maintenance and compliance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Vehicles' },
        ]}
      />
      <VehicleManager />
    </div>
  )
}
