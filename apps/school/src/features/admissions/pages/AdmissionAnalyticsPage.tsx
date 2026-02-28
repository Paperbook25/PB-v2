import { PageHeader } from '@/components/layout/PageHeader'
import { AdmissionAnalyticsView } from '../components/AdmissionAnalyticsView'

export function AdmissionAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Admission Analytics"
        description="Insights and trends for the admissions process"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'Analytics' },
        ]}
      />

      <AdmissionAnalyticsView />
    </div>
  )
}
