import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, Trash2, Search, Plus, ArrowRight } from 'lucide-react'
import {
  useSubstitutions,
  useApproveSubstitution,
  useRejectSubstitution,
  useDeleteSubstitution,
} from '../hooks/useTimetable'
import type { SubstitutionFilters, SubstitutionStatus } from '../types/timetable.types'
import { useToast } from '@/hooks/use-toast'
import { substitutionStatusColors, statusColors } from '@/lib/design-tokens'

interface SubstitutionListProps {
  onCreate: () => void
}

export function SubstitutionList({ onCreate }: SubstitutionListProps) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<SubstitutionFilters>({
    status: undefined,
    page: 1,
    limit: 10,
  })

  const { data: result, isLoading } = useSubstitutions(filters)
  const approveMutation = useApproveSubstitution()
  const rejectMutation = useRejectSubstitution()
  const deleteMutation = useDeleteSubstitution()

  const substitutions = result?.data ?? []
  const meta = result?.meta

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      toast({ title: 'Approved', description: 'Substitution has been approved.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to approve.', variant: 'destructive' })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id)
      toast({ title: 'Rejected', description: 'Substitution has been rejected.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to reject.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this substitution request?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: 'Deleted', description: 'Substitution has been removed.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: SubstitutionStatus) => {
    const styles = substitutionStatusColors[status]
    if (!styles) return null

    const labels: Record<SubstitutionStatus, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
    }

    return (
      <Badge style={{ backgroundColor: styles.bg, color: styles.text }}>
        {labels[status]}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Substitution Requests</CardTitle>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Substitution
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={filters.date || ''}
              onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
            />
          </div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === 'all' ? undefined : (value as SubstitutionStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {substitutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No substitutions found
                </TableCell>
              </TableRow>
            ) : (
              substitutions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {new Date(sub.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sub.periodName}</TableCell>
                  <TableCell>
                    {sub.className} - {sub.sectionName}
                  </TableCell>
                  <TableCell>{sub.subjectName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">{sub.originalTeacherName}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{sub.substituteTeacherName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{sub.reason}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {sub.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: statusColors.success }}
                            onClick={() => handleApprove(sub.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: statusColors.error }}
                            onClick={() => handleReject(sub.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        style={{ color: statusColors.error }}
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} requests
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
