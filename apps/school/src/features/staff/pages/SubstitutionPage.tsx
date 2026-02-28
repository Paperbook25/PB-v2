import { PageHeader } from '@/components/layout/PageHeader'
import { SubstitutionManager } from '../components/SubstitutionManager'

export function SubstitutionPage() {
  return (
    <div>
      <PageHeader
        title="Substitution Management"
        description="Manage teacher substitutions and cover assignments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'Substitutions' },
        ]}
      />

      <SubstitutionManager />
    </div>
  )
}
