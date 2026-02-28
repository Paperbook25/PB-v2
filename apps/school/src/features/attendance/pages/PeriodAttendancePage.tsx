import { PageHeader } from '@/components/layout/PageHeader'
import { PeriodAttendanceManager } from '../components/PeriodAttendanceManager'

export function PeriodAttendancePage() {
  return (
    <div>
      <PageHeader
        title="Period-wise Attendance"
        description="Track and mark attendance by class period and subject"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Period-wise' },
        ]}
      />

      <PeriodAttendanceManager />
    </div>
  )
}
