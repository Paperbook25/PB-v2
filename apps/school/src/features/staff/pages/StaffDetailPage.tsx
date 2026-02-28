import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { getInitials, formatDate, formatCurrency, cn } from '@/lib/utils'
import {
  useStaffMember,
  useDeleteStaff,
  useAttendanceSummary,
  useStaffAttendance,
  useLeaveBalance,
  useStaffLeaveRequests,
  useSalaryStructure,
  useSalarySlips,
  useCreateLeaveRequest,
} from '../hooks/useStaff'
import { DeleteStaffDialog } from '../components/DeleteStaffDialog'
import { AttendanceCalendar } from '../components/AttendanceCalendar'
import { LeaveBalanceCard } from '../components/LeaveBalanceCard'
import { LeaveRequestForm } from '../components/LeaveRequestForm'
import { SalarySlipView } from '../components/SalarySlipView'
import { TimetableView } from '../components/TimetableView'
import { PerformanceReviewCard } from '../components/PerformanceReviewCard'
import { ProfessionalDevCard } from '../components/ProfessionalDevCard'
import { LEAVE_TYPE_LABELS, type LeaveStatus, type LeaveType } from '../types/staff.types'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
}

export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leaveFormOpen, setLeaveFormOpen] = useState(false)

  // Get current month/year for attendance
  const now = new Date()
  const [attendanceMonth, setAttendanceMonth] = useState(now.getMonth() + 1)
  const [attendanceYear, setAttendanceYear] = useState(now.getFullYear())

  // Queries
  const { data: staffData, isLoading, error } = useStaffMember(id!)
  const deleteStaff = useDeleteStaff()

  const { data: attendanceSummary } = useAttendanceSummary(id!, attendanceMonth, attendanceYear)
  const { data: attendanceRecords } = useStaffAttendance(id!, attendanceMonth, attendanceYear)
  const { data: leaveBalance } = useLeaveBalance(id!)
  const { data: leaveRequests } = useStaffLeaveRequests(id!)
  const { data: salaryStructure } = useSalaryStructure(id!)
  const { data: salarySlips } = useSalarySlips(id!)
  const createLeaveRequest = useCreateLeaveRequest()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error || !staffData?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Staff member not found</p>
        <Button onClick={() => navigate('/staff')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff
        </Button>
      </div>
    )
  }

  const staff = staffData.data
  const summary = attendanceSummary?.data
  const attendance = attendanceRecords?.data || []
  const balance = leaveBalance?.data
  const leaves = leaveRequests?.data || []
  const structure = salaryStructure?.data
  const slips = salarySlips?.data || []

  const handleDelete = () => {
    deleteStaff.mutate(id!, {
      onSuccess: () => {
        toast({
          title: 'Staff Deleted',
          description: `${staff.name} has been removed from the system.`,
        })
        navigate('/staff')
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete staff member',
          variant: 'destructive',
        })
      },
    })
  }

  const handleLeaveSubmit = (data: { type: LeaveType; startDate: string; endDate: string; reason: string }) => {
    createLeaveRequest.mutate(
      { staffId: id!, data },
      {
        onSuccess: () => {
          toast({
            title: 'Leave Request Submitted',
            description: 'Your leave request has been submitted for approval.',
          })
          setLeaveFormOpen(false)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to submit leave request',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <div>
      <PageHeader
        title={staff.name}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: staff.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button size="sm" onClick={() => navigate(`/staff/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={staff.photoUrl} alt={staff.name} />
              <AvatarFallback className="text-2xl">{getInitials(staff.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{staff.name}</h2>
                <Badge
                  variant={
                    staff.status === 'active'
                      ? 'success'
                      : staff.status === 'on_leave'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {staff.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {staff.designation} | {staff.department}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-mono font-medium">{staff.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDate(staff.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{formatDate(staff.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-medium">{formatCurrency(staff.salary)}/month</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        {/* Timetable Tab */}
        <TabsContent value="timetable" className="space-y-4">
          <TimetableView staffId={id!} />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow icon={Mail} label="Email" value={staff.email} />
                <InfoRow icon={Phone} label="Phone" value={staff.phone} />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={`${staff.address.street}, ${staff.address.city}, ${staff.address.state} - ${staff.address.pincode}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow icon={Building} label="Department" value={staff.department} />
                <InfoRow icon={GraduationCap} label="Qualification" value={staff.qualification.join(', ')} />
                <InfoRow icon={GraduationCap} label="Specialization" value={staff.specialization} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">{summary.attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                  <p className="text-sm text-muted-foreground">Days Present</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
                  <p className="text-sm text-muted-foreground">Days Absent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{summary.halfDay || 0}</p>
                  <p className="text-sm text-muted-foreground">Half Days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">{summary.onLeave}</p>
                  <p className="text-sm text-muted-foreground">On Leave</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar
                month={attendanceMonth}
                year={attendanceYear}
                records={attendance}
                onMonthChange={(m, y) => {
                  setAttendanceMonth(m)
                  setAttendanceYear(y)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-4">
          {balance && <LeaveBalanceCard balance={balance} />}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Leave History</CardTitle>
                <CardDescription>Past and upcoming leave requests</CardDescription>
              </div>
              <Button onClick={() => setLeaveFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaves.slice(0, 10).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{LEAVE_TYPE_LABELS[leave.type]}</Badge>
                          <Badge className={cn(LEAVE_STATUS_COLORS[leave.status])}>
                            {leave.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.numberOfDays} days)
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied {formatDate(leave.appliedOn)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value="salary" className="space-y-4">
          {structure && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Salary Structure</CardTitle>
                <CardDescription>Monthly salary breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">Earnings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Basic</span>
                        <span>{formatCurrency(structure.basic)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>{formatCurrency(structure.hra)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DA</span>
                        <span>{formatCurrency(structure.da)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conveyance</span>
                        <span>{formatCurrency(structure.conveyance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Special Allowance</span>
                        <span>{formatCurrency(structure.specialAllowance)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Gross Salary</span>
                        <span className="text-green-600">{formatCurrency(structure.grossSalary)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 mb-3">Deductions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>PF</span>
                        <span>{formatCurrency(structure.pf)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Tax</span>
                        <span>{formatCurrency(structure.professionalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TDS</span>
                        <span>{formatCurrency(structure.tds)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total Deductions</span>
                        <span className="text-red-600">{formatCurrency(structure.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Net Monthly Salary</span>
                    <span className="text-2xl font-bold">{formatCurrency(structure.netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Salary Slips */}
          {slips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Salary Slips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slips.slice(0, 3).map((slip) => (
                    <SalarySlipView key={slip.id} slip={slip} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <PerformanceReviewCard staffId={id!} />
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development" className="space-y-4">
          <ProfessionalDevCard staffId={id!} />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <DeleteStaffDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        staffName={staff.name}
        onConfirm={handleDelete}
        isDeleting={deleteStaff.isPending}
      />

      {/* Leave Request Form */}
      <LeaveRequestForm
        open={leaveFormOpen}
        onOpenChange={setLeaveFormOpen}
        onSubmit={handleLeaveSubmit}
        isSubmitting={createLeaveRequest.isPending}
        leaveBalance={balance}
      />
    </div>
  )
}
