import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Building2,
  BedDouble,
  Users,
  IndianRupee,
  UserCheck,
  UserX,
  Plus,
  Search,
  UserMinus,
  ArrowRightLeft,
  Check,
  AlertCircle,
  Pencil,
  Utensils,
  Coffee,
  Sun,
  Moon,
  CalendarDays,
  Clock,
} from 'lucide-react'
import {
  useHostelStats,
  useHostels,
  useHostelFees,
  useAllocations,
  useRooms,
  useCreateRoom,
  useCreateAllocation,
  useVacateAllocation,
  useTransferAllocation,
  usePayHostelFee,
  useGenerateBulkFees,
  useMessMenu,
  useUpdateMessMenu,
  useHostelAttendance,
  useMarkBulkHostelAttendance,
} from '@/features/hostel/hooks/useHostel'
import { StudentSelector } from '@/features/hostel/components/StudentSelector'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { getAttendanceBadgeVariant } from '@/lib/attendance-ui'
import {
  HOSTEL_TYPE_LABELS,
  HOSTEL_FEE_STATUS_LABELS,
  HOSTEL_FEE_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  ROOM_STATUS_LABELS,
  ALLOCATION_STATUS_LABELS,
  MEAL_TYPE_LABELS,
  ATTENDANCE_STATUS_LABELS,
  type RoomType,
  type RoomAllocation,
  type HostelFeeType,
  type MealType,
  type HostelAttendanceStatus,
} from '@/features/hostel/types/hostel.types'
import type { EligibleStudent } from '@/features/hostel/api/hostel.api'
import type { HostelSubTab } from '../types/operations.types'

interface HostelTabProps {
  subTab: HostelSubTab
  onSubTabChange: (value: HostelSubTab) => void
}

// Constants
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <Sun className="h-4 w-4" />,
  snacks: <Utensils className="h-4 w-4" />,
  dinner: <Moon className="h-4 w-4" />,
}

