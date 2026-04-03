import { useState, useEffect } from 'react'
import { Save, Loader2, Bell, Clock, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { apiGet, apiPut } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface AttendancePolicy {
  id: string
  minimumPercentage: number
  warningPercentage: number
  consecutiveAbsenceDays: number
  examEligibilityPercentage: number
  notifyParent: boolean
  notifyTeacher: boolean
  notifyPrincipal: boolean
  enabled: boolean
  schoolStartTime: string | null
  lateAfterMinutes: number
  halfDayAfterTime: string | null
  lateDetectionEnabled: boolean
}

function useAttendancePolicy() {
  return useQuery({
    queryKey: ['settings', 'attendance-policy'],
    queryFn: () => apiGet<{ data: AttendancePolicy }>('/api/attendance/policies'),
  })
}

export function AttendancePolicySettings() {
  const { data: response, isLoading } = useAttendancePolicy()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [form, setForm] = useState<Partial<AttendancePolicy>>({})
  const [isDirty, setIsDirty] = useState(false)

  const policy = response?.data

  useEffect(() => {
    if (policy) {
      setForm(policy)
      setIsDirty(false)
    }
  }, [policy])

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: Partial<AttendancePolicy>) =>
      apiPut<{ data: AttendancePolicy }>('/api/attendance/policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'attendance-policy'] })
      toast({ title: 'Attendance policy saved successfully' })
      setIsDirty(false)
    },
    onError: () => {
      toast({ title: 'Failed to save attendance policy', variant: 'destructive' })
    },
  })

  const handleSave = () => {
    const { id, ...data } = form
    saveMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance Policy</h2>
          <p className="text-sm text-muted-foreground">Configure attendance thresholds, alerts, and late detection rules</p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Threshold Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5" />
            Attendance Thresholds
          </CardTitle>
          <CardDescription>Set minimum attendance requirements and alert triggers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Attendance Policy</Label>
            <Switch checked={form.enabled ?? true} onCheckedChange={(v) => update('enabled', v)} />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Attendance (%)</Label>
              <Input type="number" min={0} max={100} value={form.minimumPercentage ?? 75} onChange={(e) => update('minimumPercentage', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Students below this will trigger critical alerts</p>
            </div>
            <div className="space-y-2">
              <Label>Warning Threshold (%)</Label>
              <Input type="number" min={0} max={100} value={form.warningPercentage ?? 85} onChange={(e) => update('warningPercentage', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Students below this will get warning alerts</p>
            </div>
            <div className="space-y-2">
              <Label>Exam Eligibility (%)</Label>
              <Input type="number" min={0} max={100} value={form.examEligibilityPercentage ?? 80} onChange={(e) => update('examEligibilityPercentage', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Minimum attendance required to sit for exams</p>
            </div>
            <div className="space-y-2">
              <Label>Consecutive Absence Days</Label>
              <Input type="number" min={1} max={30} value={form.consecutiveAbsenceDays ?? 3} onChange={(e) => update('consecutiveAbsenceDays', parseInt(e.target.value) || 1)} />
              <p className="text-xs text-muted-foreground">Alert after this many consecutive absences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            Alert Notifications
          </CardTitle>
          <CardDescription>Choose who gets notified when attendance drops below thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify Parents</Label>
              <p className="text-xs text-muted-foreground">Send alerts to parents when child's attendance is low</p>
            </div>
            <Switch checked={form.notifyParent ?? true} onCheckedChange={(v) => update('notifyParent', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify Class Teacher</Label>
              <p className="text-xs text-muted-foreground">Alert the class teacher about student absences</p>
            </div>
            <Switch checked={form.notifyTeacher ?? true} onCheckedChange={(v) => update('notifyTeacher', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify Principal</Label>
              <p className="text-xs text-muted-foreground">Send critical alerts to the principal</p>
            </div>
            <Switch checked={form.notifyPrincipal ?? true} onCheckedChange={(v) => update('notifyPrincipal', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Late Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Late Detection
          </CardTitle>
          <CardDescription>Configure when students are considered late or half-day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Late Detection</Label>
            <Switch checked={form.lateDetectionEnabled ?? false} onCheckedChange={(v) => update('lateDetectionEnabled', v)} />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>School Start Time</Label>
              <Input type="time" value={form.schoolStartTime ?? '09:00'} onChange={(e) => update('schoolStartTime', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Late After (minutes)</Label>
              <Input type="number" min={0} max={120} value={form.lateAfterMinutes ?? 15} onChange={(e) => update('lateAfterMinutes', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Half-Day After</Label>
              <Input type="time" value={form.halfDayAfterTime ?? '12:00'} onChange={(e) => update('halfDayAfterTime', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
