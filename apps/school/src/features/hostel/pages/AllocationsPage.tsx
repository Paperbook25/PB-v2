import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Search, UserMinus, ArrowRightLeft } from 'lucide-react'
import {
  useAllocations,
  useHostels,
  useRooms,
  useCreateAllocation,
  useVacateAllocation,
  useTransferAllocation,
} from '../hooks/useHostel'
import { StudentSelector } from '../components/StudentSelector'
import type { RoomAllocation } from '../types/hostel.types'
import type { EligibleStudent } from '../api/hostel.api'
import { useToast } from '@/hooks/use-toast'
import { ALLOCATION_STATUS_LABELS } from '../types/hostel.types'

export function AllocationsPage() {
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

  // Determine gender filter based on selected room's hostel
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
    <div>
      <PageHeader
        title="Room Allocations"
        description="Manage student room allocations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Allocations' },
        ]}
      />

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
                              // Reset student when room changes (gender filter may change)
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
    </div>
  )
}
