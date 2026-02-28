import { PageHeader } from '@/components/layout/PageHeader'
import { QuestionPaperManager } from '../components/QuestionPaperManager'

export function QuestionPapersPage() {
  return (
    <div>
      <PageHeader
        title="Question Papers"
        description="Create and manage examination question paper templates"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'Question Papers' },
        ]}
      />

      <QuestionPaperManager />
    </div>
  )
}
