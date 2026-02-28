import { useState, useMemo } from 'react'
import { Loader2, Clock, BookOpen, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { getAttendanceBorderColor, getAttendanceBadgeVariant } from '@/lib/attendance-ui'
import { usePeriodAttendance, usePeriodDefinitions, useMarkPeriodAttendance, useStudentPeriodSummary } from '../hooks/useAttendance'
import { CLASSES, SECTIONS, ATTENDANCE_STATUS_LABELS, PERIOD_NAMES } from '../types/attendance.types'
import type { AttendanceStatus, PeriodNumber } from '../types/attendance.types'

// The five statuses that can be cycled through in the attendance grid
const CYCLE_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'excused']

function getNextStatus(current: AttendanceStatus): AttendanceStatus {
  const idx = CYCLE_STATUSES.indexOf(current)
  if (idx === -1) return 'present'
  return CYCLE_STATUSES[(idx + 1) % CYCLE_STATUSES.length]
}

function getPercentageColor(pct: number): string {
  if (pct >= 90) return 'text-green-600 dark:text-green-400'
  if (pct >= 75) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function PeriodAttendanceManager() {
  const { toast } = useToast()

  // ---------- Filter state ----------
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodNumber>(1)

  // ---------- Local attendance edits ----------
  const [attendanceEdits, setAttendanceEdits] = useState<Record<string, AttendanceStatus>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // ---------- Active tab ----------
  const [activeTab, setActiveTab] = useState<'marking' | 'summary'>('marking')

  // ---------- Queries ----------
  const { data: periodsData, isLoading: periodsLoading } = usePeriodDefinitions(
    selectedClass,
    selectedSection,
  )

  const { data: periodAttendanceData, isLoading: attendanceLoading } = usePeriodAttendance(
    selectedDate,
    selectedClass,
    selectedSection,
    selectedPeriod,
  )

  const { data: summaryData, isLoading: summaryLoading } = useStudentPeriodSummary(
    selectedClass,
    selectedSection,
  )

  // ---------- Mutation ----------
  const markPeriodAttendance = useMarkPeriodAttendance()

  // ---------- Derived data ----------
  const periods = periodsData ?? []
  const records = periodAttendanceData?.records ?? []
  const summaryStudents = summaryData ?? []

  // Find the definition for the currently selected period
  const activePeriodDef = useMemo(
    () => periods.find((p) => p.period === selectedPeriod),
    [periods, selectedPeriod],
  )

  // Build working attendance map: merge server records with local edits
  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {}
    for (const rec of records) {
      map[rec.studentId] = rec.status
    }
    return { ...map, ...attendanceEdits }
  }, [records, attendanceEdits])

  // Unique student list from records (preserves original order by rollNumber)
  const students = useMemo(() => {
    const seen = new Set<string>()
    return records
      .filter((r) => {
        if (seen.has(r.studentId)) return false
        seen.add(r.studentId)
        return true
      })
      .sort((a, b) => a.rollNumber - b.rollNumber)
  }, [records])

  // Attendance stats for the selected period
  const stats = useMemo(() => {
    const values = students.map((s) => attendanceMap[s.studentId] ?? 'present')
    return {
      total: students.length,
      present: values.filter((v) => v === 'present').length,
      absent: values.filter((v) => v === 'absent').length,
      late: values.filter((v) => v === 'late').length,
    }
  }, [students, attendanceMap])

  // ---------- Handlers ----------
  function handleStatusToggle(studentId: string) {
    const current = attendanceMap[studentId] ?? 'present'
    const next = getNextStatus(current)
    setAttendanceEdits((prev) => ({ ...prev, [studentId]: next }))
    setHasChanges(true)
  }

  function handleMarkAll(status: AttendanceStatus) {
    const bulk: Record<string, AttendanceStatus> = {}
    for (const s of students) {
      bulk[s.studentId] = status
    }
    setAttendanceEdits(bulk)
    setHasChanges(true)
  }

  async function handleSave() {
    if (students.length === 0) return

    const recs = students.map((s) => ({
      studentId: s.studentId,
      status: attendanceMap[s.studentId] ?? 'present',
    }))

    try {
      await markPeriodAttendance.mutateAsync({
        date: selectedDate,
        className: selectedClass,
        section: selectedSection,
        period: selectedPeriod,
        subject: activePeriodDef?.subject ?? '',
        records: recs,
      })
      toast({
        title: 'Attendance Saved',
        description: `Period attendance marked for ${recs.length} students in ${PERIOD_NAMES[selectedPeriod]}.`,
      })
      setAttendanceEdits({})
      setHasChanges(false)
    } catch {
      toast({
        title: 'Save Failed',
        description: 'Failed to save period attendance. Please try again.',
        variant: 'destructive',
      })
    }
  }

  function handlePeriodSelect(period: PeriodNumber) {
    setSelectedPeriod(period)
    setAttendanceEdits({})
    setHasChanges(false)
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* ========== Filter Bar ========== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setAttendanceEdits({})
                  setHasChanges(false)
                }}
                className="w-[160px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Class</label>
              <Select
                value={selectedClass}
                onValueChange={(val) => {
                  setSelectedClass(val)
                  setAttendanceEdits({})
                  setHasChanges(false)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Section</label>
              <Select
                value={selectedSection}
                onValueChange={(val) => {
                  setSelectedSection(val)
                  setAttendanceEdits({})
                  setHasChanges(false)
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Period</label>
              <Select
                value={String(selectedPeriod)}
                onValueChange={(val) => handlePeriodSelect(Number(val) as PeriodNumber)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {([1, 2, 3, 4, 5, 6, 7, 8] as PeriodNumber[]).map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {PERIOD_NAMES[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== Period Schedule Cards ========== */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Period Schedule &mdash; {selectedClass} Section {selectedSection}
        </h3>

        {periodsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-44 shrink-0 rounded-lg" />
            ))}
          </div>
        ) : periods.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No period schedule found for this class and section.
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {periods.map((pd) => {
              const isActive = pd.period === selectedPeriod
              return (
                <button
                  key={pd.period}
                  type="button"
                  onClick={() => handlePeriodSelect(pd.period)}
                  className={cn(
                    'shrink-0 w-44 rounded-lg border p-3 text-left transition-all',
                    'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-border bg-card hover:bg-accent/50',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-sm font-semibold', isActive && 'text-primary')}>
                      {PERIOD_NAMES[pd.period]}
                    </span>
                    {isActive && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {pd.startTime} &ndash; {pd.endTime}
                    </span>
                  </div>
                  {pd.subject && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{pd.subject}</span>
                    </div>
                  )}
                  {pd.teacherName && (
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {pd.teacherName}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========== Tabs: Marking / Summary ========== */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'marking' | 'summary')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="marking">Mark Attendance</TabsTrigger>
          <TabsTrigger value="summary">Period Summary</TabsTrigger>
        </TabsList>

        {/* ---------- Marking Tab ---------- */}
        <TabsContent value="marking" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Grid */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {PERIOD_NAMES[selectedPeriod]} &mdash; {selectedClass} Section {selectedSection}
                  </CardTitle>
                  <CardDescription>
                    Click on a student card to cycle: Present &rarr; Absent &rarr; Late
                    {activePeriodDef?.subject && (
                      <span className="ml-2">
                        | Subject: <strong>{activePeriodDef.subject}</strong>
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No student records found for this period. Select a different class, section, or period.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {students.map((student) => {
                    const status = attendanceMap[student.studentId] ?? 'present'
                    return (
                      <div
                        key={student.studentId}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleStatusToggle(student.studentId)
                          }
                        }}
                        className={cn(
                          'p-3 rounded-lg border bg-card transition-all cursor-pointer select-none hover:shadow-md',
                          'border-l-4',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          getAttendanceBorderColor(status),
                        )}
                        onClick={() => handleStatusToggle(student.studentId)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-xs font-medium">
                              {student.rollNumber}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">{student.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              Roll {student.rollNumber}
                            </p>
                          </div>
                          <Badge
                            variant={getAttendanceBadgeVariant(status)}
                            className="shrink-0 text-xs"
                          >
                            {ATTENDANCE_STATUS_LABELS[status]}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Save Bar */}
              <div className="mt-6 flex items-center justify-between">
                {hasChanges ? (
                  <p className="text-sm text-muted-foreground">
                    You have unsaved changes
                  </p>
                ) : (
                  <div />
                )}
                <Button
                  onClick={handleSave}
                  disabled={markPeriodAttendance.isPending || !hasChanges || students.length === 0}
                >
                  {markPeriodAttendance.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Summary Tab ---------- */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Period-wise Attendance Summary &mdash; {selectedClass} Section {selectedSection}
              </CardTitle>
              <CardDescription>
                Overview of each student&apos;s period attendance and subject-wise breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : summaryStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No summary data available for this class and section.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                          Student
                        </TableHead>
                        <TableHead className="text-center">Total Periods</TableHead>
                        <TableHead className="text-center">Attended</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Late</TableHead>
                        <TableHead className="text-center">Attendance %</TableHead>
                        <TableHead className="min-w-[300px]">Subject Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="sticky left-0 bg-background z-10">
                            <div>
                              <p className="font-medium">{student.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{student.totalPeriods}</TableCell>
                          <TableCell className="text-center text-green-600">
                            {student.attendedPeriods}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {student.absentPeriods}
                          </TableCell>
                          <TableCell className="text-center text-orange-600">
                            {student.latePeriods}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={student.periodPercentage >= 75 ? 'success' : 'destructive'}
                            >
                              {student.periodPercentage}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.subjectWise.length === 0 ? (
                              <span className="text-xs text-muted-foreground">--</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {student.subjectWise.map((sw) => (
                                  <div
                                    key={sw.subject}
                                    className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                                  >
                                    <span className="font-medium">{sw.subject}</span>
                                    <span className={cn('font-semibold', getPercentageColor(sw.percentage))}>
                                      {sw.percentage}%
                                    </span>
                                    <span className="text-muted-foreground">
                                      ({sw.attended}/{sw.total})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
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
