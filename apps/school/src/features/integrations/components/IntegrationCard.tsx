import { useState } from 'react'
import {
  MoreHorizontal,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Play,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { formatDate } from '@/lib/utils'
import type {
  IntegrationConfig,
  IntegrationStatus,
} from '../types/integrations.types'
import {
  INTEGRATION_TYPE_LABELS,
  SMS_PROVIDER_LABELS,
  EMAIL_PROVIDER_LABELS,
  PAYMENT_PROVIDER_LABELS,
  WHATSAPP_PROVIDER_LABELS,
} from '../types/integrations.types'

interface IntegrationCardProps {
  integration: IntegrationConfig
  onEdit: () => void
  onDelete: () => void
  onTest: () => Promise<void>
  isTesting?: boolean
}

const statusConfig: Record<IntegrationStatus, { icon: React.ElementType; variant: 'success' | 'secondary' | 'destructive' | 'warning' }> = {
  active: { icon: CheckCircle, variant: 'success' },
  inactive: { icon: XCircle, variant: 'secondary' },
  error: { icon: AlertCircle, variant: 'destructive' },
  pending: { icon: Clock, variant: 'warning' },
}

function getProviderLabel(type: string, provider: string): string {
  switch (type) {
    case 'sms_gateway':
      return SMS_PROVIDER_LABELS[provider as keyof typeof SMS_PROVIDER_LABELS] || provider
    case 'email_service':
      return EMAIL_PROVIDER_LABELS[provider as keyof typeof EMAIL_PROVIDER_LABELS] || provider
    case 'payment_gateway':
      return PAYMENT_PROVIDER_LABELS[provider as keyof typeof PAYMENT_PROVIDER_LABELS] || provider
    case 'whatsapp_api':
      return WHATSAPP_PROVIDER_LABELS[provider as keyof typeof WHATSAPP_PROVIDER_LABELS] || provider
    default:
      return provider
  }
}

export function IntegrationCard({
  integration,
  onEdit,
  onDelete,
  onTest,
  isTesting,
}: IntegrationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { icon: StatusIcon, variant } = statusConfig[integration.status]

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription>
                {INTEGRATION_TYPE_LABELS[integration.type]} - {getProviderLabel(integration.type, integration.provider)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {integration.lastTestedAt ? (
                <span>Last tested: {formatDate(integration.lastTestedAt)}</span>
              ) : (
                <span>Never tested</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{integration.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
