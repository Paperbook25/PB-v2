import { PageHeader } from '@/components/layout/PageHeader'
import { NotificationManager } from '../components/NotificationManager'

export function AttendanceNotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Absence Notifications"
        description="Configure and monitor automated attendance notifications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Notifications' },
        ]}
      />

      <NotificationManager />
    </div>
  )
}
