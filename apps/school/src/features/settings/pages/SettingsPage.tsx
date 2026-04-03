import { useSearchParams } from 'react-router-dom'
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
import { SubscriptionSection } from '../components/SubscriptionSection'
import { AttendancePolicySettings } from '../components/AttendancePolicySettings'
import { LeavePolicySettings } from '../components/LeavePolicySettings'
import type { SettingsSection, GeneralTab, CommunicationTab, IntegrationsTab } from '../types/settings.types'

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()

  // Role-based access
  const canAccessGeneral = hasRole(['admin', 'principal'])
  const canAccessCommunication = hasRole(['admin', 'principal', 'teacher'])
  const canAccessIntegrations = hasRole(['admin', 'principal'])
  const canAccessModules = hasRole(['admin'])
  const canAccessPermissions = hasRole(['admin', 'principal'])
  const canAccessSubscription = hasRole(['admin'])

  // Get tab from URL — auto-default to first accessible tab for the role
  const urlTab = searchParams.get('tab') as SettingsSection | null
  const defaultTab: SettingsSection = canAccessGeneral ? 'general' : canAccessCommunication ? 'communication' : 'general'
  const activeTab = urlTab || defaultTab
  const subTab = searchParams.get('subtab') || ''

  // Get current subtabs with defaults
  const generalSubTab = (activeTab === 'general' ? subTab as GeneralTab : null) || 'school'
  const communicationSubTab = (activeTab === 'communication' ? subTab as CommunicationTab : null) || 'dashboard'
  const integrationsSubTab = (activeTab === 'integrations' ? subTab as IntegrationsTab : null) || 'sms'

  // Handle subtab changes
  const handleCommunicationTabChange = (value: CommunicationTab) => {
    setSearchParams({ tab: 'communication', subtab: value })
  }

  const handleIntegrationsTabChange = (value: IntegrationsTab) => {
    setSearchParams({ tab: 'integrations', subtab: value })
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your school's configuration, communication, and integrations"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
        moduleColor="settings"
      />

      {/* Content — switched by sidebar ?tab= and ?subtab= params */}
      <div className="mt-6">
        {activeTab === 'general' && canAccessGeneral && (
          <GeneralContent activeTab={generalSubTab} />
        )}

        {activeTab === 'permissions' && canAccessPermissions && (
          <RolePermissionsManager />
        )}

        {activeTab === 'modules' && canAccessModules && (
          <AddonManager />
        )}

        {activeTab === 'communication' && canAccessCommunication && (
          <CommunicationSection activeTab={communicationSubTab} onTabChange={handleCommunicationTabChange} />
        )}

        {activeTab === 'integrations' && canAccessIntegrations && (
          <IntegrationsSection activeTab={integrationsSubTab} onTabChange={handleIntegrationsTabChange} />
        )}

        {activeTab === 'subscription' && canAccessSubscription && (
          <SubscriptionSection />
        )}
      </div>
    </div>
  )
}

// General Settings — direct content rendering (no more secondary tab bar, sidebar handles it)
function GeneralContent({ activeTab }: { activeTab: GeneralTab }) {
  return (
    <>
      {activeTab === 'school' && <SchoolProfileForm />}
      {activeTab === 'academic' && <AcademicYearList />}
      {activeTab === 'calendar' && <AcademicCalendar />}
      {activeTab === 'classes' && <ClassSectionManager />}
      {activeTab === 'users' && <UserList />}
      {activeTab === 'templates' && <EmailTemplateManager />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'audit' && <AuditLogView />}
      {activeTab === 'backup' && <BackupSettings />}
      {activeTab === 'appearance' && <ThemeSettings />}
      {activeTab === 'attendance-policy' && <AttendancePolicySettings />}
      {activeTab === 'leave-policy' && <LeavePolicySettings />}
    </>
  )
}
