import { useState } from 'react'
import { Plus, Clock, CheckCircle, XCircle, CalendarDays, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { LeaveRequestForm } from '../components/LeaveRequestForm'
import { LeaveApprovalDialog } from '../components/LeaveApprovalDialog'
import { useAllLeaveRequests, useUpdateLeaveRequest } from '../hooks/useStaff'
import { LEAVE_TYPE_LABELS, type LeaveRequest, type LeaveStatus } from '../types/staff.types'

const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" /> },
}

export function LeaveManagementPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  const { data: leaveRequestsData, isLoading } = useAllLeaveRequests(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  )
  const updateLeaveRequest = useUpdateLeaveRequest()

  const leaveRequests = leaveRequestsData?.data || []
  const pendingRequests = leaveRequests.filter((r) => r.status === 'pending')

  const handleApprove = () => {
    if (!selectedRequest) return

    updateLeaveRequest.mutate(
      { requestId: selectedRequest.id, data: { status: 'approved' } },
      {
        onSuccess: () => {
          toast({
            title: 'Leave Approved',
            description: `Leave request for ${selectedRequest.staffName} has been approved.`,
          })
          setApprovalDialogOpen(false)
          setSelectedRequest(null)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to approve leave',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleReject = (reason: string) => {
    if (!selectedRequest) return

    updateLeaveRequest.mutate(
      { requestId: selectedRequest.id, data: { status: 'rejected', rejectionReason: reason } },
      {
        onSuccess: () => {
          toast({
            title: 'Leave Rejected',
            description: `Leave request for ${selectedRequest.staffName} has been rejected.`,
          })
          setApprovalDialogOpen(false)
          setSelectedRequest(null)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to reject leave',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const openApprovalDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setApprovalDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'Leave Management' },
        ]}
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            All Requests
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>
                {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting your action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending leave requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.staffName}`} />
                          <AvatarFallback>{getInitials(request.staffName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.staffName}</p>
                          <p className="text-sm text-muted-foreground">
                            {LEAVE_TYPE_LABELS[request.type]} • {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => openApprovalDialog(request)}>
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Leave Requests</CardTitle>
                  <CardDescription>Complete history of leave requests</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => {
                      const status = STATUS_CONFIG[request.status]
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.staffName}`} />
                                <AvatarFallback>{getInitials(request.staffName)}</AvatarFallback>
                              </Avatar>
                              {request.staffName}
                            </div>
                          </TableCell>
                          <TableCell>{LEAVE_TYPE_LABELS[request.type]}</TableCell>
                          <TableCell>
                            <p className="text-sm">{formatDate(request.startDate)}</p>
                            <p className="text-xs text-muted-foreground">to {formatDate(request.endDate)}</p>
                          </TableCell>
                          <TableCell>{request.numberOfDays}</TableCell>
                          <TableCell>
                            <Badge className={cn(status.color, 'gap-1')}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(request.appliedOn)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => openApprovalDialog(request)}>
                                Review
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <LeaveApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={updateLeaveRequest.isPending}
      />
    </div>
  )
}
