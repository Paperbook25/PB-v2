import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogTrigger,
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
import {
  UserPlus,
  Users,
  Clock,
  LogOut,
  UserCheck,
  TrendingUp,
  Search,
  Download,
  Plus,
  XCircle,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import {
  useActivePasses,
  useCreatePass,
  useCheckOut,
  useVisitorStats,
  usePasses,
  useVisitorReports,
  usePreApproved,
  useCreatePreApproved,
  useRevokePreApproved,
} from '../hooks/useVisitors'
import { useToast } from '@/hooks/use-toast'
import {
  VISIT_PURPOSE_LABELS,
  VISIT_STATUS_LABELS,
  ID_TYPE_LABELS,
  HOST_TYPE_LABELS,
  type VisitPurpose,
  type IdType,
  type HostType,
} from '../types/visitor.types'

// Tab type
type VisitorTab = 'checkin' | 'logs' | 'reports' | 'preapproved'

// ============================================
// Check-In Tab Component
// ============================================
function CheckInTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: activeResult } = useActivePasses()
  const { data: statsResult } = useVisitorStats()
  const createPass = useCreatePass()
  const checkOut = useCheckOut()
  const { toast } = useToast()

  const activePasses = activeResult?.data || []
  const stats = statsResult?.data

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorIdType: 'aadhaar' as IdType,
    visitorIdNumber: '',
    visitorCompany: '',
    vehicleNumber: '',
    purpose: 'meeting' as VisitPurpose,
    purposeDetails: '',
    hostType: 'staff' as HostType,
    hostId: '',
    hostName: '',
    hostDepartment: '',
    expectedDuration: 60,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPass.mutateAsync(formData)
      toast({ title: 'Visitor checked in successfully' })
      setIsDialogOpen(false)
      setFormData({
        visitorName: '',
        visitorPhone: '',
        visitorIdType: 'aadhaar',
        visitorIdNumber: '',
        visitorCompany: '',
        vehicleNumber: '',
        purpose: 'meeting',
        purposeDetails: '',
        hostType: 'staff',
        hostId: '',
        hostName: '',
        hostDepartment: '',
        expectedDuration: 60,
      })
    } catch {
      toast({ title: 'Failed to check in visitor', variant: 'destructive' })
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      await checkOut.mutateAsync(id)
      toast({ title: 'Visitor checked out successfully' })
    } catch {
      toast({ title: 'Failed to check out visitor', variant: 'destructive' })
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDuration = (checkInTime: string) => {
    const minutes = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000)
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4" style={{ color: 'var(--color-module-visitors)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-visitors)' }}>{stats?.todayVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">Total check-ins today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <UserCheck className="h-4 w-4" style={{ color: 'var(--color-module-visitors)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-visitors)' }}>{stats?.activeVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in premises</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4" style={{ color: 'var(--color-module-visitors)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-visitors)' }}>{stats?.avgVisitDuration || 0}m</div>
            <p className="text-xs text-muted-foreground">Peak hour: {stats?.peakHour || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-module-visitors)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-visitors)' }}>{stats?.weeklyTotal || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.monthlyTotal || 0} this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Visitors</CardTitle>
              <CardDescription>Visitors currently in the premises</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Check In Visitor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Visitor Check-In</DialogTitle>
                  <DialogDescription>Register a new visitor</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Visitor Name *</Label>
                        <Input
                          value={formData.visitorName}
                          onChange={(e) =>
                            setFormData({ ...formData, visitorName: e.target.value })
                          }
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Phone *</Label>
                        <Input
                          value={formData.visitorPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, visitorPhone: e.target.value })
                          }
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ID Type</Label>
                        <Select
                          value={formData.visitorIdType}
                          onValueChange={(v) =>
                            setFormData({ ...formData, visitorIdType: v as IdType })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ID_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>ID Number</Label>
                        <Input
                          value={formData.visitorIdNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, visitorIdNumber: e.target.value })
                          }
                          placeholder="ID number"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Company/Organization</Label>
                        <Input
                          value={formData.visitorCompany}
                          onChange={(e) =>
                            setFormData({ ...formData, visitorCompany: e.target.value })
                          }
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label>Vehicle Number</Label>
                        <Input
                          value={formData.vehicleNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, vehicleNumber: e.target.value })
                          }
                          placeholder="KA-01-AB-1234"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Purpose *</Label>
                        <Select
                          value={formData.purpose}
                          onValueChange={(v) =>
                            setFormData({ ...formData, purpose: v as VisitPurpose })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(VISIT_PURPOSE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Expected Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={formData.expectedDuration}
                          onChange={(e) =>
                            setFormData({ ...formData, expectedDuration: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Purpose Details</Label>
                      <Input
                        value={formData.purposeDetails}
                        onChange={(e) =>
                          setFormData({ ...formData, purposeDetails: e.target.value })
                        }
                        placeholder="Brief description of visit purpose"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Host Type</Label>
                        <Select
                          value={formData.hostType}
                          onValueChange={(v) =>
                            setFormData({ ...formData, hostType: v as HostType })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(HOST_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Host Name *</Label>
                        <Input
                          value={formData.hostName}
                          onChange={(e) =>
                            setFormData({ ...formData, hostName: e.target.value })
                          }
                          placeholder="Person to meet"
                          required
                        />
                      </div>
                      <div>
                        <Label>Department/Class</Label>
                        <Input
                          value={formData.hostDepartment}
                          onChange={(e) =>
                            setFormData({ ...formData, hostDepartment: e.target.value })
                          }
                          placeholder="Department"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createPass.isPending}>
                      {createPass.isPending ? 'Checking In...' : 'Check In'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {activePasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active visitors at the moment
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass #</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePasses.map((pass) => (
                  <TableRow key={pass.id}>
                    <TableCell className="font-mono text-sm">{pass.passNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pass.visitorName}</p>
                        <p className="text-sm text-muted-foreground">{pass.visitorPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {VISIT_PURPOSE_LABELS[pass.purpose]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pass.hostName}</p>
                        <p className="text-sm text-muted-foreground">{pass.hostDepartment}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(pass.checkInTime)}</TableCell>
                    <TableCell>{getDuration(pass.checkInTime)}</TableCell>
                    <TableCell>
                      <Badge>{pass.badge}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(pass.id)}
                        disabled={checkOut.isPending}
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        Check Out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Logs Tab Component
// ============================================
function LogsTab() {
  const [dateFilter, setDateFilter] = useState('')
  const [purposeFilter, setPurposeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const { data: passesResult, isLoading } = usePasses({
    date: dateFilter || undefined,
    purpose: purposeFilter || undefined,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    page,
    limit: 20,
  })

  const passes = passesResult?.data || []
  const meta = passesResult?.meta

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return '-'
    const minutes = Math.floor(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000
    )
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  const getStatusColor = (status: string): React.CSSProperties => {
    switch (status) {
      case 'active':
        return { backgroundColor: 'var(--color-module-visitors-light)', color: 'var(--color-module-visitors)' }
      case 'completed':
        return { backgroundColor: 'var(--color-module-lms-light)', color: 'var(--color-module-lms)' }
      case 'expired':
        return { backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }
      case 'cancelled':
        return { backgroundColor: 'var(--color-module-exams-light)', color: 'var(--color-module-exams)' }
      default:
        return { backgroundColor: 'var(--color-module-settings-light)', color: 'var(--color-module-settings)' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, phone, pass..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label>Purpose</Label>
              <Select value={purposeFilter || 'all'} onValueChange={(v) => setPurposeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  {Object.entries(VISIT_PURPOSE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : passes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visitor logs found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass #</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passes.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell className="font-mono text-sm">{pass.passNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pass.visitorName}</p>
                          <p className="text-sm text-muted-foreground">{pass.visitorPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{pass.visitorCompany || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {VISIT_PURPOSE_LABELS[pass.purpose]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pass.hostName}</p>
                          <p className="text-sm text-muted-foreground">{pass.hostDepartment}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(pass.checkInTime)}</TableCell>
                      <TableCell>
                        {pass.checkOutTime ? formatDateTime(pass.checkOutTime) : '-'}
                      </TableCell>
                      <TableCell>
                        {calculateDuration(pass.checkInTime, pass.checkOutTime)}
                      </TableCell>
                      <TableCell>
                        <Badge style={getStatusColor(pass.status)}>
                          {VISIT_STATUS_LABELS[pass.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * (meta.limit) + 1} to{' '}
                    {Math.min(page * meta.limit, meta.total)} of {meta.total} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page === meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Reports Tab Component
// ============================================
function ReportsTab() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  const { data: reportsResult, isLoading } = useVisitorReports({
    startDate,
    endDate,
  })
  const { data: statsResult } = useVisitorStats()

  const reports = reportsResult?.data || []
  const stats = statsResult?.data

  // Calculate totals
  const totalVisitors = reports.reduce((sum, r) => sum + r.totalVisitors, 0)
  const avgDuration = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.avgDuration, 0) / reports.length)
    : 0

  // Purpose breakdown
  const purposeBreakdown: Record<VisitPurpose, number> = {
    meeting: 0,
    delivery: 0,
    parent_visit: 0,
    vendor: 0,
    interview: 0,
    other: 0,
  }
  reports.forEach((r) => {
    Object.entries(r.byPurpose).forEach(([purpose, count]) => {
      purposeBreakdown[purpose as VisitPurpose] += count
    })
  })

  const getPurposeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-500',
      delivery: 'bg-green-500',
      parent_visit: 'bg-purple-500',
      vendor: 'bg-orange-500',
      interview: 'bg-pink-500',
      other: 'bg-gray-500',
    }
    return colors[purpose] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}m</div>
            <p className="text-xs text-muted-foreground">Per visit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 ? Math.round(totalVisitors / reports.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Visitors per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pre-Approved</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.preApprovedActive || 0}</div>
            <p className="text-xs text-muted-foreground">Active passes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purpose Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Purpose</CardTitle>
            <CardDescription>Visitor distribution by purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(purposeBreakdown)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([purpose, count]) => {
                  const percentage = totalVisitors > 0 ? (count / totalVisitors) * 100 : 0
                  return (
                    <div key={purpose}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {VISIT_PURPOSE_LABELS[purpose as VisitPurpose]}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPurposeColor(purpose)} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Busiest times for visitor check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.length > 0 && reports[0].peakHours.length > 0 ? (
                reports[0].peakHours.map((peak, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {peak.hour}:00 - {peak.hour + 1}:00
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {peak.count} visitors
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Day-by-day visitor statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available for the selected period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Total</th>
                    <th className="pb-2 text-left font-medium">Meeting</th>
                    <th className="pb-2 text-left font-medium">Delivery</th>
                    <th className="pb-2 text-left font-medium">Parent</th>
                    <th className="pb-2 text-left font-medium">Vendor</th>
                    <th className="pb-2 text-left font-medium">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 10).map((report) => (
                    <tr key={report.date} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        {new Date(report.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 font-medium">{report.totalVisitors}</td>
                      <td className="py-3">{report.byPurpose.meeting || 0}</td>
                      <td className="py-3">{report.byPurpose.delivery || 0}</td>
                      <td className="py-3">{report.byPurpose.parent_visit || 0}</td>
                      <td className="py-3">{report.byPurpose.vendor || 0}</td>
                      <td className="py-3">{report.avgDuration}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Pre-Approved Tab Component
// ============================================
function PreApprovedTab() {
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: preApprovedResult, isLoading } = usePreApproved({
    status: statusFilter || undefined,
  })
  const createPreApproved = useCreatePreApproved()
  const revokePreApproved = useRevokePreApproved()
  const { toast } = useToast()

  const preApproved = preApprovedResult?.data || []

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorCompany: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    purpose: '',
    maxVisits: 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPreApproved.mutateAsync(formData)
      toast({ title: 'Pre-approved visitor added successfully' })
      setIsDialogOpen(false)
      setFormData({
        visitorName: '',
        visitorPhone: '',
        visitorCompany: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        purpose: '',
        maxVisits: 12,
      })
    } catch {
      toast({ title: 'Failed to add pre-approved visitor', variant: 'destructive' })
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this pre-approval?')) return
    try {
      await revokePreApproved.mutateAsync(id)
      toast({ title: 'Pre-approval revoked successfully' })
    } catch {
      toast({ title: 'Failed to revoke pre-approval', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string): React.CSSProperties => {
    switch (status) {
      case 'active':
        return { backgroundColor: 'var(--color-module-visitors-light)', color: 'var(--color-module-visitors)' }
      case 'expired':
        return { backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }
      case 'revoked':
        return { backgroundColor: 'var(--color-module-exams-light)', color: 'var(--color-module-exams)' }
      default:
        return { backgroundColor: 'var(--color-module-settings-light)', color: 'var(--color-module-settings)' }
    }
  }

  const getUsagePercentage = (used: number, max: number) => {
    return Math.round((used / max) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
            <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-module-visitors)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-visitors)' }}>
              {preApproved.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4" style={{ color: 'var(--color-module-finance)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-finance)' }}>
              {preApproved.filter((p) => p.status === 'expired').length}
            </div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <XCircle className="h-4 w-4" style={{ color: 'var(--color-module-exams)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-module-exams)' }}>
              {preApproved.filter((p) => p.status === 'revoked').length}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled passes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pre-Approved List</CardTitle>
              <CardDescription>Vendors, contractors, and regular visitors</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pre-Approved
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Pre-Approved Visitor</DialogTitle>
                    <DialogDescription>
                      Create a recurring access pass for a visitor
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Visitor Name *</Label>
                          <Input
                            value={formData.visitorName}
                            onChange={(e) =>
                              setFormData({ ...formData, visitorName: e.target.value })
                            }
                            placeholder="Full name"
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={formData.visitorPhone}
                            onChange={(e) =>
                              setFormData({ ...formData, visitorPhone: e.target.value })
                            }
                            placeholder="+91 9876543210"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Company/Organization</Label>
                        <Input
                          value={formData.visitorCompany}
                          onChange={(e) =>
                            setFormData({ ...formData, visitorCompany: e.target.value })
                          }
                          placeholder="Company name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Valid From *</Label>
                          <Input
                            type="date"
                            value={formData.validFrom}
                            onChange={(e) =>
                              setFormData({ ...formData, validFrom: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Valid Until *</Label>
                          <Input
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) =>
                              setFormData({ ...formData, validUntil: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Purpose *</Label>
                        <Input
                          value={formData.purpose}
                          onChange={(e) =>
                            setFormData({ ...formData, purpose: e.target.value })
                          }
                          placeholder="e.g., Regular stationary delivery"
                          required
                        />
                      </div>
                      <div>
                        <Label>Max Visits</Label>
                        <Input
                          type="number"
                          min={1}
                          value={formData.maxVisits}
                          onChange={(e) =>
                            setFormData({ ...formData, maxVisits: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createPreApproved.isPending}>
                        {createPreApproved.isPending ? 'Adding...' : 'Add Pre-Approved'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : preApproved.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pre-approved visitors found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preApproved.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.visitorName}</p>
                        <p className="text-sm text-muted-foreground">{item.visitorPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.visitorCompany || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.purpose}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{item.validFrom}</p>
                        <p className="text-muted-foreground">to {item.validUntil}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {item.usedVisits}/{item.maxVisits}
                        </div>
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${getUsagePercentage(item.usedVisits, item.maxVisits)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge style={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.approvedByName}</TableCell>
                    <TableCell>
                      {item.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevoke(item.id)}
                          disabled={revokePreApproved.isPending}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Main VisitorsMainPage Component
// ============================================
export function VisitorsMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Get active tab from URL or default to 'checkin'
  const activeTab = (searchParams.get('tab') as VisitorTab) || 'checkin'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div>
      <PageHeader
        title="Visitor Management"
        description="Check-in visitors, manage passes, and view reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Visitors' }]}
        moduleColor="visitors"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 hidden sm:block" />
            Check-In
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 hidden sm:block" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="preapproved" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 hidden sm:block" />
            Pre-Approved
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="checkin" className="mt-0">
            <CheckInTab />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <LogsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="preapproved" className="mt-0">
            <PreApprovedTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
