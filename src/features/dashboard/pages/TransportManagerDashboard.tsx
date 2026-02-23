import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  Bus,
  Users,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Wrench,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function TransportManagerDashboard() {
  const { user } = useAuthStore()

  // Fetch transport-specific stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'transport-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/transport-stats')
      return json.data
    },
  })

  // Fetch fleet status
  const { data: fleetStatus } = useQuery({
    queryKey: ['dashboard', 'fleet-status'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/fleet-status')
      return json.data
    },
  })

  // Fetch maintenance alerts
  const { data: maintenanceAlerts } = useQuery({
    queryKey: ['dashboard', 'maintenance-alerts'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/maintenance-alerts')
      return json.data
    },
  })

  // Fetch route performance
  const { data: routePerformance } = useQuery({
    queryKey: ['dashboard', 'route-performance'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/route-performance')
      return json.data
    },
  })

  // Fetch driver status
  const { data: drivers } = useQuery({
    queryKey: ['dashboard', 'driver-status'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/driver-status')
      return json.data
    },
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Transport Manager'}!`}
        description={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - Transport Overview`}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vehicles</p>
                    <p className="text-2xl font-bold">{stats?.totalVehicles || 0}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats?.activeVehicles || 0} active
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800">
                    <Bus className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/transport">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Routes</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.activeRoutes || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.totalStudents || 0} students
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-800">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/transport/maintenance">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Maintenance Due</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.maintenanceDue || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        vehicles need service
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-800">
                      <Wrench className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/transport/drivers">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Drivers</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats?.totalDrivers || 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats?.availableDrivers || 0} available
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-800">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Fleet Status & Actions */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Fleet Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Fleet Status
            </CardTitle>
            <CardDescription>Current status of all vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {fleetStatus?.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    vehicle.status === 'active' && 'border-green-200 bg-green-50 dark:bg-green-800 dark:border-green-700',
                    vehicle.status === 'maintenance' && 'border-orange-200 bg-orange-50 dark:bg-orange-800 dark:border-orange-700',
                    vehicle.status === 'inactive' && 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{vehicle.registrationNumber}</span>
                    <Badge
                      variant={
                        vehicle.status === 'active' ? 'default' :
                        vehicle.status === 'maintenance' ? 'secondary' : 'outline'
                      }
                      className={cn(
                        vehicle.status === 'active' && 'bg-green-500',
                        vehicle.status === 'maintenance' && 'bg-orange-500 text-white'
                      )}
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{vehicle.routeName}</p>
                  <p className="text-xs text-muted-foreground">Driver: {vehicle.driverName}</p>
                </div>
              ))}
              {(!fleetStatus || fleetStatus.length === 0) && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Bus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No vehicles found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/transport/tracking">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Live Tracking</span>
                </Button>
              </Link>
              <Link to="/transport/vehicles">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Bus className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Manage Vehicles</span>
                </Button>
              </Link>
              <Link to="/transport/stops">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Stop Assignments</span>
                </Button>
              </Link>
              <Link to="/transport/maintenance">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Maintenance</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts & Route Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maintenance Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Maintenance Alerts
              </CardTitle>
              <CardDescription>Vehicles requiring attention</CardDescription>
            </div>
            <Link to="/transport/maintenance">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts?.slice(0, 5).map((alert: any) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center justify-between p-3 border rounded-lg',
                    alert.priority === 'high' && 'border-red-200 bg-red-50 dark:bg-red-800 dark:border-red-700',
                    alert.priority === 'medium' && 'border-orange-200 bg-orange-50 dark:bg-orange-800 dark:border-orange-700',
                    alert.priority === 'low' && 'border-yellow-200 bg-yellow-50 dark:bg-yellow-800 dark:border-yellow-700'
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{alert.vehicleNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.issue} | Due: {formatDate(alert.dueDate)}
                    </p>
                  </div>
                  <Badge
                    variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-[10px]"
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
              {(!maintenanceAlerts || maintenanceAlerts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No maintenance alerts!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Route Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Route Performance
              </CardTitle>
              <CardDescription>On-time arrival rates</CardDescription>
            </div>
            <Link to="/transport">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routePerformance?.slice(0, 5).map((route: any) => (
                <div key={route.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{route.name}</span>
                    <span className={cn(
                      route.onTimeRate >= 90 ? 'text-green-600' :
                      route.onTimeRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {route.onTimeRate}% on-time
                    </span>
                  </div>
                  <Progress value={route.onTimeRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {route.totalStudents} students | {route.totalStops} stops
                  </p>
                </div>
              ))}
              {(!routePerformance || routePerformance.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No route data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
