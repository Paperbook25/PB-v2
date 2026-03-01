import { useSearchParams } from 'react-router-dom'
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

  return (
    <div>
      <PageHeader
        title="Operations"
        description="Manage transport, hostel, and assets"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Operations' }]}
        moduleColor="operations"
      />

      {/* Content — switched by sidebar ?tab= and ?subtab= params */}
      <div className="mt-6">
        {activeTab === 'transport' && canAccessTransport && (
          <TransportTab
            subTab={transportSubTab}
            onSubTabChange={handleTransportSubTabChange}
          />
        )}

        {activeTab === 'hostel' && canAccessHostel && (
          <HostelTab
            subTab={hostelSubTab}
            onSubTabChange={handleHostelSubTabChange}
          />
        )}

        {activeTab === 'assets' && canAccessAssets && (
          <AssetsTab
            subTab={assetsSubTab}
            onSubTabChange={handleAssetsSubTabChange}
          />
        )}
      </div>
    </div>
  )
}
