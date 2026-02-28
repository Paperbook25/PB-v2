import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, Eye } from 'lucide-react'
import { useAssignments, useCreateAssignment, useSubmissions, useGradeSubmission, useCourses } from '../hooks/useLms'
import { AssignmentForm } from '../components/AssignmentForm'
import { SUBMISSION_STATUS_LABELS } from '../types/lms.types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { SubmissionStatus } from '../types/lms.types'

const submissionBadgeVariant: Record<SubmissionStatus, 'secondary' | 'default' | 'success'> = {
  not_submitted: 'secondary',
  submitted: 'default',
  graded: 'success',
}

export function AssignmentsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')

  // Data queries
  const { data: assignmentsData, isLoading } = useAssignments({
    search: search || undefined,
  })
  const { data: coursesData } = useCourses({ limit: 100 })
  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions(
    selectedAssignmentId ?? ''
  )

  // Mutations
  const createAssignment = useCreateAssignment()
  const gradeSubmission = useGradeSubmission()

  const assignments = assignmentsData?.data ?? []
  const courses = coursesData?.data?.map((c) => ({ id: c.id, title: c.title })) ?? []
  const submissions = submissionsData?.data ?? []

  const handleCreateAssignment = async (
    formData: Parameters<typeof createAssignment.mutateAsync>[0]
  ) => {
    try {
      await createAssignment.mutateAsync(formData)
      toast({
        title: 'Assignment Created',
        description: 'Assignment has been created successfully.',
      })
      setFormOpen(false)
    } catch {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleGrade = async (submissionId: string) => {
    const score = Number(gradeScore)
    if (isNaN(score) || score < 0) {
      toast({
        title: 'Invalid Score',
        description: 'Please enter a valid score.',
        variant: 'destructive',
      })
      return
    }

    try {
      await gradeSubmission.mutateAsync({
        id: submissionId,
        data: { score, feedback: gradeFeedback },
      })
      toast({
        title: 'Submission Graded',
        description: 'Submission has been graded successfully.',
      })
      setGradingId(null)
      setGradeScore('')
      setGradeFeedback('')
    } catch {
      toast({
        title: 'Grading Failed',
        description: 'Failed to grade submission. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Assignments' },
        ]}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Assignments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.courseName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {formatDate(assignment.dueDate)}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive" className="text-[10px]">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{assignment.maxScore}</TableCell>
                  <TableCell>{assignment.submissionCount}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                      title="View Submissions"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Assignment Dialog */}
      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateAssignment}
        isLoading={createAssignment.isPending}
        courses={courses}
      />

      {/* Submissions Dialog */}
      <Dialog
        open={!!selectedAssignmentId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssignmentId(null)
            setGradingId(null)
            setGradeScore('')
            setGradeFeedback('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions</DialogTitle>
          </DialogHeader>

          {submissionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.studentName}</TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={submissionBadgeVariant[submission.status]}>
                        {SUBMISSION_STATUS_LABELS[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.score !== null ? submission.score : '-'}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGradingId(submission.id)
                            setGradeScore(submission.score !== null ? String(submission.score) : '')
                            setGradeFeedback(submission.feedback || '')
                          }}
                        >
                          Grade
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Inline grading form */}
                {gradingId && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="space-y-3 py-2">
                        <p className="text-sm font-medium">Grade Submission</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="grade-score">Score</Label>
                            <Input
                              id="grade-score"
                              type="number"
                              min={0}
                              placeholder="Enter score"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="grade-feedback">Feedback</Label>
                            <Textarea
                              id="grade-feedback"
                              placeholder="Enter feedback"
                              rows={2}
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradingId(null)
                              setGradeScore('')
                              setGradeFeedback('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={gradeSubmission.isPending}
                            onClick={() => handleGrade(gradingId)}
                          >
                            {gradeSubmission.isPending ? 'Saving...' : 'Save Grade'}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
