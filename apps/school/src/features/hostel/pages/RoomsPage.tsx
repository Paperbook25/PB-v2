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
import { Badge } from '@/components/ui/badge'
import { Plus, BedDouble, Users } from 'lucide-react'
import { useRooms, useHostels, useCreateRoom } from '../hooks/useHostel'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  ROOM_TYPE_LABELS,
  ROOM_STATUS_LABELS,
  type RoomType,
} from '../types/hostel.types'

export function RoomsPage() {
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
    <div>
      <PageHeader
        title="Rooms"
        description="Manage hostel rooms and capacity"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Rooms' },
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
    </div>
  )
}
