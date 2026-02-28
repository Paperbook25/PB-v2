import { PageHeader } from '@/components/layout/PageHeader'
import { EscalationConfigManager } from '../components/EscalationConfigManager'

export function EscalationPage() {
  return (
    <div>
      <PageHeader
        title="Auto-Reminder Escalation"
        description="Configure automatic payment reminder rules and view reminder logs"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Escalation' },
        ]}
      />

      <EscalationConfigManager />
    </div>
  )
}
