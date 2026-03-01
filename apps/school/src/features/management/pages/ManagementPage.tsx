import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { ScheduleSection } from '../components/ScheduleSection'
import { DocsSection } from '../components/DocsSection'
import { AlumniSection } from '../components/AlumniSection'
import type {
  ManagementSection,
  ScheduleTab,
  DocsTab,
  AlumniTab,
} from '../types/management.types'

export function ManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()

  // Get tab from URL (default: 'schedule')
  const activeTab = (searchParams.get('tab') as ManagementSection) || 'schedule'
  const subTab = searchParams.get('subtab') || ''

  // Role-based access
  const canAccessSchedule = hasRole(['admin', 'principal', 'teacher', 'accountant'])
  const canAccessDocs = hasRole(['admin', 'principal', 'teacher', 'accountant'])
  const canAccessAlumni = hasRole(['admin', 'principal'])

  // Handle subtab changes
  const handleScheduleTabChange = (value: ScheduleTab) => {
    setSearchParams({ tab: 'schedule', subtab: value })
  }

  const handleDocsTabChange = (value: DocsTab) => {
    setSearchParams({ tab: 'docs', subtab: value })
  }

  const handleAlumniTabChange = (value: AlumniTab) => {
    setSearchParams({ tab: 'alumni', subtab: value })
  }

  // Get current subtabs with defaults
  const scheduleSubTab = (activeTab === 'schedule' ? subTab as ScheduleTab : null) || 'timetables'
  const docsSubTab = (activeTab === 'docs' ? subTab as DocsTab : null) || 'browse'
  const alumniSubTab = (activeTab === 'alumni' ? subTab as AlumniTab : null) || 'directory'

  return (
    <div>
      <PageHeader
        title="Management"
        description="Manage schedules, documents, and alumni records"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Management' }]}
        moduleColor="management"
      />

      {/* Content — switched by sidebar ?tab= and ?subtab= params */}
      <div className="mt-6">
        {activeTab === 'schedule' && canAccessSchedule && (
          <ScheduleSection activeTab={scheduleSubTab} onTabChange={handleScheduleTabChange} />
        )}

        {activeTab === 'docs' && canAccessDocs && (
          <DocsSection activeTab={docsSubTab} onTabChange={handleDocsTabChange} />
        )}

        {activeTab === 'alumni' && canAccessAlumni && (
          <AlumniSection activeTab={alumniSubTab} onTabChange={handleAlumniTabChange} />
        )}
      </div>
    </div>
  )
}
