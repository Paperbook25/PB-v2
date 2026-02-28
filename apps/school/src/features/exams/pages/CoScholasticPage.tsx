import { PageHeader } from '@/components/layout/PageHeader'
import { CoScholasticView } from '../components/CoScholasticView'

export function CoScholasticPage() {
  return (
    <div>
      <PageHeader
        title="Co-Scholastic Assessment"
        description="Art, Music, Sports, Discipline assessments as per CBSE CCE guidelines"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'Co-Scholastic' },
        ]}
      />

      <CoScholasticView />
    </div>
  )
}
