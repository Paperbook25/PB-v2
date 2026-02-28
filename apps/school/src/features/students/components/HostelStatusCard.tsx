import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, BedDouble, MapPin, Calendar, IndianRupee, Loader2 } from 'lucide-react'
import { useStudentHostelAllocation } from '../hooks/useStudents'
import { useHostelFees, usePayHostelFee } from '@/features/hostel/hooks/useHostel'
import { HOSTEL_FEE_TYPE_LABELS } from '@/features/hostel/types/hostel.types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface HostelStatusCardProps {
  studentId: string
}

export function HostelStatusCard({ studentId }: HostelStatusCardProps) {
  const { data: allocationResponse, isLoading } = useStudentHostelAllocation(studentId)
  const allocation = allocationResponse?.data
  const { data: feesResult, isLoading: feesLoading } = useHostelFees({ studentId })
  const payFee = usePayHostelFee()
  const { toast } = useToast()

  const fees = feesResult?.data || []
  const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'overdue')
  const totalPending = pendingFees.reduce((sum, f) => sum + f.amount, 0)

  const handlePayFee = async (feeId: string) => {
    try {
      await payFee.mutateAsync(feeId)
      toast({ title: 'Fee paid successfully' })
    } catch {
      toast({ title: 'Failed to pay fee', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hostel Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!allocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hostel Allocation</CardTitle>
          <CardDescription>No active hostel allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              This student is not currently allocated to any hostel room.
            </p>
            <Button asChild variant="outline">
              <Link to="/hostel/allocations">Go to Hostel Allocations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Hostel Allocation</CardTitle>
            <CardDescription>Current room assignment</CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Hostel Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Hostel</p>
                <p className="font-medium">{allocation.hostelName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-medium">Room {allocation.roomNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Bed Number</p>
                <p className="font-medium">Bed {allocation.bedNumber}</p>
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Allocated Since</p>
                <p className="font-medium">{formatDate(allocation.startDate)}</p>
              </div>
            </div>

            {allocation.endDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(allocation.endDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Hostel Fees Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Hostel Fees</h4>
            {totalPending > 0 && (
              <Badge variant="destructive">
                {formatCurrency(totalPending)} pending
              </Badge>
            )}
          </div>

          {feesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : fees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No fee records found for this student.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.slice(0, 6).map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {HOSTEL_FEE_TYPE_LABELS[fee.feeType]}
                    </TableCell>
                    <TableCell>{fee.month}</TableCell>
                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          fee.status === 'paid'
                            ? 'success'
                            : fee.status === 'overdue'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {fee.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayFee(fee.id)}
                          disabled={payFee.isPending}
                        >
                          <IndianRupee className="h-3 w-3 mr-1" />
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {fees.length > 6 && (
            <div className="text-center mt-2">
              <Button asChild variant="link" size="sm">
                <Link to="/hostel/fees">View all fees →</Link>
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/hostel/allocations">View All Allocations</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/hostel/fees">Manage All Fees</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
