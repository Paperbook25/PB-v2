import { PageHeader } from '@/components/layout/PageHeader'
import { LateDetectionManager } from '../components/LateDetectionManager'

export function LateDetectionPage() {
  return (
    <div>
      <PageHeader
        title="Late Detection"
        description="Track late arrivals and identify habitual patterns"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Late Detection' },
        ]}
      />

      <LateDetectionManager />
    </div>
  )
}
