import { PageHeader } from '@/components/layout/PageHeader'
import { MarksAnalyticsView } from '../components/MarksAnalyticsView'

export function MarksAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Marks Analytics"
        description="Class rankings, subject analysis, and grade distribution"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'Analytics' },
        ]}
      />

      <MarksAnalyticsView />
    </div>
  )
}
