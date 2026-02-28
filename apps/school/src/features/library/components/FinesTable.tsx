import { useState } from 'react'
import {
  IndianRupee,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useFines, useUpdateFine } from '../hooks/useLibrary'
import type { Fine, FineStatus, FineFilters } from '../types/library.types'

interface FinesTableProps {
  filters: FineFilters
  onFiltersChange: (filters: FineFilters) => void
}

export function FinesTable({ filters, onFiltersChange }: FinesTableProps) {
  const { toast } = useToast()
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false)
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null)
  const [waiveReason, setWaiveReason] = useState('')

  const { data, isLoading, error } = useFines(filters)
  const updateFine = useUpdateFine()

  const fines = data?.data || []
  const pagination = data?.meta

  const pendingFinesTotal = fines
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0)

  const handleMarkPaid = (fine: Fine) => {
    updateFine.mutate(
      { id: fine.id, data: { status: 'paid' } },
      {
        onSuccess: () => {
          toast({
            title: 'Fine Marked as Paid',
            description: `Fine of Rs ${fine.amount} has been marked as paid.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Update Failed',
            description: error instanceof Error ? error.message : 'Failed to update fine',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleWaive = () => {
    if (!selectedFine) return

    updateFine.mutate(
      { id: selectedFine.id, data: { status: 'waived', waivedReason: waiveReason } },
      {
        onSuccess: () => {
          toast({
            title: 'Fine Waived',
            description: `Fine of Rs ${selectedFine.amount} has been waived.`,
          })
          setWaiveDialogOpen(false)
          setSelectedFine(null)
          setWaiveReason('')
        },
        onError: (error) => {
          toast({
            title: 'Waive Failed',
            description: error instanceof Error ? error.message : 'Failed to waive fine',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const getStatusBadge = (status: FineStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'waived':
        return <Badge variant="secondary">Waived</Badge>
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load fines. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Fine Management
              </CardTitle>
              <CardDescription>Track and manage overdue fines</CardDescription>
            </div>
            {pendingFinesTotal > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pending Collection</p>
                <p className="text-xl font-bold text-destructive">Rs {pendingFinesTotal}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by book or student..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, status: value as FineStatus | 'all', page: 1 })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Overdue Days</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[40px] mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[60px] ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[70px] mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : fines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No fines found
                    </TableCell>
                  </TableRow>
                ) : (
                  fines.map((fine) => (
                    <TableRow key={fine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{fine.bookTitle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{fine.studentName}</p>
                          <p className="text-xs text-muted-foreground">{fine.studentClass}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{fine.overdueDays}</TableCell>
                      <TableCell className="text-right font-medium">Rs {fine.amount}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(fine.status)}</TableCell>
                      <TableCell className="text-center">
                        {fine.status === 'pending' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={updateFine.isPending}
                              >
                                {updateFine.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMarkPaid(fine)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedFine(fine)
                                  setWaiveDialogOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Waive Fine
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {fine.status === 'paid' && fine.paidAt
                              ? `Paid ${new Date(fine.paidAt).toLocaleDateString()}`
                              : fine.status === 'waived'
                                ? fine.waivedReason || 'Waived'
                                : '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waive Dialog */}
      <Dialog open={waiveDialogOpen} onOpenChange={setWaiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Fine</DialogTitle>
            <DialogDescription>
              Are you sure you want to waive this fine of Rs {selectedFine?.amount}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="waiveReason">Reason for waiving (optional)</Label>
              <Textarea
                id="waiveReason"
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="Enter reason for waiving the fine..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWaive} disabled={updateFine.isPending}>
              {updateFine.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Waiving...
                </>
              ) : (
                'Waive Fine'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
