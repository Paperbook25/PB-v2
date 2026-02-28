import { faker } from '@faker-js/faker'
import type {
  Visitor,
  VisitorPass,
  PreApprovedVisitor,
  VisitPurpose,
  IdType,
  HostType,
} from '@/features/visitors/types/visitor.types'

// ==================== VISITORS ====================

const purposes: VisitPurpose[] = ['meeting', 'delivery', 'parent_visit', 'vendor', 'interview', 'other']
const idTypes: IdType[] = ['aadhaar', 'driving_license', 'passport', 'voter_id']
const hostTypes: HostType[] = ['staff', 'student']

const staffMembers = [
  { id: 'staff-1', name: 'Dr. Anil Kumar', department: 'Administration' },
  { id: 'staff-2', name: 'Mrs. Priya Sharma', department: 'Academic' },
  { id: 'staff-3', name: 'Mr. Rajesh Menon', department: 'IT' },
  { id: 'staff-4', name: 'Mrs. Lakshmi Iyer', department: 'Finance' },
  { id: 'staff-5', name: 'Mr. Suresh Reddy', department: 'HR' },
]

const studentNames = [
  { id: 'stu-1', name: 'Aarav Sharma', class: 'Class 10-A' },
  { id: 'stu-2', name: 'Vivaan Patel', class: 'Class 8-B' },
  { id: 'stu-3', name: 'Ananya Kapoor', class: 'Class 9-C' },
  { id: 'stu-4', name: 'Diya Verma', class: 'Class 7-A' },
  { id: 'stu-5', name: 'Arjun Reddy', class: 'Class 12-A' },
]

export const visitors: Visitor[] = []

