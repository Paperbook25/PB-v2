import { useState, useMemo } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Award,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useStaffPD, useCreatePD, useDeletePD } from '../hooks/useStaff'
import type {
  ProfessionalDevelopment,
  PDType,
  PDStatus,
  CreatePDRequest,
} from '../types/staff.types'
import { PD_TYPE_LABELS } from '../types/staff.types'

interface ProfessionalDevCardProps {
  staffId: string
}

const TYPE_COLORS: Record<PDType, string> = {
  certification: 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100',
  workshop: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100',
  seminar: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-800 dark:text-cyan-100',
  training: 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-100',
  conference: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100',
  course: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100',
}

const STATUS_COLORS: Record<PDStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100',
  completed: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100',
  expired: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100',
}

const STATUS_LABELS: Record<PDStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
}

function PDSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <Separator />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  )
}

function PDFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<CreatePDRequest, 'staffId'>) => void
  isPending: boolean
}) {
  const [type, setType] = useState<PDType | ''>('')
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hours, setHours] = useState('')
  const [cost, setCost] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<PDStatus | ''>('')
  const [expiryDate, setExpiryDate] = useState('')

  const handleSubmit = () => {
    if (!type || !title || !provider || !startDate || !status) return

    const data: Omit<CreatePDRequest, 'staffId'> = {
      type,
      title,
      provider,
      startDate,
      status,
      ...(endDate && { endDate }),
      ...(hours && { hours: parseFloat(hours) }),
      ...(cost && { cost: parseFloat(cost) }),
      ...(description && { description }),
      ...(expiryDate && { expiryDate }),
    }

    onSubmit(data)
  }

  const handleClose = () => {
    setType('')
    setTitle('')
    setProvider('')
    setStartDate('')
    setEndDate('')
    setHours('')
    setCost('')
    setDescription('')
    setStatus('')
    setExpiryDate('')
    onOpenChange(false)
  }

  const isValid = type && title.trim() && provider.trim() && startDate && status

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Add PD Record
          </DialogTitle>
          <DialogDescription>
            Record a new professional development activity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pdType">Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as PDType)}>
                <SelectTrigger id="pdType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PD_TYPE_LABELS) as PDType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {PD_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdStatus">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PDStatus)}>
                <SelectTrigger id="pdStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as PDStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="pdTitle">Title *</Label>
            <Input
              id="pdTitle"
              placeholder="e.g. Advanced Teaching Methodology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="pdProvider">Provider *</Label>
            <Input
              id="pdProvider"
              placeholder="e.g. National Institute of Education"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pdStartDate">Start Date *</Label>
              <Input
                id="pdStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdEndDate">End Date</Label>
              <Input
                id="pdEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Hours and Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pdHours">Hours</Label>
              <Input
                id="pdHours"
                type="number"
                placeholder="e.g. 40"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdCost">Cost</Label>
              <Input
                id="pdCost"
                type="number"
                placeholder="e.g. 5000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Expiry Date (for certifications) */}
          {type === 'certification' && (
            <div className="space-y-2">
              <Label htmlFor="pdExpiry">Expiry Date</Label>
              <Input
                id="pdExpiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={startDate}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="pdDescription">Description</Label>
            <Textarea
              id="pdDescription"
              placeholder="Brief description of the activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Record'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProfessionalDevCard({ staffId }: ProfessionalDevCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { toast } = useToast()
  const { data: recordsResponse, isLoading, isError } = useStaffPD(staffId)
  const records = recordsResponse?.data
  const createMutation = useCreatePD()
  const deleteMutation = useDeletePD()

  // Sort records by start date descending
  const sortedRecords = useMemo(() => {
    if (!records) return []
    return [...records].sort(
      (a: ProfessionalDevelopment, b: ProfessionalDevelopment) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  }, [records])

  // Summary statistics
  const stats = useMemo(() => {
    if (!records || records.length === 0) {
      return { total: 0, completed: 0, totalHours: 0, expiringSoon: 0 }
    }

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return {
      total: records.length,
      completed: records.filter((r: ProfessionalDevelopment) => r.status === 'completed').length,
      totalHours: records.reduce(
        (sum: number, r: ProfessionalDevelopment) => sum + (r.hours || 0),
        0
      ),
      expiringSoon: records.filter((r: ProfessionalDevelopment) => {
        if (r.type !== 'certification' || !r.expiryDate) return false
        const expiry = new Date(r.expiryDate)
        return expiry > now && expiry <= thirtyDaysFromNow
      }).length,
    }
  }, [records])

  const handleCreate = async (data: Omit<CreatePDRequest, 'staffId'>) => {
    try {
      await createMutation.mutateAsync({ staffId, data })
      toast({ title: 'Professional development record added successfully' })
      setDialogOpen(false)
    } catch {
      toast({
        title: 'Failed to add PD record',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'PD record deleted successfully' })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Failed to delete PD record',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          Professional Development
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Record
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PDSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load professional development records. Please try again.
          </div>
        ) : !records || records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <GraduationCap className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No professional development records</p>
            <p className="text-xs mt-1">
              Track certifications, workshops, and training activities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-xs">Total Records</span>
                </div>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-800">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Award className="h-3.5 w-3.5" />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-200">{stats.completed}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-800">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">Total Hours</span>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-200">{stats.totalHours}</p>
              </div>
              {stats.expiringSoon > 0 && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-800">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs">Expiring Soon</span>
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-200">{stats.expiringSoon}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Records List */}
            <div className="space-y-3">
              {sortedRecords.map((record: ProfessionalDevelopment) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          TYPE_COLORS[record.type]
                        }`}
                      >
                        {PD_TYPE_LABELS[record.type]}
                      </span>
                      <h4 className="text-sm font-medium">{record.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[record.status]
                        }`}
                      >
                        {STATUS_LABELS[record.status]}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(record.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>{record.provider}</span>
                    <span>
                      {formatDate(record.startDate)}
                      {record.endDate && ` - ${formatDate(record.endDate)}`}
                    </span>
                    {record.hours != null && record.hours > 0 && (
                      <span>{record.hours} hrs</span>
                    )}
                    {record.cost != null && record.cost > 0 && (
                      <span>Cost: {record.cost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    )}
                  </div>

                  {record.expiryDate && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatDate(record.expiryDate)}
                    </p>
                  )}

                  {record.description && (
                    <p className="text-sm text-muted-foreground pt-1">
                      {record.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Record Dialog */}
      <PDFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete PD Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this professional development record?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Record'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
