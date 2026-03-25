import { useSearchParams } from 'react-router-dom'
import { Settings, MessageSquare, Plug, Blocks, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { SchoolProfileForm } from '../components/SchoolProfileForm'
import { AcademicYearList } from '../components/AcademicYearList'
import { ClassSectionManager } from '../components/ClassSectionManager'
import { UserList } from '../components/UserList'
import { NotificationSettings } from '../components/NotificationSettings'
import { BackupSettings } from '../components/BackupSettings'
import { ThemeSettings } from '../components/ThemeSettings'
import { AuditLogView } from '../components/AuditLogView'
import { AcademicCalendar } from '../components/AcademicCalendar'
import { EmailTemplateManager } from '../components/EmailTemplateManager'
import { CommunicationSection } from '../components/CommunicationSection'
import { IntegrationsSection } from '../components/IntegrationsSection'
import { AddonManager } from '../components/AddonManager'
import { RolePermissionsManager } from '../components/RolePermissionsManager'
import type { SettingsSection, GeneralTab, CommunicationTab, IntegrationsTab } from '../types/settings.types'

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()

  // Get tab from URL (standardized naming: tab for primary, subtab for secondary)
  const activeTab = (searchParams.get('tab') as SettingsSection) || 'general'
  const subTab = searchParams.get('subtab') || ''

  // Role-based access
  const canAccessGeneral = hasRole(['admin', 'principal'])
  const canAccessCommunication = hasRole(['admin', 'principal', 'teacher'])
  const canAccessIntegrations = hasRole(['admin', 'principal'])
  const canAccessModules = hasRole(['admin'])
  const canAccessPermissions = hasRole(['admin', 'principal'])

  // Define visible sections based on role
  const sections = [
    { value: 'general', label: 'General', icon: Settings, visible: canAccessGeneral },
    { value: 'permissions', label: 'Permissions', icon: Shield, visible: canAccessPermissions },
    { value: 'modules', label: 'Modules', icon: Blocks, visible: canAccessModules },
    { value: 'communication', label: 'Communication', icon: MessageSquare, visible: canAccessCommunication },
    { value: 'integrations', label: 'Integrations', icon: Plug, visible: canAccessIntegrations },
  ].filter(s => s.visible)

  // Determine effective tab
  const effectiveTab = sections.some(s => s.value === activeTab)
    ? activeTab
    : sections[0]?.value || 'general'

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Handle General subtab change
  const handleGeneralTabChange = (value: string) => {
    setSearchParams({ tab: 'general', subtab: value })
  }

  // Handle Communication subtab change
  const handleCommunicationTabChange = (value: CommunicationTab) => {
    setSearchParams({ tab: 'communication', subtab: value })
  }

  // Handle Integrations subtab change
  const handleIntegrationsTabChange = (value: IntegrationsTab) => {
    setSearchParams({ tab: 'integrations', subtab: value })
  }

  // Get current subtabs with defaults
  const generalSubTab = (activeTab === 'general' ? subTab as GeneralTab : null) || 'school'
  const communicationSubTab = (activeTab === 'communication' ? subTab as CommunicationTab : null) || 'dashboard'
  const integrationsSubTab = (activeTab === 'integrations' ? subTab as IntegrationsTab : null) || 'sms'

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your school's configuration, communication, and integrations"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
        moduleColor="settings"
      />

      {/* Tab Selector - only show if multiple tabs are visible */}
      {sections.length > 1 && (
        <Tabs value={effectiveTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="w-full max-w-2xl">
            {sections.map((s) => (
              <TabsTrigger key={s.value} value={s.value} className="flex items-center gap-2">
                <s.icon className="h-4 w-4" />
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {/* General Section */}
            {canAccessGeneral && (
              <TabsContent value="general" className="mt-0">
                <GeneralSection activeTab={generalSubTab} onTabChange={handleGeneralTabChange} />
              </TabsContent>
            )}

            {/* Permissions Section */}
            {canAccessPermissions && (
              <TabsContent value="permissions" className="mt-0">
                <RolePermissionsManager />
              </TabsContent>
            )}

            {/* Modules Section */}
            {canAccessModules && (
              <TabsContent value="modules" className="mt-0">
                <AddonManager />
              </TabsContent>
            )}

            {/* Communication Section */}
            {canAccessCommunication && (
              <TabsContent value="communication" className="mt-0">
                <CommunicationSection activeTab={communicationSubTab} onTabChange={handleCommunicationTabChange} />
              </TabsContent>
            )}

            {/* Integrations Section */}
            {canAccessIntegrations && (
              <TabsContent value="integrations" className="mt-0">
                <IntegrationsSection activeTab={integrationsSubTab} onTabChange={handleIntegrationsTabChange} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      )}

      {/* If only one tab is visible, render it directly */}
      {sections.length === 1 && (
        <div className="mt-6">
          {effectiveTab === 'general' && canAccessGeneral && (
            <GeneralSection activeTab={generalSubTab} onTabChange={handleGeneralTabChange} />
          )}
          {effectiveTab === 'permissions' && canAccessPermissions && (
            <RolePermissionsManager />
          )}
          {effectiveTab === 'modules' && canAccessModules && (
            <AddonManager />
          )}
          {effectiveTab === 'communication' && canAccessCommunication && (
            <CommunicationSection activeTab={communicationSubTab} onTabChange={handleCommunicationTabChange} />
          )}
          {effectiveTab === 'integrations' && canAccessIntegrations && (
            <IntegrationsSection activeTab={integrationsSubTab} onTabChange={handleIntegrationsTabChange} />
          )}
        </div>
      )}
    </div>
  )
}

// General Settings Section Component
interface GeneralSectionProps {
  activeTab: GeneralTab
  onTabChange: (tab: string) => void
}

function GeneralSection({ activeTab, onTabChange }: GeneralSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList variant="secondary" className="flex flex-wrap w-full gap-1">
        <TabsTrigger variant="secondary" value="school">School</TabsTrigger>
        <TabsTrigger variant="secondary" value="academic">Academic</TabsTrigger>
        <TabsTrigger variant="secondary" value="calendar">Calendar</TabsTrigger>
        <TabsTrigger variant="secondary" value="classes">Classes</TabsTrigger>
        <TabsTrigger variant="secondary" value="users">Users</TabsTrigger>
        <TabsTrigger variant="secondary" value="templates">Templates</TabsTrigger>
        <TabsTrigger variant="secondary" value="notifications">Notifications</TabsTrigger>
        <TabsTrigger variant="secondary" value="audit">Audit Log</TabsTrigger>
        <TabsTrigger variant="secondary" value="backup">Backup</TabsTrigger>
        <TabsTrigger variant="secondary" value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="school" className="mt-0">
          <SchoolProfileForm />
        </TabsContent>

        <TabsContent value="academic" className="mt-0">
          <AcademicYearList />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <AcademicCalendar />
        </TabsContent>

        <TabsContent value="classes" className="mt-0">
          <ClassSectionManager />
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <UserList />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <AuditLogView />
        </TabsContent>

        <TabsContent value="backup" className="mt-0">
          <BackupSettings />
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <ThemeSettings />
        </TabsContent>
      </div>
    </Tabs>
  )
}
