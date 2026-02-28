import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Users,
  Play,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart3,
  Link2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDeleteOnlineExam } from '@/features/lms/hooks/useQuestionBank'
import { useToast } from '@/hooks/use-toast'
import { isWithinSchedule } from '@/lib/exam-security'
import type { OnlineExamConfig, OnlineExamAttempt } from '@/features/lms/types/question-bank.types'

interface OnlineExamCardProps {
  exam: OnlineExamConfig & {
    questions?: { id: string }[]
    attempts?: OnlineExamAttempt[]
  }
  onTakeExam?: (examId: string) => void
  onEdit?: (exam: OnlineExamConfig) => void
  onViewResults?: (examId: string) => void
}

export function OnlineExamCard({
  exam,
  onTakeExam,
  onEdit,
  onViewResults,
}: OnlineExamCardProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const deleteMutation = useDeleteOnlineExam()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'principal'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'
  const canManage = isAdmin || isTeacher

  // Get student's attempts if available
  const studentAttempts = exam.attempts?.filter((a) => a.studentId === user?.id) || []
  const hasAttempted = studentAttempts.length > 0
  const canAttempt = !exam.maxAttempts || studentAttempts.length < exam.maxAttempts
  const lastAttempt = studentAttempts[studentAttempts.length - 1]

  // Check schedule
  const scheduleCheck = isWithinSchedule(exam.schedule)
  const isScheduledFuture = exam.isScheduled && exam.schedule && new Date(exam.schedule.startTime) > new Date()
  const isScheduledPast = exam.isScheduled && exam.schedule && new Date(exam.schedule.endTime) < new Date()

  // Status badge config
  const getStatusBadge = () => {
    switch (exam.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(exam.id)
      toast({ title: 'Online exam deleted successfully' })
    } catch {
      toast({ title: 'Failed to delete exam', variant: 'destructive' })
    }
    setDeleteDialogOpen(false)
  }

  const handleTakeExam = () => {
    if (!scheduleCheck.allowed) {
      toast({ title: scheduleCheck.message, variant: 'destructive' })
      return
    }
    if (!canAttempt) {
      toast({ title: 'Maximum attempts reached', variant: 'destructive' })
      return
    }
    onTakeExam?.(exam.id)
  }

  const questionCount = exam.questionIds?.length || exam.questions?.length || 0
  const totalAttempts = exam.attempts?.length || 0
  const avgScore = totalAttempts > 0
    ? exam.attempts!.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
    : undefined

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg line-clamp-1">{exam.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {exam.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(exam)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewResults?.(exam.id)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Results
                    </DropdownMenuItem>
                    {exam.linkedExamId && (
                      <DropdownMenuItem
                        onClick={() => navigate(`/exams/${exam.linkedExamId}`)}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        View Linked Exam
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{exam.duration} min</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{questionCount} questions</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Pass: {exam.passingScore}%</span>
            </div>
            {canManage && totalAttempts > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{totalAttempts} attempts</span>
              </div>
            )}
          </div>

          {/* Schedule Info */}
          {exam.isScheduled && exam.schedule && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(exam.schedule.startTime).toLocaleDateString()} -{' '}
                {new Date(exam.schedule.endTime).toLocaleDateString()}
              </span>
              {isScheduledFuture && (
                <Badge variant="outline" className="ml-auto">
                  Upcoming
                </Badge>
              )}
              {isScheduledPast && (
                <Badge variant="secondary" className="ml-auto">
                  Ended
                </Badge>
              )}
            </div>
          )}

          {/* Student's attempt info */}
          {isStudent && hasAttempted && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your best score</span>
                <span className="font-medium">
                  {Math.max(...studentAttempts.map((a) => a.percentage)).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attempts</span>
                <span>
                  {studentAttempts.length} / {exam.maxAttempts || 'Unlimited'}
                </span>
              </div>
              {lastAttempt && (
                <div className="flex items-center gap-2">
                  {lastAttempt.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${lastAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {lastAttempt.passed ? 'Passed' : 'Failed'} ({lastAttempt.percentage.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Teacher/Admin stats */}
          {canManage && avgScore !== undefined && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Score</span>
                <span className="font-medium">{avgScore.toFixed(1)}%</span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>
          )}

          {/* Security indicators */}
          {exam.security && (
            <div className="flex flex-wrap gap-1">
              {exam.security.shuffleQuestions && (
                <Badge variant="outline" className="text-xs">Shuffled</Badge>
              )}
              {exam.security.detectTabSwitch && (
                <Badge variant="outline" className="text-xs">Tab Monitor</Badge>
              )}
              {exam.security.preventCopyPaste && (
                <Badge variant="outline" className="text-xs">No Copy</Badge>
              )}
              {exam.negativeMarkingEnabled && (
                <Badge variant="outline" className="text-xs">Negative Marking</Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {isStudent ? (
            <Button
              className="w-full"
              onClick={handleTakeExam}
              disabled={!scheduleCheck.allowed || !canAttempt || exam.status === 'draft'}
            >
              <Play className="h-4 w-4 mr-2" />
              {hasAttempted
                ? canAttempt
                  ? 'Retake Exam'
                  : 'View Results'
                : 'Start Exam'}
            </Button>
          ) : canManage ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit?.(exam)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                className="flex-1"
                onClick={() => onViewResults?.(exam.id)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Results
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Online Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exam.title}"? This will also delete all
              student attempts and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