// ============================================
// Dashboard SubTab Component
// ============================================
function DashboardSubTab() {
  const { data: statsResult } = useHostelStats()
  const { data: hostelsResult } = useHostels()
  const { data: feesResult } = useHostelFees({ status: 'pending' })
  const { data: allocationsResult } = useAllocations({ status: 'active' })

  const stats = statsResult?.data
  const hostels = hostelsResult?.data || []
  const pendingFees = feesResult?.data?.slice(0, 5) || []
  const recentAllocations = allocationsResult?.data?.slice(0, 5) || []

  const statCards = [
    {
      title: 'Total Hostels',
      value: stats?.totalHostels || 0,
      icon: Building2,
      description: `${stats?.totalRooms || 0} rooms`,
    },
    {
      title: 'Total Beds',
      value: stats?.totalBeds || 0,
      icon: BedDouble,
      description: `${stats?.availableBeds || 0} available`,
    },
    {
      title: 'Residents',
      value: stats?.totalStudents || 0,
      icon: Users,
      description: `${stats?.occupiedBeds || 0} beds occupied`,
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(stats?.pendingFeesAmount || 0),
      icon: IndianRupee,
      description: `${stats?.pendingFees || 0} pending`,
    },
    {
      title: 'Present Today',
      value: stats?.todayPresent || 0,
      icon: UserCheck,
      description: 'Night roll call',
    },
    {
      title: 'Absent Today',
      value: stats?.todayAbsent || 0,
      icon: UserX,
      description: 'Night roll call',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hostels Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Hostels</CardTitle>
            <CardDescription>All hostels and their occupancy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hostels.map((hostel) => (
                <div
                  key={hostel.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{hostel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {HOSTEL_TYPE_LABELS[hostel.type]} - {hostel.floors} floors
                    </p>
                    <p className="text-sm text-muted-foreground">Warden: {hostel.wardenName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {hostel.occupancy}/{hostel.capacity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((hostel.occupancy / hostel.capacity) * 100)}% occupied
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Fees</CardTitle>
            <CardDescription>Students with pending hostel fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingFees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending fees</p>
              ) : (
                pendingFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{fee.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {fee.roomNumber} - {fee.month}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(fee.amount)}</p>
                      <Badge variant={fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {HOSTEL_FEE_STATUS_LABELS[fee.status]}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Current Residents</CardTitle>
          <CardDescription>Recently allocated students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Student</th>
                  <th className="pb-2 text-left font-medium">Class</th>
                  <th className="pb-2 text-left font-medium">Hostel</th>
                  <th className="pb-2 text-left font-medium">Room</th>
                  <th className="pb-2 text-left font-medium">Bed</th>
                  <th className="pb-2 text-left font-medium">Since</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b last:border-0">
                    <td className="py-3">{allocation.studentName}</td>
                    <td className="py-3">
                      {allocation.class}-{allocation.section}
                    </td>
                    <td className="py-3">{allocation.hostelName}</td>
                    <td className="py-3">{allocation.roomNumber}</td>
                    <td className="py-3">Bed {allocation.bedNumber}</td>
                    <td className="py-3">{allocation.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Rooms SubTab Component
// ============================================
function RoomsSubTab() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: roomsResult, isLoading } = useRooms({
    hostelId: hostelFilter || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  })
  const { data: hostelsResult } = useHostels()
  const createRoom = useCreateRoom()
  const { toast } = useToast()

  const rooms = roomsResult?.data || []
  const hostels = hostelsResult?.data || []

  const [formData, setFormData] = useState({
    hostelId: '',
    roomNumber: '',
    floor: 1,
    type: 'double' as RoomType,
    capacity: 2,
    monthlyRent: 6000,
    amenities: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRoom.mutateAsync(formData)
      toast({ title: 'Room created successfully' })
      setIsDialogOpen(false)
      setFormData({
        hostelId: '',
        roomNumber: '',
        floor: 1,
        type: 'double',
        capacity: 2,
        monthlyRent: 6000,
        amenities: [],
      })
    } catch {
      toast({ title: 'Failed to create room', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'full':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Hostel</Label>
              <Select value={hostelFilter || 'all'} onValueChange={(v) => setHostelFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  {hostels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room Type</Label>
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
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
                  {Object.entries(ROOM_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>Create a new room in a hostel</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Hostel</Label>
                        <Select
                          value={formData.hostelId}
                          onValueChange={(v) => setFormData({ ...formData, hostelId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Hostel" />
                          </SelectTrigger>
                          <SelectContent>
                            {hostels.map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Room Number</Label>
                          <Input
                            value={formData.roomNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, roomNumber: e.target.value })
                            }
                            placeholder="e.g., 101"
                          />
                        </div>
                        <div>
                          <Label>Floor</Label>
                          <Input
                            type="number"
                            min={1}
                            value={formData.floor}
                            onChange={(e) =>
                              setFormData({ ...formData, floor: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Room Type</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                type: v as RoomType,
                                capacity:
                                  v === 'single' ? 1 : v === 'double' ? 2 : v === 'triple' ? 3 : 6,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={formData.capacity}
                            onChange={(e) =>
                              setFormData({ ...formData, capacity: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Monthly Rent</Label>
                        <Input
                          type="number"
                          value={formData.monthlyRent}
                          onChange={(e) =>
                            setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createRoom.isPending}>
                        {createRoom.isPending ? 'Creating...' : 'Create Room'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No rooms found. Try adjusting your filters or add a new room.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                  <Badge className={getStatusColor(room.status)}>
                    {ROOM_STATUS_LABELS[room.status]}
                  </Badge>
                </div>
                <CardDescription>{room.hostelName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BedDouble className="h-4 w-4" />
                      {ROOM_TYPE_LABELS[room.type]}
                    </span>
                    <span>Floor {room.floor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Occupancy
                    </span>
                    <span>
                      {room.occupancy}/{room.capacity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Monthly Rent</span>
                    <span>{formatCurrency(room.monthlyRent)}</span>
                  </div>
                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Allocations SubTab Component
// ============================================
function AllocationsSubTab() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<RoomAllocation | null>(null)
  const [transferRoomId, setTransferRoomId] = useState('')
  const [transferBedNumber, setTransferBedNumber] = useState(1)

  const { data: allocationsResult, isLoading } = useAllocations({
    hostelId: hostelFilter || undefined,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  })
  const { data: hostelsResult } = useHostels()
  const { data: roomsResult } = useRooms({ status: 'available' })

  const createAllocation = useCreateAllocation()
  const vacateAllocation = useVacateAllocation()
  const transferAllocation = useTransferAllocation()
  const { toast } = useToast()

  const allocations = allocationsResult?.data || []
  const hostels = hostelsResult?.data || []
  const availableRooms = roomsResult?.data || []

  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null)
  const [formData, setFormData] = useState({
    roomId: '',
    bedNumber: 1,
    startDate: new Date().toISOString().split('T')[0],
  })

  const selectedRoom = availableRooms.find((r) => r.id === formData.roomId)
  const selectedHostel = hostels.find((h) => h.id === selectedRoom?.hostelId)
  const genderFilter = selectedHostel?.type === 'boys' ? 'male' : selectedHostel?.type === 'girls' ? 'female' : undefined

  const handleStudentSelect = (student: EligibleStudent | null) => {
    setSelectedStudent(student)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      toast({ title: 'Please select a student', variant: 'destructive' })
      return
    }
    try {
      await createAllocation.mutateAsync({
        roomId: formData.roomId,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        class: selectedStudent.class,
        section: selectedStudent.section,
        bedNumber: formData.bedNumber,
        startDate: formData.startDate,
      })
      toast({ title: 'Student allocated successfully' })
      setIsDialogOpen(false)
      setSelectedStudent(null)
      setFormData({
        roomId: '',
        bedNumber: 1,
        startDate: new Date().toISOString().split('T')[0],
      })
    } catch {
      toast({ title: 'Failed to allocate student', variant: 'destructive' })
    }
  }

  const handleVacate = async (id: string) => {
    if (!confirm('Are you sure you want to vacate this allocation?')) return
    try {
      await vacateAllocation.mutateAsync(id)
      toast({ title: 'Allocation vacated successfully' })
    } catch {
      toast({ title: 'Failed to vacate allocation', variant: 'destructive' })
    }
  }

  const handleTransfer = async () => {
    if (!selectedAllocation || !transferRoomId) return
    try {
      await transferAllocation.mutateAsync({
        id: selectedAllocation.id,
        data: { newRoomId: transferRoomId, bedNumber: transferBedNumber },
      })
      toast({ title: 'Student transferred successfully' })
      setIsTransferDialogOpen(false)
      setSelectedAllocation(null)
      setTransferRoomId('')
      setTransferBedNumber(1)
    } catch {
      toast({ title: 'Transfer failed', variant: 'destructive' })
    }
  }

  const openTransferDialog = (allocation: RoomAllocation) => {
    setSelectedAllocation(allocation)
    setTransferRoomId('')
    setTransferBedNumber(1)
    setIsTransferDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'vacated':
        return 'bg-gray-100 text-gray-800'
      case 'transferred':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Hostel</Label>
              <Select value={hostelFilter || 'all'} onValueChange={(v) => setHostelFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  {hostels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
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
                  {Object.entries(ALLOCATION_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Allocate Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Allocate Student to Room</DialogTitle>
                    <DialogDescription>
                      Assign a student to an available room
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Room</Label>
                        <Select
                          value={formData.roomId}
                          onValueChange={(v) => {
                            setFormData({ ...formData, roomId: v })
                            setSelectedStudent(null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Room" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRooms.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.hostelName} - Room {r.roomNumber} ({r.occupancy}/{r.capacity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Student</Label>
                        <StudentSelector
                          value={selectedStudent?.id}
                          onSelect={handleStudentSelect}
                          gender={genderFilter}
                          placeholder={
                            !formData.roomId
                              ? 'Select a room first'
                              : 'Search and select a student...'
                          }
                          disabled={!formData.roomId}
                        />
                        {selectedStudent && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedStudent.class} - {selectedStudent.section} | Roll:{' '}
                            {selectedStudent.rollNumber}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Bed Number</Label>
                          <Input
                            type="number"
                            min={1}
                            value={formData.bedNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, bedNumber: parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startDate: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createAllocation.isPending || !selectedStudent || !formData.roomId}
                      >
                        {createAllocation.isPending ? 'Allocating...' : 'Allocate'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading allocations...</div>
          ) : allocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No allocations found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">{allocation.studentName}</TableCell>
                    <TableCell>
                      {allocation.class}-{allocation.section}
                    </TableCell>
                    <TableCell>{allocation.hostelName}</TableCell>
                    <TableCell>{allocation.roomNumber}</TableCell>
                    <TableCell>Bed {allocation.bedNumber}</TableCell>
                    <TableCell>{allocation.startDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(allocation.status)}>
                        {ALLOCATION_STATUS_LABELS[allocation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {allocation.status === 'active' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVacate(allocation.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTransferDialog(allocation)}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>
              Transfer {selectedAllocation?.studentName} to a different room
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Current Room</Label>
              <Input
                value={`${selectedAllocation?.hostelName} - Room ${selectedAllocation?.roomNumber} (Bed ${selectedAllocation?.bedNumber})`}
                disabled
              />
            </div>
            <div>
              <Label>New Room</Label>
              <Select value={transferRoomId} onValueChange={setTransferRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms
                    .filter((r) => r.id !== selectedAllocation?.roomId)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.hostelName} - Room {r.roomNumber} ({r.occupancy}/{r.capacity})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Bed Number</Label>
              <Input
                type="number"
                min={1}
                value={transferBedNumber}
                onChange={(e) => setTransferBedNumber(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!transferRoomId || transferAllocation.isPending}
            >
              {transferAllocation.isPending ? 'Transferring...' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Fees SubTab Component
// ============================================
function FeesSubTab() {
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

  return (
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
  )
}

// ============================================
// Mess SubTab Component
// ============================================
function MessSubTab() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    hostelId: string
    dayOfWeek: number
    mealType: MealType
    items: string[]
    specialDiet: string
  }>({
    open: false,
    hostelId: '',
    dayOfWeek: 0,
    mealType: 'breakfast',
    items: [],
    specialDiet: '',
  })

  const { data: menuResult, isLoading } = useMessMenu({
    hostelId: hostelFilter || undefined,
  })
  const { data: hostelsResult } = useHostels()
  const updateMenu = useUpdateMessMenu()
  const { toast } = useToast()

  const menus = menuResult?.data || []
  const hostels = hostelsResult?.data || []

  const getMenuForDayMeal = (hostelId: string, day: number, mealType: MealType) => {
    return menus.find(
      (m) => m.hostelId === hostelId && m.dayOfWeek === day && m.mealType === mealType
    )
  }

  const handleEdit = (hostelId: string, day: number, mealType: MealType) => {
    const menu = getMenuForDayMeal(hostelId, day, mealType)
    setEditDialog({
      open: true,
      hostelId,
      dayOfWeek: day,
      mealType,
      items: menu?.items || [],
      specialDiet: menu?.specialDiet || '',
    })
  }

  const handleSave = async () => {
    try {
      await updateMenu.mutateAsync({
        hostelId: editDialog.hostelId,
        dayOfWeek: editDialog.dayOfWeek,
        mealType: editDialog.mealType,
        items: editDialog.items,
        specialDiet: editDialog.specialDiet || undefined,
      })
      toast({ title: 'Menu updated successfully' })
      setEditDialog({ ...editDialog, open: false })
    } catch {
      toast({ title: 'Failed to update menu', variant: 'destructive' })
    }
  }

  const selectedHostel = hostelFilter || hostels[0]?.id

  return (
    <div className="space-y-6">
      {/* Hostel Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Hostel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Select value={hostelFilter} onValueChange={setHostelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Hostel" />
              </SelectTrigger>
              <SelectContent>
                {hostels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Menu */}
      {isLoading ? (
        <div className="text-center py-8">Loading menu...</div>
      ) : !selectedHostel ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Please select a hostel to view the menu
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-7">
          {DAYS.map((day, index) => (
            <Card key={day} className={index === new Date().getDay() ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{day}</CardTitle>
                {index === new Date().getDay() && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    Today
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mealType) => {
                  const menu = getMenuForDayMeal(selectedHostel, index, mealType)
                  return (
                    <div key={mealType} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          {MEAL_ICONS[mealType]}
                          {MEAL_TYPE_LABELS[mealType]}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEdit(selectedHostel, index, mealType)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                      <ul className="text-xs space-y-0.5">
                        {menu?.items.map((item, i) => (
                          <li key={i} className="text-muted-foreground">
                            {item}
                          </li>
                        )) || (
                          <li className="text-muted-foreground italic">Not set</li>
                        )}
                      </ul>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              {DAYS[editDialog.dayOfWeek]} - {MEAL_TYPE_LABELS[editDialog.mealType]}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Menu Items (one per line)</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={editDialog.items.join('\n')}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    items: e.target.value.split('\n').filter((i) => i.trim()),
                  })
                }
                placeholder="Enter menu items, one per line"
              />
            </div>
            <div>
              <Label>Special Diet Notes</Label>
              <Input
                value={editDialog.specialDiet}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, specialDiet: e.target.value })
                }
                placeholder="e.g., Jain food available on request"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMenu.isPending}>
              {updateMenu.isPending ? 'Saving...' : 'Save Menu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Attendance SubTab Component
// ============================================
function AttendanceSubTab() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, HostelAttendanceStatus>>({})

  const { data: attendanceResult, isLoading } = useHostelAttendance({
    hostelId: hostelFilter || undefined,
    date: dateFilter,
  })
  const { data: hostelsResult } = useHostels()
  const { data: allocationsResult } = useAllocations({
    hostelId: hostelFilter || undefined,
    status: 'active',
  })
  const { data: statsResult } = useHostelStats()
  const markBulkAttendance = useMarkBulkHostelAttendance()
  const { toast } = useToast()

  const attendance = attendanceResult?.data || []
  const hostels = hostelsResult?.data || []
  const allocations = allocationsResult?.data || []
  const stats = statsResult?.data

  const studentList = allocations.map((allocation) => {
    const att = attendance.find((a) => a.studentId === allocation.studentId)
    return {
      ...allocation,
      attendance: att,
      currentStatus: attendanceStatus[allocation.studentId] || att?.status || 'present',
    }
  })

  const handleStatusChange = (studentId: string, status: HostelAttendanceStatus) => {
    setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAll = (status: HostelAttendanceStatus) => {
    const newStatus: Record<string, HostelAttendanceStatus> = {}
    allocations.forEach((a) => {
      newStatus[a.studentId] = status
    })
    setAttendanceStatus(newStatus)
  }

  const handleSave = async () => {
    const records = Object.entries(attendanceStatus).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    if (records.length === 0) {
      toast({ title: 'No changes to save', variant: 'destructive' })
      return
    }

    try {
      await markBulkAttendance.mutateAsync({ date: dateFilter, records })
      toast({ title: 'Attendance saved successfully' })
      setAttendanceStatus({})
    } catch {
      toast({ title: 'Failed to save attendance', variant: 'destructive' })
    }
  }

  const presentCount = studentList.filter((s) => s.currentStatus === 'present').length
  const absentCount = studentList.filter((s) => s.currentStatus === 'absent').length
  const leaveCount = studentList.filter((s) => s.currentStatus === 'leave').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {studentList.length > 0
                ? `${Math.round((presentCount / studentList.length) * 100)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Require follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <CalendarDays className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{leaveCount}</div>
            <p className="text-xs text-muted-foreground">Approved leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Active allocations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label>Hostel</Label>
              <Select value={hostelFilter || 'all'} onValueChange={(v) => setHostelFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  {hostels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => handleMarkAll('present')}>
                Mark All Present
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => handleMarkAll('absent')}>
                Mark All Absent
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSave}
                disabled={markBulkAttendance.isPending || Object.keys(attendanceStatus).length === 0}
              >
                {markBulkAttendance.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading attendance...</div>
          ) : studentList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found. Please select a hostel with active allocations.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell>
                      {student.class}-{student.section}
                    </TableCell>
                    <TableCell>{student.roomNumber}</TableCell>
                    <TableCell>{student.hostelName}</TableCell>
                    <TableCell>
                      <Select
                        value={student.currentStatus}
                        onValueChange={(v) =>
                          handleStatusChange(student.studentId, v as HostelAttendanceStatus)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={getAttendanceBadgeVariant(student.currentStatus)}>
                              {ATTENDANCE_STATUS_LABELS[student.currentStatus]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <Badge variant={getAttendanceBadgeVariant(value)}>
                                {label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{student.attendance?.checkIn || '-'}</TableCell>
                    <TableCell>{student.attendance?.checkOut || '-'}</TableCell>
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
// Main HostelTab Component
// ============================================
export function HostelTab({ subTab, onSubTabChange }: HostelTabProps) {
  return (
    <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as HostelSubTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        <TabsTrigger variant="secondary" value="dashboard" className="flex items-center gap-2">
          <Building2 className="h-4 w-4 hidden sm:block" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="rooms" className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 hidden sm:block" />
          Rooms
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="allocations" className="flex items-center gap-2">
          <Users className="h-4 w-4 hidden sm:block" />
          Allocations
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="fees" className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 hidden sm:block" />
          Fees
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="mess" className="flex items-center gap-2">
          <Utensils className="h-4 w-4 hidden sm:block" />
          Mess
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="attendance" className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 hidden sm:block" />
          Attendance
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="dashboard" className="mt-0">
          <DashboardSubTab />
        </TabsContent>

        <TabsContent value="rooms" className="mt-0">
          <RoomsSubTab />
        </TabsContent>

        <TabsContent value="allocations" className="mt-0">
          <AllocationsSubTab />
        </TabsContent>

        <TabsContent value="fees" className="mt-0">
          <FeesSubTab />
        </TabsContent>

        <TabsContent value="mess" className="mt-0">
          <MessSubTab />
        </TabsContent>

        <TabsContent value="attendance" className="mt-0">
          <AttendanceSubTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}
