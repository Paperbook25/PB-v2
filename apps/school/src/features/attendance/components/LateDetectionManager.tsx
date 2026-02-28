import { useState } from 'react'
import { Clock, TrendingDown, TrendingUp, Minus, AlertTriangle, Loader2, Settings, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useLateRecords, useLatePatterns, useLatePolicy, useUpdateLatePolicy } from '../hooks/useAttendance'
import { CLASSES } from '../types/attendance.types'

export function LateDetectionManager() {
  const { toast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState('records')

  // Filter state for late records
  const [selectedClass, setSelectedClass] = useState<string>('')

  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    schoolStartTime: '',
    lateAfterMinutes: 0,
    halfDayAfterTime: '',
    enabled: true,
  })
  const [policyInitialized, setPolicyInitialized] = useState(false)

  // Data hooks
  const { data: lateRecords, isLoading: recordsLoading } = useLateRecords(
    selectedClass ? { className: selectedClass } : undefined
  )
  const { data: latePatterns, isLoading: patternsLoading } = useLatePatterns()
  const { data: latePolicy, isLoading: policyLoading } = useLatePolicy()
  const updatePolicy = useUpdateLatePolicy()

  // Initialize policy form from fetched data
  if (latePolicy && !policyInitialized) {
    setPolicyForm({
      schoolStartTime: latePolicy.schoolStartTime,
      lateAfterMinutes: latePolicy.lateAfterMinutes,
      halfDayAfterTime: latePolicy.halfDayAfterTime,
      enabled: latePolicy.enabled,
    })
    setPolicyInitialized(true)
  }

  // Sort late records by date (most recent first)
  const sortedRecords = [...(lateRecords || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleSavePolicy = async () => {
    try {
      await updatePolicy.mutateAsync({
        schoolStartTime: policyForm.schoolStartTime,
        lateAfterMinutes: policyForm.lateAfterMinutes,
        halfDayAfterTime: policyForm.halfDayAfterTime,
        enabled: policyForm.enabled,
      })
      toast({
        title: 'Policy Updated',
        description: 'Late detection policy has been saved successfully.',
      })
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Failed to update late detection policy. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'stable':
        return <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
    }
  }

  const getTrendLabel = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'Improving'
      case 'stable':
        return 'Stable'
      case 'worsening':
        return 'Worsening'
    }
  }

  const getTrendColor = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400'
      case 'stable':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'worsening':
        return 'text-red-600 dark:text-red-400'
    }
  }

  const getLateColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600 dark:text-red-400 font-semibold'
    if (minutes > 15) return 'text-yellow-600 dark:text-yellow-400 font-semibold'
    return ''
  }

  const getLateRowClass = (minutes: number) => {
    if (minutes > 30) return 'bg-red-50 dark:bg-red-900/40'
    if (minutes > 15) return 'bg-yellow-50 dark:bg-yellow-900/40'
    return ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-200" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Late Detection Manager</h2>
          <p className="text-sm text-muted-foreground">
            Monitor late arrivals and analyze patterns
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">
            <Clock className="h-4 w-4 mr-2" />
            Late Records
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Settings className="h-4 w-4 mr-2" />
            Patterns & Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Late Records */}
        <TabsContent value="records" className="space-y-4">
          {/* Class Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-end gap-4">
                <div>
                  <Label className="mb-1 block">Filter by Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedClass && selectedClass !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClass('')}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Late Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Late Arrival Records</CardTitle>
              <CardDescription>
                Students who arrived after the designated school start time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sortedRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No late records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class / Section</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Late By (min)</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className={getLateRowClass(record.lateByMinutes)}
                      >
                        <TableCell className="font-medium">
                          {record.studentName}
                        </TableCell>
                        <TableCell>
                          {record.className} - {record.section}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.arrivalTime}</TableCell>
                        <TableCell
                          className={getLateColor(record.lateByMinutes)}
                        >
                          {record.lateByMinutes} min
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {record.reason || '-'}
                        </TableCell>
                        <TableCell>
                          {record.isHabitual ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Habitual
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Occasional</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Patterns & Settings */}
        <TabsContent value="patterns" className="space-y-6">
          {/* Late Policy Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">
                    Late Policy Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure school timing and late detection rules
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {policyLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolStartTime">School Start Time</Label>
                      <Input
                        id="schoolStartTime"
                        type="time"
                        value={policyForm.schoolStartTime}
                        onChange={(e) =>
                          setPolicyForm((prev) => ({
                            ...prev,
                            schoolStartTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lateAfterMinutes">
                        Late After (minutes)
                      </Label>
                      <Input
                        id="lateAfterMinutes"
                        type="number"
                        min={0}
                        value={policyForm.lateAfterMinutes}
                        onChange={(e) =>
                          setPolicyForm((prev) => ({
                            ...prev,
                            lateAfterMinutes: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="halfDayAfterTime">
                        Half-Day After Time
                      </Label>
                      <Input
                        id="halfDayAfterTime"
                        type="time"
                        value={policyForm.halfDayAfterTime}
                        onChange={(e) =>
                          setPolicyForm((prev) => ({
                            ...prev,
                            halfDayAfterTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="space-y-0.5">
                      <Label>Enable Late Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically flag students arriving after the
                        configured time
                      </p>
                    </div>
                    <Switch
                      checked={policyForm.enabled}
                      onCheckedChange={(checked) =>
                        setPolicyForm((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePolicy}
                      disabled={updatePolicy.isPending}
                    >
                      {updatePolicy.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Policy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habitual Latecomers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-base font-semibold">Habitual Latecomers</h3>
            </div>

            {patternsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : !latePatterns || latePatterns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No late pattern data available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latePatterns.map((student) => (
                  <Card key={student.studentId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.className} - {student.section}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.isHabitual && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Habitual
                            </Badge>
                          )}
                          <div
                            className={cn(
                              'flex items-center gap-1 text-sm font-medium',
                              getTrendColor(student.trend)
                            )}
                          >
                            {getTrendIcon(student.trend)}
                            <span>{getTrendLabel(student.trend)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xl font-bold">
                            {student.totalLateDays}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Late Days
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xl font-bold">
                            {student.averageLateMinutes}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avg Late (min)
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xl font-bold">
                            {student.lateCount30Days}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last 30 Days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
