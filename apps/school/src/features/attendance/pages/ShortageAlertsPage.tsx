import { PageHeader } from '@/components/layout/PageHeader'
import { ShortageAlertManager } from '../components/ShortageAlertManager'

export function ShortageAlertsPage() {
  return (
    <div>
      <PageHeader
        title="Shortage Alerts"
        description="Monitor low attendance and configure alert thresholds"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Shortage Alerts' },
        ]}
      />

      <ShortageAlertManager />
    </div>
  )
}
