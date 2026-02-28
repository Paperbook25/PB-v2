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
    <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as TransportSubTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        <TabsTrigger variant="secondary" value="routes" className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 hidden sm:block" />
          Routes
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="vehicles" className="flex items-center gap-2">
          <Bus className="h-4 w-4 hidden sm:block" />
          Vehicles
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="drivers" className="flex items-center gap-2">
          <Users className="h-4 w-4 hidden sm:block" />
          Drivers
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="tracking" className="flex items-center gap-2">
          <Navigation className="h-4 w-4 hidden sm:block" />
          Tracking
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="stops" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 hidden sm:block" />
          Stops
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="maintenance" className="flex items-center gap-2">
          <Wrench className="h-4 w-4 hidden sm:block" />
          Maintenance
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4 hidden sm:block" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="routes" className="mt-0">
          <RouteManager />
        </TabsContent>

        <TabsContent value="vehicles" className="mt-0">
          <VehicleManager />
        </TabsContent>

        <TabsContent value="drivers" className="mt-0">
          <DriverManager />
        </TabsContent>

        <TabsContent value="tracking" className="mt-0">
          <LiveTrackingView />
        </TabsContent>

        <TabsContent value="stops" className="mt-0">
          <StopAssignmentView />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <MaintenanceTracker />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <TransportNotificationsView />
        </TabsContent>
      </div>
    </Tabs>
  )
}
