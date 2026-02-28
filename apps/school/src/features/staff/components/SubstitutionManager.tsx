import { useState, useMemo } from 'react'
import {
  Plus,
  Loader2,
  UserX,
  UserCheck,
  CalendarDays,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  useSubstitutions,
  useCreateSubstitution,
  useUpdateSubstitutionStatus,
  useStaffList,
} from '../hooks/useStaff'
import type { Substitution, SubstitutionStatus } from '../types/staff.types'
import { PERIODS } from '../types/staff.types'

interface SubstitutionManagerProps {
  staffId?: string
}

const STATUS_CONFIG: Record<SubstitutionStatus, { label: string; variant: string; className: string }> = {
  pending: { label: 'Pending', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  assigned: { label: 'Assigned', variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
  completed: { label: 'Completed', variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  cancelled: { label: 'Cancelled', variant: 'secondary', className: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' },
}

function SubstitutionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface CreateSubstitutionFormState {
  date: string
  absentStaffId: string
  substituteStaffId: string
  periodNumber: string
  class: string
  section: string
  subject: string
  reason: string
}

const initialFormState: CreateSubstitutionFormState = {
  date: '',
  absentStaffId: '',
  substituteStaffId: '',
  periodNumber: '',
  class: '',
  section: '',
  subject: '',
  reason: '',
}

export function SubstitutionManager({ staffId }: SubstitutionManagerProps) {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CreateSubstitutionFormState>(initialFormState)

  const { data: substitutionsResponse, isLoading } = useSubstitutions()
  const substitutionsData = substitutionsResponse?.data
  const { data: staffData } = useStaffList({ limit: 200 })
  const createSubstitution = useCreateSubstitution()
  const updateStatus = useUpdateSubstitutionStatus()

  // Filter substitutions when staffId is provided
  const substitutions = useMemo(() => {
    if (!substitutionsData) return []
    if (!staffId) return substitutionsData

    return substitutionsData.filter(
      (sub: Substitution) =>
        sub.absentStaffId === staffId || sub.substituteStaffId === staffId
    )
  }, [substitutionsData, staffId])

  const activeStaff = useMemo(() => {
    if (!staffData?.data) return []
    return staffData.data.filter((s) => s.status === 'active')
  }, [staffData?.data])

  const today = new Date().toISOString().split('T')[0]

  const updateFormField = (field: keyof CreateSubstitutionFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid =
    form.date &&
    form.absentStaffId &&
    form.substituteStaffId &&
    form.periodNumber &&
    form.class &&
    form.section &&
    form.subject &&
    form.absentStaffId !== form.substituteStaffId

  const handleCreate = () => {
    if (!isFormValid) return

    createSubstitution.mutate(
      {
        date: form.date,
        absentStaffId: form.absentStaffId,
        substituteStaffId: form.substituteStaffId,
        periodNumber: parseInt(form.periodNumber),
        class: form.class,
        section: form.section,
        subject: form.subject,
        reason: form.reason || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Substitution Created',
            description: 'The substitution record has been created successfully.',
          })
          setDialogOpen(false)
          setForm(initialFormState)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create substitution',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleStatusUpdate = (id: string, newStatus: SubstitutionStatus) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `Substitution marked as ${STATUS_CONFIG[newStatus].label.toLowerCase()}.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update status',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setForm(initialFormState)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Substitutions
          </CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Substitution
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SubstitutionListSkeleton />
          ) : substitutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Substitutions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {staffId
                  ? 'No substitution records found for this staff member.'
                  : 'No substitution records found. Create one to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {substitutions.map((sub: Substitution) => {
                const statusConfig = STATUS_CONFIG[sub.status]
                const periodInfo = PERIODS.find((p) => p.number === sub.periodNumber)

                return (
                  <div
                    key={sub.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(sub.date)}</span>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {periodInfo?.label || `Period ${sub.periodNumber}`}
                        </Badge>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', statusConfig.className)}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-red-500 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Absent</p>
                          <p className="font-medium">{sub.absentStaffName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Substitute</p>
                          <p className="font-medium">{sub.substituteStaffName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Class & Subject</p>
                        <p className="font-medium">
                          {sub.class}-{sub.section} | {sub.subject}
                        </p>
                      </div>
                    </div>

                    {sub.reason && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                        Reason: {sub.reason}
                      </p>
                    )}

                    {/* Action Buttons based on current status */}
                    {sub.status === 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(sub.id, 'assigned')}
                          disabled={updateStatus.isPending}
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(sub.id, 'cancelled')}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    )}
                    {sub.status === 'assigned' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(sub.id, 'completed')}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(sub.id, 'cancelled')}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Substitution Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Create Substitution
            </DialogTitle>
            <DialogDescription>
              Assign a substitute teacher for an absent staff member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="sub-date">Date *</Label>
              <Input
                id="sub-date"
                type="date"
                value={form.date}
                onChange={(e) => updateFormField('date', e.target.value)}
                min={today}
              />
            </div>

            {/* Absent Teacher */}
            <div className="space-y-2">
              <Label htmlFor="absent-staff">Absent Teacher *</Label>
              <Select
                value={form.absentStaffId}
                onValueChange={(v) => updateFormField('absentStaffId', v)}
              >
                <SelectTrigger id="absent-staff">
                  <SelectValue placeholder="Select absent teacher" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Substitute Teacher */}
            <div className="space-y-2">
              <Label htmlFor="substitute-staff">Substitute Teacher *</Label>
              <Select
                value={form.substituteStaffId}
                onValueChange={(v) => updateFormField('substituteStaffId', v)}
              >
                <SelectTrigger id="substitute-staff">
                  <SelectValue placeholder="Select substitute teacher" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff
                    .filter((staff) => staff.id !== form.absentStaffId)
                    .map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.department}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.absentStaffId && form.substituteStaffId && form.absentStaffId === form.substituteStaffId && (
                <p className="text-xs text-destructive">
                  Substitute teacher must be different from the absent teacher.
                </p>
              )}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="sub-period">Period *</Label>
              <Select
                value={form.periodNumber}
                onValueChange={(v) => updateFormField('periodNumber', v)}
              >
                <SelectTrigger id="sub-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.number} value={String(period.number)}>
                      {period.label} ({period.startTime} - {period.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class and Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub-class">Class *</Label>
                <Input
                  id="sub-class"
                  placeholder="e.g. 10"
                  value={form.class}
                  onChange={(e) => updateFormField('class', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-section">Section *</Label>
                <Input
                  id="sub-section"
                  placeholder="e.g. A"
                  value={form.section}
                  onChange={(e) => updateFormField('section', e.target.value)}
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="sub-subject">Subject *</Label>
              <Input
                id="sub-subject"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={(e) => updateFormField('subject', e.target.value)}
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="sub-reason">Reason</Label>
              <Textarea
                id="sub-reason"
                placeholder="Reason for absence (optional)"
                value={form.reason}
                onChange={(e) => updateFormField('reason', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isFormValid || createSubstitution.isPending}
            >
              {createSubstitution.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Substitution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
