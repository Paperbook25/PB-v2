import { useSearchParams } from 'react-router-dom'
import {
  Route as RouteIcon,
  Bus,
  Users,
  MapPin,
  Wrench,
  Bell,
  Navigation,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { RouteManager } from '../components/RouteManager'
import { VehicleManager } from '../components/VehicleManager'
import { DriverManager } from '../components/DriverManager'
import { LiveTrackingView } from '../components/LiveTrackingView'
import { StopAssignmentView } from '../components/StopAssignmentView'
import { MaintenanceTracker } from '../components/MaintenanceTracker'
import { TransportNotificationsView } from '../components/TransportNotificationsView'

// Tab types
type TransportTab = 'routes' | 'vehicles' | 'drivers' | 'tracking' | 'stops' | 'maintenance' | 'notifications'

// ============================================
// Routes Tab Component
// ============================================
function RoutesTab() {
  return <RouteManager />
}

// ============================================
// Vehicles Tab Component
// ============================================
function VehiclesTab() {
  return <VehicleManager />
}

// ============================================
// Drivers Tab Component
// ============================================
function DriversTab() {
  return <DriverManager />
}

// ============================================
// Tracking Tab Component
// ============================================
function TrackingTab() {
  return <LiveTrackingView />
}

// ============================================
// Stops Tab Component
// ============================================
function StopsTab() {
  return <StopAssignmentView />
}

// ============================================
// Maintenance Tab Component
// ============================================
function MaintenanceTab() {
  return <MaintenanceTracker />
}

// ============================================
// Notifications Tab Component
// ============================================
function NotificationsTab() {
  return <TransportNotificationsView />
}

// ============================================
// Main TransportMainPage Component
// ============================================
export function TransportMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Primary tab
  const activeTab = (searchParams.get('tab') as TransportTab) || 'routes'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div>
      <PageHeader
        title="Transport Management"
        description="Manage routes, vehicles, drivers, and live tracking"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Transport' }]}
        moduleColor="transport"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 hidden sm:block" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Bus className="h-4 w-4 hidden sm:block" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="h-4 w-4 hidden sm:block" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="stops" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 hidden sm:block" />
            Stops
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4 hidden sm:block" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="routes" className="mt-0">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="vehicles" className="mt-0">
            <VehiclesTab />
          </TabsContent>

          <TabsContent value="drivers" className="mt-0">
            <DriversTab />
          </TabsContent>

          <TabsContent value="tracking" className="mt-0">
            <TrackingTab />
          </TabsContent>

          <TabsContent value="stops" className="mt-0">
            <StopsTab />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-0">
            <MaintenanceTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
