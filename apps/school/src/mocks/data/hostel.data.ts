import type {
  Hostel,
  Room,
  RoomAllocation,
  HostelFee,
  MessMenu,
  HostelAttendance,
} from '@/features/hostel/types/hostel.types'
import { getActiveStudents } from './students.data'

// ==================== HOSTELS ====================

export const hostels: Hostel[] = [
  {
    id: 'h1',
    name: 'Vivekananda Boys Hostel',
    type: 'boys',
    capacity: 120,
    occupancy: 98,
    wardenId: 'w1',
    wardenName: 'Mr. Rajesh Menon',
    floors: 4,
    address: 'Block A, School Campus, Bangalore - 560001',
    contactNumber: '+91 9876543301',
    email: 'vivekananda.hostel@school.edu',
    amenities: ['WiFi', 'Study Room', 'Common Room', 'Indoor Games', 'Laundry', 'Hot Water', 'CCTV'],
    status: 'active',
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'h2',
    name: 'Sarojini Girls Hostel',
    type: 'girls',
    capacity: 100,
    occupancy: 85,
    wardenId: 'w2',
    wardenName: 'Mrs. Lakshmi Iyer',
    floors: 3,
    address: 'Block B, School Campus, Bangalore - 560001',
    contactNumber: '+91 9876543302',
    email: 'sarojini.hostel@school.edu',
    amenities: ['WiFi', 'Study Room', 'Common Room', 'Indoor Games', 'Laundry', 'Hot Water', 'CCTV', 'Gym'],
    status: 'active',
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
]

// ==================== ROOMS ====================

const roomAmenities = ['Attached Bathroom', 'Study Table', 'Wardrobe', 'Ceiling Fan', 'Bed with Mattress']

export const rooms: Room[] = []

// Generate rooms for Vivekananda Boys Hostel
for (let floor = 1; floor <= 4; floor++) {
  for (let room = 1; room <= 10; room++) {
    const roomNum = `${floor}${String(room).padStart(2, '0')}`
    const type = room <= 2 ? 'single' : room <= 6 ? 'double' : room <= 8 ? 'triple' : 'dormitory'
    const capacity = type === 'single' ? 1 : type === 'double' ? 2 : type === 'triple' ? 3 : 6
    const occupancy = Math.min(capacity, Math.floor(Math.random() * (capacity + 1)))

    rooms.push({
      id: `r-h1-${roomNum}`,
      hostelId: 'h1',
      hostelName: 'Vivekananda Boys Hostel',
      roomNumber: roomNum,
      floor,
      type,
      capacity,
      occupancy,
      amenities: type === 'single' ? [...roomAmenities, 'AC'] : roomAmenities,
      status: occupancy === capacity ? 'full' : occupancy === 0 && Math.random() > 0.9 ? 'maintenance' : 'available',
      monthlyRent: type === 'single' ? 8000 : type === 'double' ? 6000 : type === 'triple' ? 4500 : 3000,
      createdAt: '2020-06-01T00:00:00Z',
    })
  }
}

// Generate rooms for Sarojini Girls Hostel
for (let floor = 1; floor <= 3; floor++) {
  for (let room = 1; room <= 12; room++) {
    const roomNum = `${floor}${String(room).padStart(2, '0')}`
    const type = room <= 3 ? 'single' : room <= 8 ? 'double' : 'triple'
    const capacity = type === 'single' ? 1 : type === 'double' ? 2 : 3
    const occupancy = Math.min(capacity, Math.floor(Math.random() * (capacity + 1)))

    rooms.push({
      id: `r-h2-${roomNum}`,
      hostelId: 'h2',
      hostelName: 'Sarojini Girls Hostel',
      roomNumber: roomNum,
      floor,
      type,
      capacity,
      occupancy,
      amenities: type === 'single' ? [...roomAmenities, 'AC'] : roomAmenities,
      status: occupancy === capacity ? 'full' : occupancy === 0 && Math.random() > 0.9 ? 'maintenance' : 'available',
      monthlyRent: type === 'single' ? 8500 : type === 'double' ? 6500 : 5000,
      createdAt: '2020-06-01T00:00:00Z',
    })
  }
}

// ==================== ROOM ALLOCATIONS ====================

// Get active students for real student linking
const activeStudentsForHostel = getActiveStudents()

export const roomAllocations: RoomAllocation[] = []

let allocationIndex = 0
for (const room of rooms) {
  if (room.status === 'maintenance') continue

  for (let bed = 1; bed <= room.occupancy; bed++) {
    // Use actual student data if available
    const student = activeStudentsForHostel[allocationIndex % activeStudentsForHostel.length]
    roomAllocations.push({
      id: `alloc-${allocationIndex + 1}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      hostelId: room.hostelId,
      hostelName: room.hostelName,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      section: student.section,
      bedNumber: bed,
      startDate: '2024-06-01',
      status: 'active',
      createdAt: '2024-06-01T00:00:00Z',
    })
    allocationIndex++
  }
}

// Export allocated student IDs for cross-module reference
export const allocatedStudentIds = new Set(roomAllocations.filter(a => a.status === 'active').map(a => a.studentId))

// ==================== HOSTEL FEES ====================

const months = ['2024-10', '2024-11', '2024-12', '2025-01']

export const hostelFees: HostelFee[] = []

let feeIndex = 0
for (const allocation of roomAllocations.slice(0, 50)) {
  const room = rooms.find(r => r.id === allocation.roomId)
  if (!room) continue

  for (const month of months) {
    // Room rent
    const isPaid = month < '2024-12' || Math.random() > 0.3
    hostelFees.push({
      id: `hfee-${feeIndex++}`,
      studentId: allocation.studentId,
      studentName: allocation.studentName,
      roomNumber: room.roomNumber,
      hostelName: room.hostelName,
      feeType: 'room_rent',
      amount: room.monthlyRent,
      month,
      dueDate: `${month}-10`,
      paidDate: isPaid ? `${month}-05` : undefined,
      status: isPaid ? 'paid' : month < '2025-01' ? 'overdue' : 'pending',
      transactionId: isPaid ? `TXN${Date.now()}${feeIndex}` : undefined,
      createdAt: `${month}-01T00:00:00Z`,
    })

    // Mess fee
    const messPaid = month < '2024-12' || Math.random() > 0.25
    hostelFees.push({
      id: `hfee-${feeIndex++}`,
      studentId: allocation.studentId,
      studentName: allocation.studentName,
      roomNumber: room.roomNumber,
      hostelName: room.hostelName,
      feeType: 'mess_fee',
      amount: 4500,
      month,
      dueDate: `${month}-10`,
      paidDate: messPaid ? `${month}-06` : undefined,
      status: messPaid ? 'paid' : month < '2025-01' ? 'overdue' : 'pending',
      transactionId: messPaid ? `TXN${Date.now()}${feeIndex}` : undefined,
      createdAt: `${month}-01T00:00:00Z`,
    })
  }
}

// ==================== MESS MENU ====================

const breakfastItems = [
  ['Idli', 'Sambar', 'Chutney', 'Tea/Coffee'],
  ['Dosa', 'Sambar', 'Chutney', 'Tea/Coffee'],
  ['Poha', 'Jalebi', 'Milk'],
  ['Upma', 'Vadai', 'Tea/Coffee'],
  ['Paratha', 'Curd', 'Pickle', 'Tea/Coffee'],
  ['Puri', 'Aloo Curry', 'Tea/Coffee'],
  ['Bread', 'Butter', 'Omelette', 'Milk'],
]

const lunchItems = [
  ['Rice', 'Dal', 'Vegetable Curry', 'Roti', 'Salad', 'Curd'],
  ['Rice', 'Sambar', 'Rasam', 'Poriyal', 'Papad', 'Buttermilk'],
  ['Rice', 'Kadhi', 'Aloo Gobi', 'Roti', 'Salad'],
  ['Rice', 'Dal Fry', 'Paneer Curry', 'Roti', 'Raita'],
  ['Rice', 'Sambar', 'Kootu', 'Appalam', 'Payasam'],
  ['Biryani', 'Raita', 'Mirchi Ka Salan', 'Salad'],
  ['Rice', 'Dal', 'Mixed Veg', 'Roti', 'Kheer'],
]

const snacksItems = [
  ['Samosa', 'Tea'],
  ['Vada Pav', 'Tea'],
  ['Biscuits', 'Milk'],
  ['Bhel Puri', 'Juice'],
  ['Sandwich', 'Tea'],
  ['Pav Bhaji', 'Buttermilk'],
  ['Pakoda', 'Tea'],
]

const dinnerItems = [
  ['Chapati', 'Dal', 'Vegetable Curry', 'Rice', 'Salad'],
  ['Rice', 'Sambar', 'Vegetable Kootu', 'Pickle', 'Milk'],
  ['Roti', 'Paneer Butter Masala', 'Dal', 'Rice'],
  ['Chapati', 'Chole', 'Rice', 'Salad', 'Curd'],
  ['Roti', 'Aloo Matar', 'Dal Tadka', 'Rice'],
  ['Pulao', 'Raita', 'Vegetable Curry', 'Roti'],
  ['Chapati', 'Mixed Dal', 'Bhindi Fry', 'Rice', 'Kheer'],
]

export const messMenus: MessMenu[] = []

for (const hostel of hostels) {
  for (let day = 0; day < 7; day++) {
    messMenus.push({
      id: `menu-${hostel.id}-${day}-breakfast`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      dayOfWeek: day,
      mealType: 'breakfast',
      items: breakfastItems[day],
      updatedAt: '2024-12-01T00:00:00Z',
    })
    messMenus.push({
      id: `menu-${hostel.id}-${day}-lunch`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      dayOfWeek: day,
      mealType: 'lunch',
      items: lunchItems[day],
      updatedAt: '2024-12-01T00:00:00Z',
    })
    messMenus.push({
      id: `menu-${hostel.id}-${day}-snacks`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      dayOfWeek: day,
      mealType: 'snacks',
      items: snacksItems[day],
      updatedAt: '2024-12-01T00:00:00Z',
    })
    messMenus.push({
      id: `menu-${hostel.id}-${day}-dinner`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      dayOfWeek: day,
      mealType: 'dinner',
      items: dinnerItems[day],
      updatedAt: '2024-12-01T00:00:00Z',
    })
  }
}

// ==================== HOSTEL ATTENDANCE ====================

const today = new Date().toISOString().split('T')[0]

export const hostelAttendance: HostelAttendance[] = []

for (const allocation of roomAllocations) {
  const rand = Math.random()
  const status: 'present' | 'absent' | 'leave' | 'late' = rand > 0.1 ? 'present' : rand > 0.6 ? 'late' : rand > 0.3 ? 'absent' : 'leave'
  hostelAttendance.push({
    id: `hatt-${allocation.id}-${today}`,
    studentId: allocation.studentId,
    studentName: allocation.studentName,
    roomNumber: allocation.roomNumber,
    hostelName: allocation.hostelName,
    date: today,
    checkIn: status === 'present' || status === 'late' ? '21:30' : undefined,
    checkOut: status === 'present' ? '07:00' : undefined,
    status,
    remarks: status === 'leave' ? 'Home visit approved' : status === 'late' ? 'Arrived late' : undefined,
    markedBy: 'Warden',
    createdAt: new Date().toISOString(),
  })
}
