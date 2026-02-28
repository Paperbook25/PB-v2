import { PageHeader } from '@/components/layout/PageHeader'
import { ReadingHistoryView } from '../components/ReadingHistoryView'

export function ReadingHistoryPage() {
  return (
    <div>
      <PageHeader
        title="Reading History & Analytics"
        description="Track student reading habits, analytics, and personalized recommendations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Library', href: '/library' },
          { label: 'Reading History' },
        ]}
      />

      <ReadingHistoryView />
    </div>
  )
}
