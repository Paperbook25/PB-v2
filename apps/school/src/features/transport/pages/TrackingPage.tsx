import { PageHeader } from '@/components/layout/PageHeader'
import { LiveTrackingView } from '../components/LiveTrackingView'

export function TrackingPage() {
  return (
    <div>
      <PageHeader
        title="Live Bus Tracking"
        description="Real-time GPS tracking of school buses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Transport', href: '/transport' },
          { label: 'Tracking' },
        ]}
      />
      <LiveTrackingView />
    </div>
  )
}
