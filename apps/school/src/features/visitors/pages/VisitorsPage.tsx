import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { UserPlus, Users, Clock, LogOut, UserCheck, TrendingUp } from 'lucide-react'
import {
  useActivePasses,
  useCreatePass,
  useCheckOut,
  useVisitorStats,
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
import { statusColors } from '@/lib/design-tokens'

export function VisitorsPage() {
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
    <div>
      <PageHeader
        title="Visitor Management"
        description="Check-in visitors and manage passes"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Visitors' }]}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">Total check-ins today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <UserCheck className="h-4 w-4" style={{ color: statusColors.success }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: statusColors.success }}>{stats?.activeVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">Currently in premises</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgVisitDuration || 0}m</div>
              <p className="text-xs text-muted-foreground">Peak hour: {stats?.peakHour || 'N/A'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.weeklyTotal || 0}</div>
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
    </div>
  )
}
