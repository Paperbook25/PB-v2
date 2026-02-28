import { PageHeader } from '@/components/layout/PageHeader'
import { WaitlistManager } from '../components/WaitlistManager'

export function WaitlistPage() {
  return (
    <div>
      <PageHeader
        title="Waitlist Management"
        description="Manage waitlisted applications and class capacity"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'Waitlist' },
        ]}
      />

      <WaitlistManager />
    </div>
  )
}
