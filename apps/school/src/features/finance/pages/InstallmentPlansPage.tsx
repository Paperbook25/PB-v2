import { PageHeader } from '@/components/layout/PageHeader'
import { InstallmentPlanManager } from '../components/InstallmentPlanManager'

export function InstallmentPlansPage() {
  return (
    <div>
      <PageHeader
        title="Installment Plans"
        description="Create and manage EMI / installment plans for fee payments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Installment Plans' },
        ]}
      />

      <InstallmentPlanManager />
    </div>
  )
}
