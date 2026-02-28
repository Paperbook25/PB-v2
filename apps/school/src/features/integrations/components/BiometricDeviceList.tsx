import { useState } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Trash2,
  MoreHorizontal,
  Loader2,
  Fingerprint,
  ScanFace,
  CreditCard,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { BiometricDevice, DeviceStatus, DeviceType } from '../types/integrations.types'
import { BIOMETRIC_PROVIDER_LABELS, DEVICE_TYPE_LABELS } from '../types/integrations.types'

interface BiometricDeviceListProps {
  devices: BiometricDevice[]
  onEdit: (device: BiometricDevice) => void
  onDelete: (id: string) => void
  onSync: (id: string) => Promise<void>
  syncingDeviceId?: string | null
}

const statusConfig: Record<DeviceStatus, { icon: React.ElementType; variant: 'success' | 'secondary' | 'destructive' | 'warning' }> = {
  online: { icon: Wifi, variant: 'success' },
  offline: { icon: WifiOff, variant: 'secondary' },
  syncing: { icon: RefreshCw, variant: 'warning' },
  error: { icon: WifiOff, variant: 'destructive' },
}

const deviceTypeIcons: Record<DeviceType, React.ElementType> = {
  fingerprint: Fingerprint,
  face: ScanFace,
  card: CreditCard,
  multi: Layers,
}

export function BiometricDeviceList({
  devices,
  onEdit,
  onDelete,
  onSync,
  syncingDeviceId,
}: BiometricDeviceListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deviceToDelete = devices.find((d) => d.id === deleteId)

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No biometric devices configured. Click "Add Device" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => {
                  const { icon: StatusIcon, variant } = statusConfig[device.status]
                  const TypeIcon = deviceTypeIcons[device.deviceType]
                  const isSyncing = syncingDeviceId === device.id

                  return (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {BIOMETRIC_PROVIDER_LABELS[device.provider]} - {DEVICE_TYPE_LABELS[device.deviceType]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{device.location}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {device.deviceIp}:{device.devicePort}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant} className="flex items-center gap-1 w-fit">
                          {isSyncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <StatusIcon className="h-3 w-3" />
                          )}
                          {isSyncing ? 'Syncing' : device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{device.enrolledCount}</TableCell>
                      <TableCell>
                        {device.lastSyncAt ? (
                          <span className="text-sm">{formatDate(device.lastSyncAt)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onSync(device.id)}
                            disabled={isSyncing || device.status === 'offline'}
                            title="Sync Now"
                          >
                            {isSyncing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(device)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(device.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deviceToDelete?.name}&quot;? This will remove the device configuration but not affect attendance data already synced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