for (let i = 0; i < 50; i++) {
  visitors.push({
    id: `visitor-${i + 1}`,
    name: faker.person.fullName(),
    phone: `+91 ${faker.string.numeric(10)}`,
    email: Math.random() > 0.3 ? faker.internet.email() : undefined,
    idType: idTypes[Math.floor(Math.random() * idTypes.length)],
    idNumber: faker.string.alphanumeric(12).toUpperCase(),
    photo: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
    company: Math.random() > 0.4 ? faker.company.name() : undefined,
    vehicleNumber: Math.random() > 0.5 ? `KA-01-${faker.string.alpha(2).toUpperCase()}-${faker.string.numeric(4)}` : undefined,
    address: faker.location.streetAddress(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  })
}

// ==================== VISITOR PASSES ====================

export const visitorPasses: VisitorPass[] = []

const now = new Date()
const today = now.toISOString().split('T')[0]

// Generate passes for today
for (let i = 0; i < 15; i++) {
  const visitor = visitors[Math.floor(Math.random() * visitors.length)]
  const hostType = hostTypes[Math.floor(Math.random() * hostTypes.length)]
  const host = hostType === 'staff'
    ? staffMembers[Math.floor(Math.random() * staffMembers.length)]
    : studentNames[Math.floor(Math.random() * studentNames.length)]

  const checkInHour = 8 + Math.floor(Math.random() * 8)
  const checkInMinute = Math.floor(Math.random() * 60)
  const checkInTime = new Date(now)
  checkInTime.setHours(checkInHour, checkInMinute, 0, 0)

  const isCompleted = checkInHour < now.getHours() - 1 || Math.random() > 0.7
  const checkOutTime = isCompleted
    ? new Date(checkInTime.getTime() + (30 + Math.floor(Math.random() * 120)) * 60000)
    : undefined

  visitorPasses.push({
    id: `pass-${Date.now()}-${i}`,
    visitorId: visitor.id,
    visitorName: visitor.name,
    visitorPhone: visitor.phone,
    visitorCompany: visitor.company,
    passNumber: `VP-${today.replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
    purpose: purposes[Math.floor(Math.random() * purposes.length)],
    purposeDetails: faker.lorem.sentence(),
    hostType,
    hostId: host.id,
    hostName: host.name,
    hostDepartment: hostType === 'staff' ? (host as typeof staffMembers[0]).department : (host as typeof studentNames[0]).class,
    checkInTime: checkInTime.toISOString(),
    checkOutTime: checkOutTime?.toISOString(),
    expectedDuration: 30 + Math.floor(Math.random() * 90),
    status: checkOutTime ? 'completed' : (now.getTime() - checkInTime.getTime() > 4 * 60 * 60 * 1000 ? 'expired' : 'active'),
    badge: `B-${String(i + 1).padStart(3, '0')}`,
    belongings: Math.random() > 0.5 ? ['Laptop', 'Bag', 'Mobile'] : undefined,
    vehicleNumber: visitor.vehicleNumber,
    createdAt: checkInTime.toISOString(),
  })
}

// Generate historical passes
for (let day = 1; day <= 30; day++) {
  const date = new Date(now)
  date.setDate(date.getDate() - day)
  const dateStr = date.toISOString().split('T')[0]

  const passCount = 5 + Math.floor(Math.random() * 10)
  for (let i = 0; i < passCount; i++) {
    const visitor = visitors[Math.floor(Math.random() * visitors.length)]
    const hostType = hostTypes[Math.floor(Math.random() * hostTypes.length)]
    const host = hostType === 'staff'
      ? staffMembers[Math.floor(Math.random() * staffMembers.length)]
      : studentNames[Math.floor(Math.random() * studentNames.length)]

    const checkInHour = 8 + Math.floor(Math.random() * 8)
    const checkInTime = new Date(date)
    checkInTime.setHours(checkInHour, Math.floor(Math.random() * 60), 0, 0)

    const checkOutTime = new Date(checkInTime.getTime() + (15 + Math.floor(Math.random() * 180)) * 60000)

    visitorPasses.push({
      id: `pass-hist-${day}-${i}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorPhone: visitor.phone,
      visitorCompany: visitor.company,
      passNumber: `VP-${dateStr.replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      purposeDetails: faker.lorem.sentence(),
      hostType,
      hostId: host.id,
      hostName: host.name,
      hostDepartment: hostType === 'staff' ? (host as typeof staffMembers[0]).department : (host as typeof studentNames[0]).class,
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
      expectedDuration: 30 + Math.floor(Math.random() * 90),
      status: 'completed',
      badge: `B-${String(i + 1).padStart(3, '0')}`,
      vehicleNumber: visitor.vehicleNumber,
      createdAt: checkInTime.toISOString(),
    })
  }
}

// ==================== PRE-APPROVED VISITORS ====================

export const preApprovedVisitors: PreApprovedVisitor[] = [
  {
    id: 'pre-1',
    visitorId: 'visitor-1',
    visitorName: visitors[0].name,
    visitorPhone: visitors[0].phone,
    visitorCompany: 'ABC Stationary Supplies',
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    purpose: 'Regular stationary supplies delivery',
    approvedBy: 'admin-1',
    approvedByName: 'Dr. Anil Kumar',
    maxVisits: 100,
    usedVisits: 45,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pre-2',
    visitorId: 'visitor-5',
    visitorName: visitors[4].name,
    visitorPhone: visitors[4].phone,
    visitorCompany: 'Tech Solutions Pvt Ltd',
    validFrom: '2024-06-01',
    validUntil: '2025-05-31',
    purpose: 'IT equipment maintenance',
    approvedBy: 'admin-1',
    approvedByName: 'Dr. Anil Kumar',
    maxVisits: 24,
    usedVisits: 12,
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'pre-3',
    visitorId: 'visitor-10',
    visitorName: visitors[9].name,
    visitorPhone: visitors[9].phone,
    visitorCompany: 'Fresh Foods Caterers',
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    purpose: 'Canteen supplies',
    approvedBy: 'admin-1',
    approvedByName: 'Dr. Anil Kumar',
    maxVisits: 365,
    usedVisits: 180,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pre-4',
    visitorId: 'visitor-15',
    visitorName: visitors[14].name,
    visitorPhone: visitors[14].phone,
    visitorCompany: 'Clean & Shine Services',
    validFrom: '2024-03-01',
    validUntil: '2024-12-31',
    purpose: 'Deep cleaning services',
    approvedBy: 'admin-1',
    approvedByName: 'Dr. Anil Kumar',
    maxVisits: 12,
    usedVisits: 12,
    status: 'expired',
    createdAt: '2024-03-01T00:00:00Z',
  },
]
