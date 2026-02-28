import { PageHeader } from '@/components/layout/PageHeader'
import { ExamTimetableView } from '../components/ExamTimetableView'

export function ExamTimetablePage() {
  return (
    <div>
      <PageHeader
        title="Exam Timetable"
        description="View examination schedule with dates, times, rooms, and invigilators"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: 'Timetable' },
        ]}
      />

      <ExamTimetableView />
    </div>
  )
}
