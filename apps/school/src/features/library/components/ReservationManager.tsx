import { useState } from 'react'
import { XCircle, Loader2, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useReservations, useCancelReservation } from '../hooks/useLibrary'
import { RESERVATION_STATUS_LABELS, type ReservationStatus } from '../types/library.types'
import { statusColors } from '@/lib/design-tokens'

const STATUS_VARIANT: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  fulfilled: 'secondary',
  cancelled: 'destructive',
  expired: 'outline',
}

export function ReservationManager() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: result, isLoading } = useReservations({ search, status: statusFilter, page, limit: 10 })
  const cancelMutation = useCancelReservation()

  const reservations = result?.data || []
  const pagination = result?.meta

  const activeCount = reservations.filter(r => r.status === 'active').length

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Cancelled', description: 'Reservation cancelled.' }),
      onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Book Reservations</h3>
        <p className="text-sm text-muted-foreground">Manage book reservation queue for unavailable titles</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: statusColors.info }}>{activeCount}</div>
            <p className="text-sm text-muted-foreground">Active in Queue</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by book or student..."
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : reservations.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No reservations found.</CardContent></Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Queue #</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-medium">{r.bookTitle}</span>
                    <span className="text-xs text-muted-foreground block font-mono">{r.bookIsbn}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{r.studentName}</span>
                    <span className="text-xs text-muted-foreground ml-1">{r.studentClass}-{r.studentSection}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">#{r.queuePosition}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(r.reservedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{new Date(r.expiresAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status]}>{RESERVATION_STATUS_LABELS[r.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(r.id)} disabled={cancelMutation.isPending}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
