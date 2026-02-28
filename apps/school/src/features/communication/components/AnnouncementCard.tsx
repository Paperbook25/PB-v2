import { format } from 'date-fns'
import {
  Megaphone,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Announcement, AnnouncementPriority, AnnouncementStatus } from '../types/communication.types'

interface AnnouncementCardProps {
  announcement: Announcement
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onPublish?: (id: string) => void
  onAcknowledge?: (id: string) => void
  showActions?: boolean
}

const priorityConfig: Record<AnnouncementPriority, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Low', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'High', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
}

const statusConfig: Record<AnnouncementStatus, { label: string; icon: typeof Megaphone; className: string }> = {
  draft: { label: 'Draft', icon: FileText, className: 'text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: Clock, className: 'text-blue-600' },
  published: { label: 'Published', icon: Megaphone, className: 'text-green-600' },
  archived: { label: 'Archived', icon: FileText, className: 'text-muted-foreground' },
}

export function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onAcknowledge,
  showActions = true,
}: AnnouncementCardProps) {
  const priorityInfo = priorityConfig[announcement.priority]
  const statusInfo = statusConfig[announcement.status]
  const StatusIcon = statusInfo.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-primary/10 ${statusInfo.className}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate cursor-pointer hover:text-primary"
                onClick={() => onView?.(announcement.id)}
              >
                {announcement.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>By {announcement.createdByName}</span>
                <span>•</span>
                <span>{format(new Date(announcement.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(announcement.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  {announcement.status === 'draft' && (
                    <DropdownMenuItem onClick={() => onPublish?.(announcement.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit?.(announcement.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(announcement.id)}
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

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>

        {announcement.attachments.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{announcement.attachments.length} attachment(s)</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{announcement.viewCount} views</span>
          </div>

          {announcement.acknowledgementRequired && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>{announcement.acknowledgements.length} acknowledged</span>
            </div>
          )}
        </div>

        {announcement.status === 'scheduled' && announcement.scheduledAt && (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock className="h-4 w-4" />
            <span>Scheduled: {format(new Date(announcement.scheduledAt), 'MMM d, h:mm a')}</span>
          </div>
        )}

        {announcement.acknowledgementRequired &&
          announcement.status === 'published' &&
          onAcknowledge && (
            <Button variant="outline" size="sm" onClick={() => onAcknowledge(announcement.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Acknowledge
            </Button>
          )}
      </CardFooter>
    </Card>
  )
}
