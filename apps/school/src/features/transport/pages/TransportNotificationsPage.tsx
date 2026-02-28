import { PageHeader } from '@/components/layout/PageHeader'
import { TransportNotificationsView } from '../components/TransportNotificationsView'

export function TransportNotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Transport Notifications"
        description="Pick-up, drop-off, delay and emergency notifications to parents"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Notifications' },
        ]}
      />
      <TransportNotificationsView />
    </div>
  )
}
