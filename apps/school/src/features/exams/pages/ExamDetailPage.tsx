import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ClipboardList,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useExam, useDeleteExam, usePublishExamResults } from '../hooks/useExams'
import { EXAM_TYPE_LABELS, EXAM_STATUS_LABELS, SUBJECT_TYPE_LABELS } from '../types/exams.types'
import type { ExamStatus } from '../types/exams.types'

const statusConfig: Record<ExamStatus, { variant: 'default' | 'secondary' | 'success' | 'destructive'; icon: typeof Clock }> = {
  scheduled: { variant: 'secondary', icon: Clock },
  ongoing: { variant: 'default', icon: AlertCircle },
  completed: { variant: 'success', icon: CheckCircle },
  results_published: { variant: 'success', icon: Send },
}

export function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: examData, isLoading } = useExam(id!)
  const exam = examData?.data
  const deleteExam = useDeleteExam()
  const publishResults = usePublishExamResults()

  const handleDelete = async () => {
    try {
      await deleteExam.mutateAsync(id!)
      toast({
        title: 'Exam Deleted',
        description: 'The exam has been deleted successfully.',
      })
      navigate('/exams')
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the exam.',
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async () => {
    try {
      await publishResults.mutateAsync(id!)
      toast({
        title: 'Results Published',
        description: 'The exam results have been published successfully.',
      })
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: 'Failed to publish the results.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: '...' },
          ]}
        />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div>
        <PageHeader
          title="Exam Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: 'Not Found' },
          ]}
        />
        <div className="mt-6 text-center py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Exam not found</h3>
          <p className="mb-4">The exam you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[exam.status].icon
  const canEnterMarks = exam.status === 'ongoing' || exam.status === 'completed'
  const canPublish = exam.status === 'completed'

  return (
    <div>
      <PageHeader
        title={exam.name}
        description={`${EXAM_TYPE_LABELS[exam.type]} - ${exam.academicYear}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: exam.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/exams')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {canEnterMarks && (
              <Button onClick={() => navigate(`/exams/${id}/marks`)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Enter Marks
              </Button>
            )}
            {canPublish && (
              <Button onClick={handlePublish} disabled={publishResults.isPending}>
                {publishResults.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish Results
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/exams/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{exam.name}"? This will also delete all
                    associated marks and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <p className="mt-2 font-medium">
                {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Classes</span>
              </div>
              <p className="mt-2 font-medium">{exam.applicableClasses.join(', ')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Subjects</span>
              </div>
              <p className="mt-2 font-medium">{exam.subjects.length} subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <div className="mt-2">
                <Badge variant={statusConfig[exam.status].variant}>
                  {EXAM_STATUS_LABELS[exam.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exam Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Exam Type</p>
                <p className="font-medium">{EXAM_TYPE_LABELS[exam.type]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">{exam.academicYear}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="font-medium">{exam.term}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applicable Classes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exam.applicableClasses.map((cls) => (
                    <Badge key={cls} variant="outline">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjects</CardTitle>
            <CardDescription>
              {exam.subjects.length} subjects configured for this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exam.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{subject.name}</p>
                      <Badge variant="outline">{subject.code}</Badge>
                      <Badge variant="secondary">{SUBJECT_TYPE_LABELS[subject.type]}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      Max: <span className="font-medium">{subject.maxMarks}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Passing: {subject.passingMarks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {canEnterMarks && (
                <Button variant="outline" onClick={() => navigate(`/exams/${id}/marks`)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Enter Marks
                </Button>
              )}
              {exam.status === 'results_published' && (
                <Button variant="outline" onClick={() => navigate(`/exams?tab=reports`)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Report Cards
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
