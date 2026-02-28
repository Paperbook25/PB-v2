import { Bus, MapPin, Clock, Users, Navigation, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGPSTracking, useRoutes } from '../hooks/useTransport'
import { TRIP_STATUS_LABELS } from '../types/transport.types'

export function LiveTrackingView() {
  const { data: result, isLoading, refetch, dataUpdatedAt } = useGPSTracking()
  const { data: routesResult } = useRoutes()

  const positions = result?.data || []
  const routes = routesResult?.data || []

  const getRouteName = (routeId: string) =>
    routes.find((r) => r.id === routeId)?.name || routeId

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {positions.length} active buses. Auto-refreshes every 10 seconds.
          </p>
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdate}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Bus Map</CardTitle>
          <CardDescription>Real-time GPS positions of all active school buses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              {/* Grid lines to simulate map */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(to right, var(--color-muted-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-muted-foreground) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} />

              {/* Bus markers */}
              {positions.map((pos, i) => {
                const xPercent = 15 + (i * 22)
                const yPercent = 20 + (i % 2 === 0 ? 15 : 40)
                return (
                  <div
                    key={pos.routeId}
                    className="absolute group"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Pulse animation */}
                    <div className="absolute inset-0 w-10 h-10 -ml-1 -mt-1 bg-blue-400 rounded-full animate-ping opacity-30" />
                    {/* Bus icon */}
                    <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                      <Bus className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border rounded-lg shadow-lg p-2 text-xs min-w-[180px] z-10">
                      <p className="font-medium">{getRouteName(pos.routeId)}</p>
                      <p className="text-muted-foreground">{pos.driverName}</p>
                      <p className="text-muted-foreground">{pos.speed} km/h</p>
                    </div>
                  </div>
                )
              })}

              {/* School marker */}
              <div className="absolute" style={{ left: '50%', top: '85%', transform: 'translate(-50%, -50%)' }}>
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-center mt-1">School</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bus Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {positions.map((pos) => (
          <Card key={pos.routeId}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{getRouteName(pos.routeId)}</p>
                  <p className="text-sm text-muted-foreground">{pos.driverName}</p>
                </div>
                <Badge variant={pos.tripStatus === 'in_progress' ? 'success' : 'secondary'}>
                  {TRIP_STATUS_LABELS[pos.tripStatus]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="font-medium">{pos.speed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">On Board</p>
                    <p className="font-medium">{pos.studentsOnBoard} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Stop</p>
                    <p className="font-medium text-xs">{pos.currentStop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">ETA to Next</p>
                    <p className="font-medium">{pos.eta} min</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {pos.tripType === 'pickup' ? 'Morning Pickup' : 'Afternoon Drop'}
                </Badge>
                <span className="text-xs text-muted-foreground">Next: {pos.nextStop}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading tracking data...</div>
      )}

      {!isLoading && positions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No buses currently running</div>
      )}
    </div>
  )
}
