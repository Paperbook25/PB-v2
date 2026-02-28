import { useState } from 'react'
import { AlertTriangle, Bell, Check, Shield, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAttendanceAlerts, useAcknowledgeAlert, useAttendanceThresholds, useUpdateAttendanceThresholds } from '../hooks/useAttendance'
import type { AlertSeverity, AlertType, AttendanceAlert } from '../types/attendance.types'

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  below_threshold: 'Below Threshold',
  consecutive_absences: 'Consecutive Absences',
  period_shortage: 'Period Shortage',
}

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; className: string; iconClassName: string }> = {
  warning: {
    label: 'Warning',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600',
    iconClassName: 'text-yellow-600 dark:text-yellow-200',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600',
    iconClassName: 'text-red-600 dark:text-red-200',
  },
}

export function ShortageAlertManager() {
  const { toast } = useToast()

  // Filter state
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Build query filters -- only include non-"all" values
  const alertFilters: { severity?: string; type?: string } = {}
  if (severityFilter !== 'all') alertFilters.severity = severityFilter
  if (typeFilter !== 'all') alertFilters.type = typeFilter

  // Queries
  const { data: alerts, isLoading: alertsLoading } = useAttendanceAlerts(alertFilters)
  const { data: thresholds, isLoading: thresholdsLoading } = useAttendanceThresholds()

  // Mutations
  const acknowledgeAlert = useAcknowledgeAlert()
  const updateThresholds = useUpdateAttendanceThresholds()

  // Local threshold form state
  const [thresholdForm, setThresholdForm] = useState<{
    minimumPercentage: number
    warningPercentage: number
    consecutiveAbsenceDays: number
    notifyParent: boolean
    notifyTeacher: boolean
    notifyPrincipal: boolean
    enabled: boolean
  } | null>(null)

  // Initialize form when thresholds load (only on first load or when null)
  const formValues = thresholdForm ?? (thresholds ? {
    minimumPercentage: thresholds.minimumPercentage,
    warningPercentage: thresholds.warningPercentage,
    consecutiveAbsenceDays: thresholds.consecutiveAbsenceDays,
    notifyParent: thresholds.notifyParent,
    notifyTeacher: thresholds.notifyTeacher,
    notifyPrincipal: thresholds.notifyPrincipal,
    enabled: thresholds.enabled,
  } : null)

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert.mutateAsync(alertId)
      toast({
        title: 'Alert Acknowledged',
        description: 'The alert has been acknowledged successfully.',
      })
    } catch {
      toast({
        title: 'Failed to Acknowledge',
        description: 'Could not acknowledge the alert. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveThresholds = async () => {
    if (!formValues) return

    try {
      await updateThresholds.mutateAsync({
        minimumPercentage: formValues.minimumPercentage,
        warningPercentage: formValues.warningPercentage,
        consecutiveAbsenceDays: formValues.consecutiveAbsenceDays,
        notifyParent: formValues.notifyParent,
        notifyTeacher: formValues.notifyTeacher,
        notifyPrincipal: formValues.notifyPrincipal,
        enabled: formValues.enabled,
      })
      toast({
        title: 'Thresholds Updated',
        description: 'Attendance threshold settings have been saved.',
      })
      // Reset local form so it picks up fresh server data on next render
      setThresholdForm(null)
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Failed to update threshold settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const updateFormField = <K extends keyof NonNullable<typeof thresholdForm>>(
    field: K,
    value: NonNullable<typeof thresholdForm>[K]
  ) => {
    if (!formValues) return
    setThresholdForm({ ...formValues, [field]: value })
  }

  const activeAlerts = (alerts ?? []).filter(
    (alert: AttendanceAlert) => !alert.acknowledgedAt
  )
  const acknowledgedAlerts = (alerts ?? []).filter(
    (alert: AttendanceAlert) => !!alert.acknowledgedAt
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Threshold Settings
          </TabsTrigger>
        </TabsList>

        {/* ==================== ALERTS TAB ==================== */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Severity</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="below_threshold">Below Threshold</SelectItem>
                      <SelectItem value="consecutive_absences">Consecutive Absences</SelectItem>
                      <SelectItem value="period_shortage">Period Shortage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <CardTitle className="text-base">Active Alerts</CardTitle>
              </div>
              <CardDescription>
                Attendance shortage alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All attendance levels are within acceptable thresholds.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert: AttendanceAlert) => {
                    const severityConfig = SEVERITY_CONFIG[alert.severity]
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          'border rounded-lg p-4',
                          alert.severity === 'critical'
                            ? 'border-red-200 bg-red-50/50 dark:border-red-700 dark:bg-red-900/50'
                            : 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-700 dark:bg-yellow-900/50'
                        )}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <AlertTriangle
                                className={cn('h-4 w-4 flex-shrink-0', severityConfig.iconClassName)}
                              />
                              <span className="font-medium">{alert.studentName}</span>
                              <Badge variant="outline" className="text-xs">
                                {alert.className} - {alert.section}
                              </Badge>
                              <Badge className={cn('text-xs', severityConfig.className)}>
                                {severityConfig.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {ALERT_TYPE_LABELS[alert.type]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium">
                                Current: {alert.currentPercentage}%
                              </span>
                              <span className="text-sm text-muted-foreground">/</span>
                              <span className="text-sm text-muted-foreground">
                                Threshold: {alert.threshold}%
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={acknowledgeAlert.isPending}
                          >
                            {acknowledgeAlert.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Acknowledge
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acknowledged Alerts */}
          {acknowledgedAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">
                  Acknowledged Alerts ({acknowledgedAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {acknowledgedAlerts.map((alert: AttendanceAlert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium">{alert.studentName}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.className} - {alert.section}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {ALERT_TYPE_LABELS[alert.type]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Acknowledged by {alert.acknowledgedBy} on{' '}
                            {alert.acknowledgedAt
                              ? new Date(alert.acknowledgedAt).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          <Check className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== THRESHOLD SETTINGS TAB ==================== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Threshold Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure attendance thresholds and notification preferences for shortage alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thresholdsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !formValues ? (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to load threshold settings.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Percentage Thresholds */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimumPercentage">
                        Minimum Attendance Percentage
                      </Label>
                      <Input
                        id="minimumPercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={formValues.minimumPercentage}
                        onChange={(e) =>
                          updateFormField('minimumPercentage', Number(e.target.value))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Students below this percentage will trigger a critical alert.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warningPercentage">
                        Warning Percentage
                      </Label>
                      <Input
                        id="warningPercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={formValues.warningPercentage}
                        onChange={(e) =>
                          updateFormField('warningPercentage', Number(e.target.value))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Students below this percentage will trigger a warning alert.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consecutiveAbsenceDays">
                        Consecutive Absence Days
                      </Label>
                      <Input
                        id="consecutiveAbsenceDays"
                        type="number"
                        min={1}
                        max={30}
                        value={formValues.consecutiveAbsenceDays}
                        onChange={(e) =>
                          updateFormField('consecutiveAbsenceDays', Number(e.target.value))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert after this many consecutive absent days.
                      </p>
                    </div>
                  </div>

                  {/* Notification Toggles */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notification Recipients
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <Label htmlFor="notifyParent" className="text-sm font-medium">
                            Notify Parent
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Send alerts to parents
                          </p>
                        </div>
                        <Switch
                          id="notifyParent"
                          checked={formValues.notifyParent}
                          onCheckedChange={(checked) =>
                            updateFormField('notifyParent', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <Label htmlFor="notifyTeacher" className="text-sm font-medium">
                            Notify Teacher
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Send alerts to class teacher
                          </p>
                        </div>
                        <Switch
                          id="notifyTeacher"
                          checked={formValues.notifyTeacher}
                          onCheckedChange={(checked) =>
                            updateFormField('notifyTeacher', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <Label htmlFor="notifyPrincipal" className="text-sm font-medium">
                            Notify Principal
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Send alerts to principal
                          </p>
                        </div>
                        <Switch
                          id="notifyPrincipal"
                          checked={formValues.notifyPrincipal}
                          onCheckedChange={(checked) =>
                            updateFormField('notifyPrincipal', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enable/Disable + Save */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="enabled"
                        checked={formValues.enabled}
                        onCheckedChange={(checked) =>
                          updateFormField('enabled', checked)
                        }
                      />
                      <Label htmlFor="enabled" className="text-sm font-medium">
                        {formValues.enabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                      </Label>
                    </div>
                    <Button
                      onClick={handleSaveThresholds}
                      disabled={updateThresholds.isPending}
                    >
                      {updateThresholds.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
