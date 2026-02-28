import { format } from 'date-fns'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  MoreVertical,
  Eye,
  Edit,
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
import { Progress } from '@/components/ui/progress'
import {
  EmergencyAlert,
  AlertSeverity,
  AlertStatus,
} from '../types/communication.types'
import { cn } from '@/lib/utils'

interface EmergencyAlertCardProps {
  alert: EmergencyAlert
  onView?: (id: string) => void
  onResolve?: (id: string) => void
  onAcknowledge?: (id: string) => void
  showActions?: boolean
}

const severityConfig: Record<
  AlertSeverity,
  { label: string; icon: typeof AlertTriangle; className: string; bgClass: string }
> = {
  info: {
    label: 'Info',
    icon: Info,
    className: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  warning: {
    label: 'Warning',
    icon: AlertCircle,
    className: 'text-yellow-600',
    bgClass: 'bg-yellow-50 border-yellow-200',
  },
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    className: 'text-orange-600',
    bgClass: 'bg-orange-50 border-orange-200',
  },
  emergency: {
    label: 'Emergency',
    icon: Bell,
    className: 'text-red-600',
    bgClass: 'bg-red-50 border-red-200',
  },
}

const statusConfig: Record<AlertStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'destructive' },
  resolved: { label: 'Resolved', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

export function EmergencyAlertCard({
  alert,
  onView,
  onResolve,
  onAcknowledge,
  showActions = true,
}: EmergencyAlertCardProps) {
  const severity = severityConfig[alert.severity]
  const status = statusConfig[alert.status]
  const SeverityIcon = severity.icon

  const safeCount = alert.acknowledgements.filter((a) => a.status === 'safe').length
  const needHelpCount = alert.acknowledgements.filter((a) => a.status === 'need_help').length
  const totalAcknowledged = alert.acknowledgements.length

  return (
    <Card className={cn('border-2', alert.status === 'active' && severity.bgClass)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', severity.className, 'bg-white')}>
              <SeverityIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold text-base cursor-pointer hover:text-primary"
                  onClick={() => onView?.(alert.id)}
                >
                  {alert.title}
                </h3>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By {alert.createdByName}</span>
                <span>•</span>
                <span>{format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(alert.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {alert.status === 'active' && (
                  <DropdownMenuItem onClick={() => onResolve?.(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-4">
        <p className="text-sm text-muted-foreground">{alert.message}</p>

        {alert.instructions && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Instructions:</p>
            <p className="text-sm text-muted-foreground">{alert.instructions}</p>
          </div>
        )}

        {/* Acknowledgement Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Acknowledgements</span>
            <span className="font-medium">{totalAcknowledged} responses</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{safeCount} safe</span>
            </div>
            {needHelpCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{needHelpCount} need help</span>
              </div>
            )}
          </div>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Channels:</span>
          <div className="flex gap-1">
            {alert.channels.map((channel) => (
              <Badge key={channel} variant="outline" className="text-xs">
                {channel.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {alert.status === 'active' && onAcknowledge && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => onAcknowledge(alert.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              I'm Safe
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => onAcknowledge(alert.id)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Need Help
            </Button>
          </div>
        </CardFooter>
      )}

      {alert.status === 'resolved' && alert.resolvedAt && (
        <CardFooter className="pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Resolved by {alert.resolvedBy} on{' '}
              {format(new Date(alert.resolvedAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
