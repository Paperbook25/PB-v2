import { PageHeader } from '@/components/layout/PageHeader'
import { AdmissionPaymentManager } from '../components/AdmissionPaymentManager'

export function AdmissionPaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Admission Payments"
        description="Track and manage admission fee payments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'Payments' },
        ]}
      />

      <AdmissionPaymentManager />
    </div>
  )
}
