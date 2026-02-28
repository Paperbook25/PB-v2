import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMyChildren, type Child } from '@/features/dashboard/hooks/useMyChildren'
import { useCreateLeaveRequest, useStudentLeaves } from '../hooks/useAttendance'
import { LEAVE_TYPE_LABELS, type LeaveType, type LeaveStatus, type LeaveRequest } from '../types/attendance.types'
import { formatDate, cn, getInitials } from '@/lib/utils'

const LEAVE_STATUS_STYLES: Record<LeaveStatus, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
}

interface LeaveFormData {
  studentId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export function LeaveApplicationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const isParent = user?.role === 'parent'

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')

  // Fetch children data for parents
  const { data: childrenResponse, isLoading: childrenLoading } = useMyChildren()
  const children = childrenResponse?.data ?? []

  // Set selected child when data loads
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id)
    }
  }, [children, selectedChild])

  // Fetch leave requests for selected child
  const { data: leavesResponse, isLoading: leavesLoading } = useStudentLeaves(selectedChild)
  const leaves = leavesResponse?.data ?? []

  const createLeave = useCreateLeaveRequest()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LeaveFormData>({
    defaultValues: {
      studentId: '',
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  // Update form studentId when selected child changes
  useEffect(() => {
    if (selectedChild) {
      setValue('studentId', selectedChild)
    }
  }, [selectedChild, setValue])

  const startDate = watch('startDate')

  const onSubmit = async (data: LeaveFormData) => {
    try {
      await createLeave.mutateAsync(data)
      toast({
        title: 'Leave Application Submitted',
        description: 'Your leave application has been submitted for approval.',
      })
      setDialogOpen(false)
      reset()
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit leave application. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const currentChild = children.find((c) => c.id === selectedChild) || children[0]

  return (
    <div>
      <PageHeader
        title="Leave Application"
        description="Apply for leave on behalf of your child"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Leave Application' },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)} disabled={children.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Apply Leave
          </Button>
        }
      />

      {/* Child Selector */}
      {childrenLoading ? (
        <div className="mb-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      ) : children.length > 1 ? (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Child</h3>
          <div className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => setSelectedChild(child.id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={child.avatar} />
                  <AvatarFallback>{getInitials(child.name)}</AvatarFallback>
                </Avatar>
                {child.name}
              </Button>
            ))}
          </div>
        </div>
      ) : children.length === 1 ? (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentChild?.avatar} />
                <AvatarFallback>{getInitials(currentChild?.name ?? '')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold">{currentChild?.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {currentChild?.class} - Section {currentChild?.section}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {children.length === 0 && !childrenLoading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No children found. Please contact the school administration.</p>
          </CardContent>
        </Card>
      )}

      {/* Leave History */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Leave History
            </CardTitle>
            <CardDescription>
              Past and pending leave applications for {currentChild?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leavesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No leave applications found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  Apply for Leave
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => {
                  const statusConfig = LEAVE_STATUS_STYLES[leave.status]
                  const StatusIcon = statusConfig.icon
                  return (
                    <div
                      key={leave.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            {LEAVE_TYPE_LABELS[leave.leaveType]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(statusConfig.bg, statusConfig.color)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-sm mt-2">{leave.reason}</p>
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">
                            Rejection reason: {leave.rejectionReason}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied on {formatDate(leave.appliedAt)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Submit a leave application for {currentChild?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('studentId')} />

            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select
                defaultValue="sick"
                onValueChange={(value) => setValue('leaveType', value as LeaveType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDate}
                  {...register('endDate', { required: 'End date is required' })}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for the leave..."
                {...register('reason', { required: 'Reason is required' })}
              />
              {errors.reason && (
                <p className="text-xs text-red-500">{errors.reason.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLeave.isPending}>
                {createLeave.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
