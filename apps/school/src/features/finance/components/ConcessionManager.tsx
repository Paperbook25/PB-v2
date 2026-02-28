import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useConcessionRequests,
  useApproveConcession,
  useRejectConcession,
} from '../hooks/useFinance'
import { CONCESSION_STATUS_LABELS, type ConcessionStatus } from '../types/finance.types'
import { concessionStatusColors, statusColors } from '@/lib/design-tokens'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function ConcessionManager() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { data: result, isLoading } = useConcessionRequests(statusFilter === 'all' ? undefined : statusFilter)
  const approveMutation = useApproveConcession()
  const rejectMutation = useRejectConcession()

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const requests = result?.data || []
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedValue = requests.filter(r => r.status === 'approved').reduce((s, r) => s + r.totalConcessionAmount, 0)

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Approved', description: 'Concession request approved.' }),
      onError: () => toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' }),
    })
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason', variant: 'destructive' })
      return
    }
    rejectMutation.mutate(
      { id: rejectId, reason: rejectReason },
      {
        onSuccess: () => {
          toast({ title: 'Rejected', description: 'Concession request rejected.' })
          setRejectOpen(false)
          setRejectReason('')
        },
        onError: () => toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' }),
      }
    )
  }

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fee Concession Requests</h3>
        <p className="text-sm text-muted-foreground">Review and manage fee concession requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: statusColors.warning }}>{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: statusColors.success }}>{formatCurrency(approvedValue)}</div>
            <p className="text-sm text-muted-foreground">Approved Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {requests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No concession requests.</CardContent></Card>
          ) : (
            requests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{req.studentName}</span>
                        <Badge variant="outline">{req.studentClass} - {req.section}</Badge>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: concessionStatusColors[req.status]?.bg,
                            color: concessionStatusColors[req.status]?.text,
                          }}
                        >
                          {CONCESSION_STATUS_LABELS[req.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {req.admissionNumber} &middot; Parent: {req.parentName}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Fee Types:</span> {req.feeTypes.join(', ')}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Concession:</span>{' '}
                          {req.concessionType === 'percentage' ? `${req.concessionValue}%` : formatCurrency(req.concessionValue)}
                          {' '}({formatCurrency(req.totalConcessionAmount)})
                        </p>
                        <p className="text-sm mt-1 text-muted-foreground">
                          <span className="font-medium">Reason:</span> {req.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Valid: {req.validFrom} to {req.validTo} &middot; Requested by {req.requestedBy}
                        </p>
                      </div>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-sm text-destructive mt-2">Rejection: {req.rejectionReason}</p>
                      )}
                      {req.status === 'approved' && req.approvedBy && (
                        <p className="text-sm mt-2" style={{ color: statusColors.success }}>Approved by {req.approvedBy}</p>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleApprove(req.id)} disabled={approveMutation.isPending}>
                          {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setRejectId(req.id); setRejectOpen(true) }}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Concession</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this concession request.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
