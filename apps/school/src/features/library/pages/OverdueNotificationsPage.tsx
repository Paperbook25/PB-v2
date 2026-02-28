import { PageHeader } from '@/components/layout/PageHeader'
import { OverdueNotificationsView } from '../components/OverdueNotificationsView'

export function OverdueNotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Overdue Notifications"
        description="Configure and track overdue book return reminders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Library', href: '/library' },
          { label: 'Notifications' },
        ]}
      />

      <OverdueNotificationsView />
    </div>
  )
}
