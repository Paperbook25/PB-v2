import { useSearchParams } from 'react-router-dom'
import { Bus, Building2, Package } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { TransportTab } from '../components/TransportTab'
import { HostelTab } from '../components/HostelTab'
import { AssetsTab } from '../components/AssetsTab'
import type {
  OperationsPrimaryTab,
  TransportSubTab,
  HostelSubTab,
  AssetsSubTab,
} from '../types/operations.types'

export function OperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()

  // Get tab state from URL
  const activeTab = (searchParams.get('tab') as OperationsPrimaryTab) || 'transport'
  const subTab = searchParams.get('subtab') || ''

  // Check role-based access
  const canAccessTransport = hasRole(['admin', 'principal', 'transport_manager'])
  const canAccessHostel = hasRole(['admin', 'principal'])
  const canAccessAssets = hasRole(['admin', 'principal', 'accountant'])

  // Define visible tabs based on role
  const visibleTabs = [
    { value: 'transport', label: 'Transport', icon: Bus, visible: canAccessTransport },
    { value: 'hostel', label: 'Hostel', icon: Building2, visible: canAccessHostel },
    { value: 'assets', label: 'Assets', icon: Package, visible: canAccessAssets },
  ].filter(t => t.visible)

  // Handle primary tab changes
  const handlePrimaryTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Handle subtab changes for each module
  const handleTransportSubTabChange = (value: TransportSubTab) => {
    setSearchParams({ tab: 'transport', subtab: value })
  }

  const handleHostelSubTabChange = (value: HostelSubTab) => {
    setSearchParams({ tab: 'hostel', subtab: value })
  }

  const handleAssetsSubTabChange = (value: AssetsSubTab) => {
    setSearchParams({ tab: 'assets', subtab: value })
  }

  // Get current subtab with defaults
  const transportSubTab = (subTab as TransportSubTab) || 'routes'
  const hostelSubTab = (subTab as HostelSubTab) || 'dashboard'
  const assetsSubTab = (subTab as AssetsSubTab) || 'dashboard'

  // Determine default tab based on available access
  const effectiveTab = visibleTabs.some(t => t.value === activeTab)
    ? activeTab
    : visibleTabs[0]?.value || 'transport'

  return (
    <div>
      <PageHeader
        title="Operations"
        description="Manage transport, hostel, and assets"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Operations' }]}
        moduleColor="operations"
      />

      <Tabs value={effectiveTab} onValueChange={handlePrimaryTabChange} className="mt-6">
        <TabsList className={`grid w-full grid-cols-${visibleTabs.length}`}>
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {canAccessTransport && (
            <TabsContent value="transport" className="mt-0">
              <TransportTab
                subTab={transportSubTab}
                onSubTabChange={handleTransportSubTabChange}
              />
            </TabsContent>
          )}

          {canAccessHostel && (
            <TabsContent value="hostel" className="mt-0">
              <HostelTab
                subTab={hostelSubTab}
                onSubTabChange={handleHostelSubTabChange}
              />
            </TabsContent>
          )}

          {canAccessAssets && (
            <TabsContent value="assets" className="mt-0">
              <AssetsTab
                subTab={assetsSubTab}
                onSubTabChange={handleAssetsSubTabChange}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
