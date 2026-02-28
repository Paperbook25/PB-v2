import { useState } from 'react'
import { Calculator, FileText, History, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import { MonthlySalaryRun } from '../components/MonthlySalaryRun'
import { SalarySlipView } from '../components/SalarySlipView'
import { useStaffList, useProcessMonthlySalary, useMarkSalaryPaid } from '../hooks/useStaff'
import type { SalarySlip, Staff } from '../types/staff.types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function SalaryManagementPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)

  const { data: staffData, isLoading: staffLoading } = useStaffList({ limit: 100 })
  const processSalary = useProcessMonthlySalary()
  const markPaid = useMarkSalaryPaid()

  const staffList = staffData?.data || []
  const filteredStaff = staffList
    .filter((s) => s.status === 'active')
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleProcessSalary = async (month: number, year: number) => {
    try {
      const result = await processSalary.mutateAsync({ month, year })
      toast({
        title: 'Salary Processed',
        description: `Generated ${result.data.length} salary slips for ${MONTHS[month - 1]} ${year}`,
      })
      return result.data
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process salary',
        variant: 'destructive',
      })
      return []
    }
  }

  const handleMarkPaid = async () => {
    if (!selectedSlip) return

    try {
      await markPaid.mutateAsync(selectedSlip.id)
      toast({
        title: 'Salary Paid',
        description: `Salary marked as paid for ${selectedSlip.staffName}`,
      })
      setSlipDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark as paid',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Salary Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'Salary Management' },
        ]}
      />

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process" className="gap-2">
            <Play className="h-4 w-4" />
            Monthly Processing
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <Calculator className="h-4 w-4" />
            Salary Structure
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Monthly Processing Tab */}
        <TabsContent value="process" className="space-y-4">
          <MonthlySalaryRun
            onProcess={handleProcessSalary}
            isProcessing={processSalary.isPending}
          />
        </TabsContent>

        {/* Salary Structure Tab */}
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Salary Structure</CardTitle>
              <CardDescription>View and manage salary components for each staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs mb-4"
              />

              {staffLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Monthly Salary</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.photoUrl} />
                              <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">{staff.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>{staff.designation}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(staff.salary)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/staff/${staff.id}?tab=salary`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all salary payments made</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a staff member to view their payment history</p>
                <p className="text-sm mt-2">
                  Individual payment history can be viewed from the staff detail page
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Salary Slip Dialog */}
      <Dialog open={slipDialogOpen} onOpenChange={setSlipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Salary Slip</DialogTitle>
          </DialogHeader>
          {selectedSlip && (
            <SalarySlipView
              slip={selectedSlip}
              onMarkPaid={handleMarkPaid}
              isMarkingPaid={markPaid.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
