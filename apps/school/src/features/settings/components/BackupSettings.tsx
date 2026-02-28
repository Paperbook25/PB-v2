import { Database, Loader2, Download, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useBackupConfig, useUpdateBackupConfig, useTriggerBackup } from '../hooks/useSettings'
import type { BackupConfig } from '../types/settings.types'

export function BackupSettings() {
  const { toast } = useToast()
  const { data, isLoading } = useBackupConfig()
  const updateConfig = useUpdateBackupConfig()
  const triggerBackup = useTriggerBackup()

  const handleUpdateConfig = (updates: Partial<BackupConfig>) => {
    updateConfig.mutate(updates, {
      onSuccess: () => {
        toast({
          title: 'Settings Updated',
          description: 'Backup configuration has been saved.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update settings',
          variant: 'destructive',
        })
      },
    })
  }

  const handleTriggerBackup = () => {
    triggerBackup.mutate(undefined, {
      onSuccess: (result) => {
        toast({
          title: 'Backup Complete',
          description: result.message,
        })
      },
      onError: (error) => {
        toast({
          title: 'Backup Failed',
          description: error instanceof Error ? error.message : 'Failed to trigger backup',
          variant: 'destructive',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const config = data?.data

  if (!config) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup & Recovery
        </CardTitle>
        <CardDescription>Configure automatic backups and data recovery options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last Backup Info */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Last Backup</p>
                <p className="text-sm text-muted-foreground">
                  {config.lastBackupAt ? formatDate(config.lastBackupAt) : 'No backup yet'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleTriggerBackup}
              disabled={triggerBackup.isPending}
            >
              {triggerBackup.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Backing up...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Backup Now
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Auto Backup Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoBackup">Automatic Backup</Label>
            <p className="text-sm text-muted-foreground">Enable scheduled automatic backups</p>
          </div>
          <Switch
            id="autoBackup"
            checked={config.autoBackup}
            onCheckedChange={(checked) => handleUpdateConfig({ autoBackup: checked })}
          />
        </div>

        {/* Backup Frequency */}
        <div className="space-y-2">
          <Label>Backup Frequency</Label>
          <Select
            value={config.backupFrequency}
            onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
              handleUpdateConfig({ backupFrequency: value })
            }
            disabled={!config.autoBackup}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How often automatic backups should run
          </p>
        </div>

        {/* Retention Period */}
        <div className="space-y-2">
          <Label htmlFor="retentionDays">Retention Period (days)</Label>
          <Input
            id="retentionDays"
            type="number"
            value={config.backupRetentionDays}
            onChange={(e) =>
              handleUpdateConfig({ backupRetentionDays: parseInt(e.target.value) || 30 })
            }
            min={7}
            max={365}
            className="w-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            How long to keep backup files before automatic deletion
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
