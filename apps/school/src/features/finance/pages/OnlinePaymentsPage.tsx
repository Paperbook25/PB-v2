import { PageHeader } from '@/components/layout/PageHeader'
import { OnlinePaymentManager } from '../components/OnlinePaymentManager'

export function OnlinePaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Online Payments"
        description="Configure payment gateway and manage online payment orders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Online Payments' },
        ]}
      />

      <OnlinePaymentManager />
    </div>
  )
}
