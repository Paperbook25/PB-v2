import { PageHeader } from '@/components/layout/PageHeader'
import { ReservationManager } from '../components/ReservationManager'

export function ReservationsPage() {
  return (
    <div>
      <PageHeader
        title="Book Reservations"
        description="Manage the reservation queue for unavailable books"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Library', href: '/library' },
          { label: 'Reservations' },
        ]}
      />

      <ReservationManager />
    </div>
  )
}
