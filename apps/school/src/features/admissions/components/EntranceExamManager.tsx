import { useState } from 'react'
import { Calendar, Clock, MapPin, Award, Plus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useExamSchedules, useCreateExamSchedule, useExamResults } from '../hooks/useAdmissions'
import { CLASSES } from '../types/admission.types'
import type { EntranceExamSchedule, ScheduleExamRequest } from '../types/admission.types'

const STATUS_BADGE_VARIANT: Record<EntranceExamSchedule['status'], string> = {
  upcoming: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  in_progress: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  completed: 'bg-green-100 text-green-700 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const STATUS_LABELS: Record<EntranceExamSchedule['status'], string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const INITIAL_FORM_STATE: ScheduleExamRequest = {
  class: '',
  examDate: '',
  examTime: '',
  venue: '',
  duration: 60,
  totalMarks: 100,
  passingMarks: 40,
  subjects: [],
}

export function EntranceExamManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('schedules')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ScheduleExamRequest>(INITIAL_FORM_STATE)
  const [subjectInput, setSubjectInput] = useState('')
  const [resultsClassFilter, setResultsClassFilter] = useState<string>('')

  // Data hooks
  const { data: schedulesResponse, isLoading: schedulesLoading } = useExamSchedules()
  const schedules = schedulesResponse?.data
  const createSchedule = useCreateExamSchedule()
  const { data: resultsResponse, isLoading: resultsLoading } = useExamResults(
    resultsClassFilter ? { class: resultsClassFilter } : undefined
  )
  const results = resultsResponse?.data

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM_STATE)
    setSubjectInput('')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData(INITIAL_FORM_STATE)
    setSubjectInput('')
  }

  const handleAddSubject = () => {
    const trimmed = subjectInput.trim()
    if (trimmed && !formData.subjects.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, subjects: [...prev.subjects, trimmed] }))
      setSubjectInput('')
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }))
  }

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubject()
    }
  }

  const handleSubmit = () => {
    if (!formData.class || !formData.examDate || !formData.examTime || !formData.venue) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (formData.subjects.length === 0) {
      toast({
        title: 'No Subjects',
        description: 'Please add at least one subject for the exam.',
        variant: 'destructive',
      })
      return
    }

    if (formData.passingMarks > formData.totalMarks) {
      toast({
        title: 'Invalid Marks',
        description: 'Passing marks cannot exceed total marks.',
        variant: 'destructive',
      })
      return
    }

    createSchedule.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Exam Scheduled',
          description: `Entrance exam for ${formData.class} has been scheduled successfully.`,
        })
        handleCloseDialog()
      },
      onError: (error) => {
        toast({
          title: 'Failed to Schedule Exam',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entrance Exams</h2>
          <p className="text-muted-foreground">
            Manage entrance exam schedules and view results
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          {schedulesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !schedules || schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No Exam Schedules</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  No entrance exams have been scheduled yet.
                </p>
                <Button onClick={handleOpenDialog} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{schedule.class}</CardTitle>
                      <Badge className={STATUS_BADGE_VARIANT[schedule.status]}>
                        {STATUS_LABELS[schedule.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(schedule.examDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(schedule.examDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.examTime} ({schedule.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {schedule.passingMarks}/{schedule.totalMarks} marks (passing)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {schedule.completedCount}/{schedule.registeredCount} completed
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {schedule.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Select
                value={resultsClassFilter}
                onValueChange={setResultsClassFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {resultsLoading ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : !results || results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No Results Found</h3>
                <p className="text-muted-foreground text-sm">
                  {resultsClassFilter
                    ? `No exam results found for ${resultsClassFilter}.`
                    : 'No exam results have been recorded yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.applicationId}>
                        <TableCell className="font-medium">
                          {result.rank != null ? `#${result.rank}` : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.studentName}
                        </TableCell>
                        <TableCell>
                          {result.marksObtained}/{result.totalMarks}
                        </TableCell>
                        <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              result.result === 'pass'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            }
                          >
                            {result.result === 'pass' ? 'Pass' : 'Fail'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Entrance Exam
            </DialogTitle>
            <DialogDescription>
              Create a new entrance exam schedule for applicants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="exam-class">
                Class <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.class}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, class: value }))
                }
              >
                <SelectTrigger id="exam-class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-date">
                  Exam Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-time">
                  Exam Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exam-time"
                  type="time"
                  value={formData.examTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, examTime: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="exam-venue">
                Venue <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exam-venue"
                placeholder="e.g., Examination Hall A"
                value={formData.venue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, venue: e.target.value }))
                }
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Duration (minutes)</Label>
              <Input
                id="exam-duration"
                type="number"
                min={15}
                max={300}
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>

            {/* Total Marks and Passing Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-total-marks">Total Marks</Label>
                <Input
                  id="exam-total-marks"
                  type="number"
                  min={1}
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalMarks: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-passing-marks">Passing Marks</Label>
                <Input
                  id="exam-passing-marks"
                  type="number"
                  min={1}
                  max={formData.totalMarks}
                  value={formData.passingMarks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passingMarks: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <Label htmlFor="exam-subject">Subjects</Label>
              <div className="flex gap-2">
                <Input
                  id="exam-subject"
                  placeholder="Type a subject and press Enter"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={handleSubjectKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSubject}
                  disabled={!subjectInput.trim()}
                >
                  Add
                </Button>
              </div>
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.subjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveSubject(subject)}
                    >
                      {subject} &times;
                    </Badge>
                  ))}
                </div>
              )}
              {formData.subjects.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add at least one subject for the entrance exam.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createSchedule.isPending}>
              {createSchedule.isPending ? 'Scheduling...' : 'Schedule Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
