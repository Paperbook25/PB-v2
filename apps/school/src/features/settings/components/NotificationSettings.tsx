import { useEffect } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/useSettings'
import type { NotificationPreferences } from '../types/settings.types'

interface NotificationSettingProps {
  id: keyof NotificationPreferences
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function NotificationSetting({ id, label, description, checked, onCheckedChange }: NotificationSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export function NotificationSettings() {
  const { toast } = useToast()
  const { data, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferences.mutate(
      { [key]: value },
      {
        onSuccess: () => {
          toast({
            title: 'Settings Updated',
            description: 'Notification preferences have been saved.',
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update settings',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const prefs = data?.data

  if (!prefs) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Configure how and when notifications are sent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Channels</h4>
          <NotificationSetting
            id="emailNotifications"
            label="Email Notifications"
            description="Receive notifications via email"
            checked={prefs.emailNotifications}
            onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
          />
          <NotificationSetting
            id="smsNotifications"
            label="SMS Notifications"
            description="Receive notifications via SMS"
            checked={prefs.smsNotifications}
            onCheckedChange={(checked) => handleToggle('smsNotifications', checked)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notification Types</h4>
          <NotificationSetting
            id="feeReminders"
            label="Fee Reminders"
            description="Send fee payment reminders to parents"
            checked={prefs.feeReminders}
            onCheckedChange={(checked) => handleToggle('feeReminders', checked)}
          />
          <NotificationSetting
            id="attendanceAlerts"
            label="Attendance Alerts"
            description="Alert parents when students are absent"
            checked={prefs.attendanceAlerts}
            onCheckedChange={(checked) => handleToggle('attendanceAlerts', checked)}
          />
          <NotificationSetting
            id="examResults"
            label="Exam Results"
            description="Notify parents about exam results"
            checked={prefs.examResults}
            onCheckedChange={(checked) => handleToggle('examResults', checked)}
          />
          <NotificationSetting
            id="generalAnnouncements"
            label="General Announcements"
            description="Send school announcements and updates"
            checked={prefs.generalAnnouncements}
            onCheckedChange={(checked) => handleToggle('generalAnnouncements', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
