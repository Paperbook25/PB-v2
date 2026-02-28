import { PageHeader } from '@/components/layout/PageHeader'
import { DriverManager } from '../components/DriverManager'

export function DriversPage() {
  return (
    <div>
      <PageHeader
        title="Driver Management"
        description="Manage drivers, licenses, and route assignments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Drivers' },
        ]}
      />
      <DriverManager />
    </div>
  )
}
