import { RouteManager } from '@/features/transport/components/RouteManager'
import { VehicleManager } from '@/features/transport/components/VehicleManager'
import { DriverManager } from '@/features/transport/components/DriverManager'
import { LiveTrackingView } from '@/features/transport/components/LiveTrackingView'
import { StopAssignmentView } from '@/features/transport/components/StopAssignmentView'
import { MaintenanceTracker } from '@/features/transport/components/MaintenanceTracker'
import { TransportNotificationsView } from '@/features/transport/components/TransportNotificationsView'
import type { TransportSubTab } from '../types/operations.types'

interface TransportTabProps {
  subTab: TransportSubTab
  onSubTabChange: (value: TransportSubTab) => void
}

export function TransportTab({ subTab, onSubTabChange }: TransportTabProps) {
  return (
    <div className="mt-6">
      {subTab === 'routes' && <RouteManager />}
      {subTab === 'vehicles' && <VehicleManager />}
      {subTab === 'drivers' && <DriverManager />}
      {subTab === 'tracking' && <LiveTrackingView />}
      {subTab === 'stops' && <StopAssignmentView />}
      {subTab === 'maintenance' && <MaintenanceTracker />}
      {subTab === 'notifications' && <TransportNotificationsView />}
    </div>
  )
}
