import { PageHeader } from '@/components/layout/PageHeader'
import { ConcessionManager } from '../components/ConcessionManager'

export function ConcessionsPage() {
  return (
    <div>
      <PageHeader
        title="Fee Concessions"
        description="Review and manage fee concession and waiver requests"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Concessions' },
        ]}
      />

      <ConcessionManager />
    </div>
  )
}
