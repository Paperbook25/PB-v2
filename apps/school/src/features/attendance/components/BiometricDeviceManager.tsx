import { useState } from 'react'
import { Fingerprint, Wifi, RefreshCw, Plus, Loader2, CheckCircle, XCircle, AlertTriangle, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useBiometricDevices, useRegisterBiometricDevice, useBiometricSyncLogs, useTriggerBiometricSync } from '../hooks/useAttendance'
import { BIOMETRIC_TYPE_LABELS, BIOMETRIC_STATUS_LABELS } from '../types/attendance.types'
import type { BiometricDeviceType, BiometricDeviceStatus } from '../types/attendance.types'

const ALL_DEVICE_TYPES: BiometricDeviceType[] = ['fingerprint', 'facial', 'rfid', 'iris']

const DEVICE_TYPE_ICONS: Record<BiometricDeviceType, React.ReactNode> = {
  fingerprint: <Fingerprint className="h-5 w-5" />,
  facial: <Server className="h-5 w-5" />,
  rfid: <Wifi className="h-5 w-5" />,
  iris: <Server className="h-5 w-5" />,
}

const STATUS_COLORS: Record<BiometricDeviceStatus, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  error: 'bg-red-500',
  maintenance: 'bg-yellow-500',
}

const STATUS_BADGE_VARIANTS: Record<BiometricDeviceStatus, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'success',
  inactive: 'secondary',
  error: 'destructive',
  maintenance: 'warning',
}

