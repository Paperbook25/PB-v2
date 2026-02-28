import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  ClipboardList,
  BarChart,
  Clock,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useSurveys,
  useDeleteSurvey,
  useUpdateSurvey,
} from '../hooks/useCommunication'
import { Survey, SurveyStatus } from '../types/communication.types'
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

const statusConfig: Record<SurveyStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
  archived: { label: 'Archived', variant: 'secondary' },
}

export function SurveysPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SurveyStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useSurveys({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteSurvey()
  const updateMutation = useUpdateSurvey()

  const surveys = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Survey deleted',
        description: 'The survey has been deleted successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete survey.',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (surveyId: string, newStatus: SurveyStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: surveyId,
        data: { status: newStatus },
      })
      toast({
        title: 'Survey updated',
        description: `Survey status changed to ${newStatus}.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update survey.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveys & Feedback"
        description="Create surveys and collect feedback from your school community"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Surveys' },
        ]}
        actions={
          <Button onClick={() => navigate('/communication/surveys/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Survey
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as SurveyStatus | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No surveys found</p>
          <Button onClick={() => navigate('/communication/surveys/new')}>
            Create your first survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onView={(id) => navigate(`/communication/surveys/${id}`)}
              onEdit={(id) => navigate(`/communication/surveys/${id}/edit`)}
              onDelete={(id) => setDeleteId(id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this survey? All responses will also be
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface SurveyCardProps {
  survey: Survey
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: SurveyStatus) => void
}

function SurveyCard({
  survey,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: SurveyCardProps) {
  const statusInfo = statusConfig[survey.status]
  const responseRate =
    survey.totalTargeted > 0
      ? Math.round((survey.responseCount / survey.totalTargeted) * 100)
      : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3
                className="font-semibold cursor-pointer hover:text-primary"
                onClick={() => onView?.(survey.id)}
              >
                {survey.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {survey.questions.length} questions
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(survey.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView?.(survey.id)}>
                <BarChart className="h-4 w-4 mr-2" />
                Results
              </DropdownMenuItem>
              {survey.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange?.(survey.id, 'active')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
              )}
              {survey.status === 'active' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange?.(survey.id, 'closed')}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Close
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(survey.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(survey.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {survey.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Responses</span>
            <span className="font-medium">
              {survey.responseCount} / {survey.totalTargeted}
            </span>
          </div>
          <Progress value={responseRate} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(survey.startsAt), 'MMM d')} -{' '}
              {format(new Date(survey.endsAt), 'MMM d')}
            </span>
          </div>
          {survey.anonymous && (
            <Badge variant="outline" className="text-xs">
              Anonymous
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <span className="text-xs text-muted-foreground">
            Created by {survey.createdByName}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
