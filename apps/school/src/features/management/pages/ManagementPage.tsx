import { useSearchParams } from 'react-router-dom'
import { Calendar, FileArchive, Users2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  // Define visible sections based on role
  const sections = [
    { value: 'schedule', label: 'Schedule', icon: Calendar, visible: canAccessSchedule },
    { value: 'docs', label: 'Docs', icon: FileArchive, visible: canAccessDocs },
    { value: 'alumni', label: 'Alumni', icon: Users2, visible: canAccessAlumni },
  ].filter(s => s.visible)

  // Determine effective tab
  const effectiveTab = sections.some(s => s.value === activeTab)
    ? activeTab
    : sections[0]?.value || 'schedule'

  // Handle tab change (primary tabs)
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Handle Schedule subtab change
  const handleScheduleTabChange = (value: ScheduleTab) => {
    setSearchParams({ tab: 'schedule', subtab: value })
  }

  // Handle Docs subtab change
  const handleDocsTabChange = (value: DocsTab) => {
    setSearchParams({ tab: 'docs', subtab: value })
  }

  // Handle Alumni subtab change
  const handleAlumniTabChange = (value: AlumniTab) => {
    setSearchParams({ tab: 'alumni', subtab: value })
  }

  // Get current subtabs with defaults
  const scheduleSubTab = (effectiveTab === 'schedule' ? subTab as ScheduleTab : null) || 'timetables'
  const docsSubTab = (effectiveTab === 'docs' ? subTab as DocsTab : null) || 'browse'
  const alumniSubTab = (effectiveTab === 'alumni' ? subTab as AlumniTab : null) || 'directory'

  return (
    <div>
      <PageHeader
        title="Management"
        description="Manage schedules, documents, and alumni records"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Management' }]}
        moduleColor="management"
      />

      {/* Tab Selector - only show if multiple sections are visible */}
      {sections.length > 1 && (
        <Tabs value={effectiveTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="w-full max-w-md">
            {sections.map((s) => (
              <TabsTrigger key={s.value} value={s.value} className="flex items-center gap-2">
                <s.icon className="h-4 w-4" />
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {/* Schedule Section */}
            {canAccessSchedule && (
              <TabsContent value="schedule" className="mt-0">
                <ScheduleSection activeTab={scheduleSubTab} onTabChange={handleScheduleTabChange} />
              </TabsContent>
            )}

            {/* Docs Section */}
            {canAccessDocs && (
              <TabsContent value="docs" className="mt-0">
                <DocsSection activeTab={docsSubTab} onTabChange={handleDocsTabChange} />
              </TabsContent>
            )}

            {/* Alumni Section */}
            {canAccessAlumni && (
              <TabsContent value="alumni" className="mt-0">
                <AlumniSection activeTab={alumniSubTab} onTabChange={handleAlumniTabChange} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      )}

      {/* If only one tab is visible, render it directly */}
      {sections.length === 1 && (
        <div className="mt-6">
          {effectiveTab === 'schedule' && canAccessSchedule && (
            <ScheduleSection activeTab={scheduleSubTab} onTabChange={handleScheduleTabChange} />
          )}
          {effectiveTab === 'docs' && canAccessDocs && (
            <DocsSection activeTab={docsSubTab} onTabChange={handleDocsTabChange} />
          )}
          {effectiveTab === 'alumni' && canAccessAlumni && (
            <AlumniSection activeTab={alumniSubTab} onTabChange={handleAlumniTabChange} />
          )}
        </div>
      )}
    </div>
  )
}