export function BiometricDeviceManager() {
  const { toast } = useToast()

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [syncLogDeviceFilter, setSyncLogDeviceFilter] = useState<string>('all')
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null)

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    type: 'fingerprint' as BiometricDeviceType,
    location: '',
    model: '',
    serialNumber: '',
    ipAddress: '',
  })

  // Queries
  const { data: devices, isLoading: devicesLoading } = useBiometricDevices()
  const { data: syncLogs, isLoading: syncLogsLoading } = useBiometricSyncLogs(
    syncLogDeviceFilter !== 'all' ? syncLogDeviceFilter : undefined
  )

  // Mutations
  const registerDevice = useRegisterBiometricDevice()
  const triggerSync = useTriggerBiometricSync()

  const handleSync = (deviceId: string) => {
    setSyncingDeviceId(deviceId)
    triggerSync.mutate(deviceId, {
      onSuccess: () => {
        toast({
          title: 'Sync Triggered',
          description: 'Device sync has been initiated successfully.',
        })
        setSyncingDeviceId(null)
      },
      onError: () => {
        toast({
          title: 'Sync Failed',
          description: 'Failed to trigger device sync. Please try again.',
          variant: 'destructive',
        })
        setSyncingDeviceId(null)
      },
    })
  }

  const handleRegisterDevice = () => {
    if (!registerForm.name.trim() || !registerForm.location.trim() || !registerForm.model.trim() || !registerForm.serialNumber.trim() || !registerForm.ipAddress.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    registerDevice.mutate(registerForm, {
      onSuccess: () => {
        toast({
          title: 'Device Registered',
          description: `${registerForm.name} has been registered successfully.`,
        })
        setRegisterDialogOpen(false)
        setRegisterForm({
          name: '',
          type: 'fingerprint',
          location: '',
          model: '',
          serialNumber: '',
          ipAddress: '',
        })
      },
      onError: () => {
        toast({
          title: 'Registration Failed',
          description: 'Failed to register the device. Please try again.',
          variant: 'destructive',
        })
      },
    })
  }

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>
      case 'partial':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="devices" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          </TabsList>

          <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Register Device
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New Device</DialogTitle>
                <DialogDescription>
                  Add a new biometric attendance device to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    id="device-name"
                    placeholder="e.g., Main Entrance Scanner"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select
                    value={registerForm.type}
                    onValueChange={(value) =>
                      setRegisterForm((prev) => ({ ...prev, type: value as BiometricDeviceType }))
                    }
                  >
                    <SelectTrigger id="device-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_DEVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {BIOMETRIC_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-location">Location</Label>
                  <Input
                    id="device-location"
                    placeholder="e.g., Main Gate"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-model">Model</Label>
                  <Input
                    id="device-model"
                    placeholder="e.g., ZKTeco K40"
                    value={registerForm.model}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, model: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-serial">Serial Number</Label>
                  <Input
                    id="device-serial"
                    placeholder="e.g., SN-12345678"
                    value={registerForm.serialNumber}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-ip">IP Address</Label>
                  <Input
                    id="device-ip"
                    placeholder="e.g., 192.168.1.100"
                    value={registerForm.ipAddress}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setRegisterDialogOpen(false)}
                    disabled={registerDevice.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegisterDevice}
                    disabled={registerDevice.isPending}
                  >
                    {registerDevice.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register Device'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          {devicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !devices || devices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Fingerprint className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No biometric devices registered</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Register Device" to add your first device.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => {
                const capacityPercentage = device.totalCapacity > 0
                  ? Math.round((device.enrolledStudents / device.totalCapacity) * 100)
                  : 0
                const isSyncing = syncingDeviceId === device.id && triggerSync.isPending

                return (
                  <Card key={device.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            device.status === 'active'
                              ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200'
                              : device.status === 'error'
                              ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200'
                              : device.status === 'maintenance'
                              ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200'
                          )}>
                            {DEVICE_TYPE_ICONS[device.type]}
                          </div>
                          <div>
                            <CardTitle className="text-base">{device.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {device.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={STATUS_BADGE_VARIANTS[device.status]}>
                          <span className={cn('h-2 w-2 rounded-full mr-1.5', STATUS_COLORS[device.status])} />
                          {BIOMETRIC_STATUS_LABELS[device.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {BIOMETRIC_TYPE_LABELS[device.type]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model</span>
                          <p className="font-medium truncate">{device.model}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">IP Address</span>
                          <p className="font-medium">{device.ipAddress}</p>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Enrolled</span>
                          <span className="font-medium">
                            {device.enrolledStudents} / {device.totalCapacity}
                          </span>
                        </div>
                        <Progress
                          value={capacityPercentage}
                          className={cn(
                            'h-2',
                            capacityPercentage > 90 && '[&>div]:bg-red-500',
                            capacityPercentage > 70 && capacityPercentage <= 90 && '[&>div]:bg-yellow-500'
                          )}
                        />
                      </div>

                      {/* Last Sync */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Sync: </span>
                        <span className="font-medium">
                          {device.lastSyncAt
                            ? new Date(device.lastSyncAt).toLocaleString()
                            : 'Never'}
                        </span>
                      </div>

                      {/* Error Message */}
                      {device.errorMessage && (
                        <div className="text-sm text-red-600 dark:text-red-200 bg-red-50 dark:bg-red-800 p-2 rounded-md">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {device.errorMessage}
                        </div>
                      )}

                      {/* Sync Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleSync(device.id)}
                        disabled={isSyncing || device.status === 'inactive'}
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="sync-logs" className="space-y-4">
          {/* Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Filter by Device</Label>
                  <Select value={syncLogDeviceFilter} onValueChange={setSyncLogDeviceFilter}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="All Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {devices?.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sync Logs</CardTitle>
              <CardDescription>History of biometric device synchronizations</CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !syncLogs || syncLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No sync logs found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Synced At</TableHead>
                        <TableHead className="text-center">Records Processed</TableHead>
                        <TableHead className="text-center">Records Failed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.deviceName}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(log.syncedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">{log.recordsProcessed}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn(log.recordsFailed > 0 && 'text-red-600 font-medium')}>
                              {log.recordsFailed}
                            </span>
                          </TableCell>
                          <TableCell>{getSyncStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDuration(log.duration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
