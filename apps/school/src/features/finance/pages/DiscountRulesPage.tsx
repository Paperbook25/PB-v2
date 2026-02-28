import { PageHeader } from '@/components/layout/PageHeader'
import { DiscountRulesManager } from '../components/DiscountRulesManager'

export function DiscountRulesPage() {
  return (
    <div>
      <PageHeader
        title="Discounts & Scholarships"
        description="Manage discount rules, scholarship programs, and applied discounts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Discounts & Scholarships' },
        ]}
      />

      <DiscountRulesManager />
    </div>
  )
}
