import { useState } from 'react'
import { Clock, ShieldCheck, CalendarDays, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

interface PoliciesSetupStepProps {
  onNext: () => void
  onBack: () => void
}

export function PoliciesSetupStep({ onNext, onBack }: PoliciesSetupStepProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // School Timings
  const [schoolStartTime, setSchoolStartTime] = useState('09:00')
  const [schoolEndTime, setSchoolEndTime] = useState('15:30')

  // Attendance
  const [minimumAttendance, setMinimumAttendance] = useState(75)
  const [lateAfterMinutes, setLateAfterMinutes] = useState(15)
  const [enableAlerts, setEnableAlerts] = useState(true)

  // Leave
  const [defaultEL, setDefaultEL] = useState(15)
  const [defaultCL, setDefaultCL] = useState(12)
  const [defaultSL, setDefaultSL] = useState(12)
  const [defaultPL, setDefaultPL] = useState(7)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/onboarding/quick-setup-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          schoolStartTime,
          schoolEndTime,
          minimumAttendance,
          lateAfterMinutes,
          enableAlerts,
          defaultEL,
          defaultCL,
          defaultSL,
          defaultPL,
        }),
      })

      if (!response.ok) throw new Error('Failed to save policies')

      setSaved(true)
      toast({ title: 'Policies configured successfully' })
    } catch {
      toast({ title: 'Failed to save policies', description: 'You can configure these later in Settings.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Generate period preview
  const generatePeriodPreview = () => {
    const startMin = timeToMin(schoolStartTime)
    const endMin = timeToMin(schoolEndTime)
    const periods: string[] = []
    let current = startMin
    let num = 1

    // Assembly
    periods.push(`Assembly: ${minToTime(current - 15)}-${minToTime(current)}`)

    while (current + 40 <= endMin && num <= 8) {
      if (num === 4) periods.push(`Break: ${minToTime(current)}-${minToTime(current + 15)}`)
      if (num === 4) current += 15
      if (num === 6) periods.push(`Lunch: ${minToTime(current)}-${minToTime(current + 30)}`)
      if (num === 6) current += 30

      periods.push(`Period ${num}: ${minToTime(current)}-${minToTime(current + 40)}`)
      current += 40
      num++
    }
    return periods
  }

  const periodPreview = generatePeriodPreview()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">School Policies</h2>
        <p className="text-muted-foreground mt-1">Set up timings, attendance rules, and leave allocation. You can adjust these later in Settings.</p>
      </div>

      {/* School Timings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-blue-500" />
            School Timings
          </CardTitle>
          <CardDescription>Define your school hours — periods will be auto-generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={schoolStartTime} onChange={(e) => setSchoolStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={schoolEndTime} onChange={(e) => setSchoolEndTime(e.target.value)} />
            </div>
          </div>

          {/* Period Preview */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Auto-generated schedule preview:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
              {periodPreview.map((p, i) => (
                <span key={i} className={`px-2 py-1 rounded ${p.startsWith('Period') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : p.startsWith('Break') || p.startsWith('Lunch') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'}`}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Attendance Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Attendance (%)</Label>
              <Input type="number" min={50} max={100} value={minimumAttendance} onChange={(e) => setMinimumAttendance(parseInt(e.target.value) || 75)} />
            </div>
            <div className="space-y-2">
              <Label>Late After (minutes)</Label>
              <Input type="number" min={0} max={60} value={lateAfterMinutes} onChange={(e) => setLateAfterMinutes(parseInt(e.target.value) || 15)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Shortage Alerts</Label>
              <p className="text-xs text-muted-foreground">Notify parents & teachers when attendance drops</p>
            </div>
            <Switch checked={enableAlerts} onCheckedChange={setEnableAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Staff Leave Allocation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-green-500" />
            Staff Leave Allocation (per year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Earned Leave</Label>
              <Input type="number" min={0} max={60} value={defaultEL} onChange={(e) => setDefaultEL(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Casual Leave</Label>
              <Input type="number" min={0} max={60} value={defaultCL} onChange={(e) => setDefaultCL(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sick Leave</Label>
              <Input type="number" min={0} max={60} value={defaultSL} onChange={(e) => setDefaultSL(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Privilege Leave</Label>
              <Input type="number" min={0} max={60} value={defaultPL} onChange={(e) => setDefaultPL(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="flex gap-2">
          {!saved && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Policies
            </Button>
          )}
          <Button onClick={onNext} variant={saved ? 'default' : 'outline'}>
            {saved && <CheckCircle className="h-4 w-4 mr-2" />}
            {saved ? 'Continue' : 'Skip for now'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
