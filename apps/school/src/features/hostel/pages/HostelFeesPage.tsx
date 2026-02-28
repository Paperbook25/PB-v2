import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, IndianRupee, AlertCircle, Plus } from 'lucide-react'
import { useHostelFees, usePayHostelFee, useHostelStats, useGenerateBulkFees } from '../hooks/useHostel'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { HOSTEL_FEE_TYPE_LABELS, HOSTEL_FEE_STATUS_LABELS, type HostelFeeType } from '../types/hostel.types'

export function HostelFeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>('')
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generateFormData, setGenerateFormData] = useState({
    month: '',
    feeType: 'room_rent' as HostelFeeType,
    dueDate: '',
    amount: 5000,
  })

  const { data: feesResult, isLoading } = useHostelFees({
    status: statusFilter || undefined,
    feeType: feeTypeFilter || undefined,
    month: monthFilter || undefined,
  })
  const { data: statsResult } = useHostelStats()
  const payFee = usePayHostelFee()
  const generateBulkFees = useGenerateBulkFees()
  const { toast } = useToast()

  const fees = feesResult?.data || []
  const stats = statsResult?.data

  const months = [
    { value: '2024-10', label: 'October 2024' },
    { value: '2024-11', label: 'November 2024' },
    { value: '2024-12', label: 'December 2024' },
    { value: '2025-01', label: 'January 2025' },
  ]

  const handlePayFee = async (id: string) => {
    try {
      await payFee.mutateAsync(id)
      toast({ title: 'Fee payment recorded successfully' })
    } catch {
      toast({ title: 'Failed to record payment', variant: 'destructive' })
    }
  }

  const handleGenerateBills = async () => {
    if (!generateFormData.month || !generateFormData.dueDate) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' })
      return
    }
    try {
      const result = await generateBulkFees.mutateAsync(generateFormData)
      toast({
        title: 'Bills generated successfully',
        description: `Created ${result.data.created} fee entries for all active residents`,
      })
      setIsGenerateDialogOpen(false)
      setGenerateFormData({
        month: '',
        feeType: 'room_rent',
        dueDate: '',
        amount: 5000,
      })
    } catch {
      toast({ title: 'Failed to generate bills', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'overdue')
  const totalPending = pendingFees.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div>
      <PageHeader
        title="Hostel Fees"
        description="Manage hostel fee collection"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Fees' },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.pendingFeesAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingFees || 0} pending entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {fees.filter((f) => f.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">Require follow-up</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Collected This Month</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  fees
                    .filter((f) => f.status === 'paid' && f.month === '2025-01')
                    .reduce((sum, f) => sum + f.amount, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">January 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">With active allocations</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Status</Label>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(HOSTEL_FEE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fee Type</Label>
                <Select value={feeTypeFilter || 'all'} onValueChange={(v) => setFeeTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(HOSTEL_FEE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Month</Label>
                <Select value={monthFilter || 'all'} onValueChange={(v) => setMonthFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsGenerateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Bills
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading fees...</div>
            ) : fees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fee records found. Try adjusting your filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.studentName}</TableCell>
                      <TableCell>
                        {fee.roomNumber} ({fee.hostelName})
                      </TableCell>
                      <TableCell>{HOSTEL_FEE_TYPE_LABELS[fee.feeType]}</TableCell>
                      <TableCell>{fee.month}</TableCell>
                      <TableCell>{formatCurrency(fee.amount)}</TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(fee.status)}>
                          {HOSTEL_FEE_STATUS_LABELS[fee.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fee.status !== 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayFee(fee.id)}
                            disabled={payFee.isPending}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Mark Paid
                          </Button>
                        )}
                        {fee.status === 'paid' && (
                          <span className="text-sm text-muted-foreground">
                            Paid on {fee.paidDate}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Generate Bills Dialog */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Bulk Fees</DialogTitle>
              <DialogDescription>
                Create fee entries for all active hostel residents
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Month *</Label>
                <Select
                  value={generateFormData.month}
                  onValueChange={(v) => setGenerateFormData({ ...generateFormData, month: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fee Type *</Label>
                <Select
                  value={generateFormData.feeType}
                  onValueChange={(v) =>
                    setGenerateFormData({ ...generateFormData, feeType: v as HostelFeeType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HOSTEL_FEE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (per student) *</Label>
                <Input
                  type="number"
                  value={generateFormData.amount}
                  onChange={(e) =>
                    setGenerateFormData({ ...generateFormData, amount: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g., 5000"
                />
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={generateFormData.dueDate}
                  onChange={(e) =>
                    setGenerateFormData({ ...generateFormData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateBills} disabled={generateBulkFees.isPending}>
                {generateBulkFees.isPending ? 'Generating...' : 'Generate Bills'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
