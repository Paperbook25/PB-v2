import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, AlertTriangle } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useEmergencyAlerts,
  useUpdateEmergencyAlert,
  useAcknowledgeEmergencyAlert,
} from '../hooks/useCommunication'
import { EmergencyAlertCard } from '../components/EmergencyAlertCard'
import { AlertSeverity, AlertStatus } from '../types/communication.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function EmergencyAlertsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AlertStatus | 'all'>('all')
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all')
  const [page, setPage] = useState(1)
  const [acknowledgeId, setAcknowledgeId] = useState<string | null>(null)
  const [acknowledgeStatus, setAcknowledgeStatus] = useState<'safe' | 'need_help'>('safe')
  const [acknowledgeLocation, setAcknowledgeLocation] = useState('')

  const { data: result, isLoading } = useEmergencyAlerts({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    severity: severity !== 'all' ? severity : undefined,
    page,
    limit: 10,
  })

  const updateMutation = useUpdateEmergencyAlert()
  const acknowledgeMutation = useAcknowledgeEmergencyAlert()

  const alerts = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleResolve = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: 'resolved' },
      })
      toast({
        title: 'Alert resolved',
        description: 'The emergency alert has been marked as resolved.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to resolve alert.',
        variant: 'destructive',
      })
    }
  }

  const handleAcknowledge = async () => {
    if (!acknowledgeId) return
    try {
      await acknowledgeMutation.mutateAsync({
        id: acknowledgeId,
        data: {
          status: acknowledgeStatus,
          location: acknowledgeLocation || undefined,
        },
      })
      toast({
        title: 'Acknowledged',
        description: 'Your status has been recorded.',
      })
      setAcknowledgeId(null)
      setAcknowledgeLocation('')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Alerts"
        description="Send and manage emergency notifications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Emergency Alerts' },
        ]}
        actions={
          <Button
            variant="destructive"
            onClick={() => navigate('/communication/alerts/new')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as AlertStatus | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={severity}
          onValueChange={(v) => setSeverity(v as AlertSeverity | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No emergency alerts found</p>
          <Button
            variant="destructive"
            onClick={() => navigate('/communication/alerts/new')}
          >
            Create Emergency Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <EmergencyAlertCard
              key={alert.id}
              alert={alert}
              onView={(id) => navigate(`/communication/alerts/${id}`)}
              onResolve={handleResolve}
              onAcknowledge={(id) => setAcknowledgeId(id)}
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

      {/* Acknowledge Dialog */}
      <Dialog open={!!acknowledgeId} onOpenChange={() => setAcknowledgeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Emergency Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Status</Label>
              <RadioGroup
                value={acknowledgeStatus}
                onValueChange={(v) => setAcknowledgeStatus(v as 'safe' | 'need_help')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="safe" id="safe" />
                  <Label htmlFor="safe" className="text-green-600">
                    I'm Safe
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need_help" id="need_help" />
                  <Label htmlFor="need_help" className="text-red-600">
                    I Need Help
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Current Location (Optional)</Label>
              <Textarea
                id="location"
                placeholder="Enter your current location..."
                value={acknowledgeLocation}
                onChange={(e) => setAcknowledgeLocation(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAcknowledgeId(null)}>
                Cancel
              </Button>
              <Button onClick={handleAcknowledge}>
                Submit Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
