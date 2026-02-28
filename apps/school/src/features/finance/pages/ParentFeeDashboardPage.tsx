import { PageHeader } from '@/components/layout/PageHeader'
import { ParentFeeDashboardView } from '../components/ParentFeeDashboardView'

export function ParentFeeDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Fee Dashboard"
        description="View fee summary, upcoming dues, payment history and receipts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Fees' },
        ]}
      />

      <ParentFeeDashboardView />
    </div>
  )
}
