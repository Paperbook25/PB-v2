import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
  useAcknowledgeAnnouncement,
} from '../hooks/useCommunication'
import { AnnouncementCard } from '../components/AnnouncementCard'
import { AnnouncementStatus, AnnouncementPriority } from '../types/communication.types'
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

export function AnnouncementsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AnnouncementStatus | 'all'>('all')
  const [priority, setPriority] = useState<AnnouncementPriority | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useAnnouncements({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    priority: priority !== 'all' ? priority : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteAnnouncement()
  const updateMutation = useUpdateAnnouncement()
  const acknowledgeMutation = useAcknowledgeAnnouncement()

  const announcements = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been deleted successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement.',
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: 'published' },
      })
      toast({
        title: 'Announcement published',
        description: 'The announcement is now visible to the target audience.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish announcement.',
        variant: 'destructive',
      })
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeMutation.mutateAsync(id)
      toast({
        title: 'Acknowledged',
        description: 'Your acknowledgement has been recorded.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge announcement.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Create and manage announcements for your school community"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Announcements' },
        ]}
        actions={
          <Button onClick={() => navigate('/communication/announcements/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as AnnouncementStatus | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(v) => setPriority(v as AnnouncementPriority | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No announcements found</p>
          <Button onClick={() => navigate('/communication/announcements/new')}>
            Create your first announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={(id) => navigate(`/communication/announcements/${id}`)}
              onEdit={(id) => navigate(`/communication/announcements/${id}/edit`)}
              onDelete={(id) => setDeleteId(id)}
              onPublish={handlePublish}
              onAcknowledge={handleAcknowledge}
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
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be
              undone.
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
