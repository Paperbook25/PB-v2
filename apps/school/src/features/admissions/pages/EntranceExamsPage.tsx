import { PageHeader } from '@/components/layout/PageHeader'
import { EntranceExamManager } from '../components/EntranceExamManager'

export function EntranceExamsPage() {
  return (
    <div>
      <PageHeader
        title="Entrance Exams"
        description="Schedule and manage entrance examinations for admissions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: 'Entrance Exams' },
        ]}
      />

      <EntranceExamManager />
    </div>
  )
}
