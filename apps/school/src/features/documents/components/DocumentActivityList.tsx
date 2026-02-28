import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Download,
  Edit,
  Eye,
  FilePlus,
  Move,
  Share2,
  Trash2,
  FileText,
} from 'lucide-react'
import { useDocumentActivities } from '../hooks/useDocuments'
import { formatDistanceToNow } from 'date-fns'
import type { DocumentActivity } from '../types/documents.types'

function getActivityIcon(action: DocumentActivity['action']) {
  switch (action) {
    case 'created':
      return <FilePlus className="h-4 w-4 text-green-500" />
    case 'viewed':
      return <Eye className="h-4 w-4 text-blue-500" />
    case 'downloaded':
      return <Download className="h-4 w-4 text-purple-500" />
    case 'updated':
      return <Edit className="h-4 w-4 text-amber-500" />
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-red-500" />
    case 'shared':
      return <Share2 className="h-4 w-4 text-cyan-500" />
    case 'moved':
      return <Move className="h-4 w-4 text-orange-500" />
    case 'renamed':
      return <FileText className="h-4 w-4 text-indigo-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

function getActivityDescription(activity: DocumentActivity): string {
  const verbs: Record<DocumentActivity['action'], string> = {
    created: 'created',
    viewed: 'viewed',
    downloaded: 'downloaded',
    updated: 'updated',
    deleted: 'deleted',
    shared: 'shared',
    moved: 'moved',
    renamed: 'renamed',
  }
  return `${verbs[activity.action]} "${activity.documentName}"`
}

interface DocumentActivityListProps {
  limit?: number
}

export function DocumentActivityList({ limit = 20 }: DocumentActivityListProps) {
  const { data: result, isLoading } = useDocumentActivities({ limit })
  const activities = result?.data || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest document operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest document operations</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activity.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.action)}
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      {getActivityDescription(activity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    {activity.details && (
                      <span className="text-xs text-muted-foreground">• {activity.details}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
