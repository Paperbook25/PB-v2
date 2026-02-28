import { faker } from '@faker-js/faker'
import { students, studentStats } from './students.data'
import { staff, staffStats } from './staff.data'

export const dashboardStats = {
  totalStudents: studentStats.total,
  activeStudents: studentStats.active,
  totalStaff: staffStats.total,
  activeStaff: staffStats.active,
  totalFeeCollected: 4523000,
  pendingFees: 876000,
  attendanceToday: 92.5,
  newAdmissions: 12,
}

export const feeCollectionData = [
  { month: 'Apr', collected: 450000, pending: 120000 },
  { month: 'May', collected: 520000, pending: 95000 },
  { month: 'Jun', collected: 380000, pending: 140000 },
  { month: 'Jul', collected: 620000, pending: 80000 },
  { month: 'Aug', collected: 550000, pending: 110000 },
  { month: 'Sep', collected: 480000, pending: 130000 },
  { month: 'Oct', collected: 590000, pending: 90000 },
  { month: 'Nov', collected: 510000, pending: 105000 },
  { month: 'Dec', collected: 423000, pending: 6000 },
]

export const attendanceData = [
  { day: 'Mon', present: 95, absent: 5 },
  { day: 'Tue', present: 92, absent: 8 },
  { day: 'Wed', present: 88, absent: 12 },
  { day: 'Thu', present: 94, absent: 6 },
  { day: 'Fri', present: 90, absent: 10 },
  { day: 'Sat', present: 85, absent: 15 },
]

export const classWiseStudents = Object.entries(studentStats.byClass).map(([className, count]) => ({
  name: className.replace('Class ', ''),
  students: count,
}))

export const announcements = [
  {
    id: '1',
    title: 'Annual Day Celebration',
    content: 'The school annual day will be celebrated on 15th December. All students are requested to participate.',
    priority: 'high' as const,
    createdAt: faker.date.recent({ days: 1 }).toISOString(),
    createdBy: 'Principal',
  },
  {
    id: '2',
    title: 'Winter Vacation Notice',
    content: 'Winter vacation will commence from 20th December to 5th January. School will reopen on 6th January.',
    priority: 'medium' as const,
    createdAt: faker.date.recent({ days: 3 }).toISOString(),
    createdBy: 'Administration',
  },
  {
    id: '3',
    title: 'Parent-Teacher Meeting',
    content: 'PTM scheduled for Class 10 and 12 students on Saturday, 10 AM - 1 PM.',
    priority: 'medium' as const,
    createdAt: faker.date.recent({ days: 5 }).toISOString(),
    createdBy: 'Academic Coordinator',
  },
]

export const upcomingEvents = [
  {
    id: '1',
    title: 'Unit Test - Class 10',
    date: faker.date.soon({ days: 3 }).toISOString(),
    type: 'exam' as const,
    description: 'Unit test for all subjects',
  },
  {
    id: '2',
    title: 'Science Exhibition',
    date: faker.date.soon({ days: 7 }).toISOString(),
    type: 'event' as const,
    description: 'Annual science exhibition for classes 6-12',
  },
  {
    id: '3',
    title: 'Staff Meeting',
    date: faker.date.soon({ days: 2 }).toISOString(),
    type: 'meeting' as const,
    description: 'Monthly staff meeting at 4 PM',
  },
  {
    id: '4',
    title: 'Christmas Holiday',
    date: new Date('2024-12-25').toISOString(),
    type: 'holiday' as const,
    description: 'School closed for Christmas',
  },
]

export const recentActivities = [
  {
    id: '1',
    action: 'New Admission',
    description: 'Rahul Sharma admitted to Class 5-A',
    timestamp: faker.date.recent({ days: 0.1 }).toISOString(),
    user: { name: 'Admin', avatar: '' },
  },
  {
    id: '2',
    action: 'Fee Collected',
    description: '₹15,000 collected from Priya Singh (Class 8-B)',
    timestamp: faker.date.recent({ days: 0.2 }).toISOString(),
    user: { name: 'Accountant', avatar: '' },
  },
  {
    id: '3',
    action: 'Leave Approved',
    description: 'Leave approved for Amit Kumar (Teacher) - 2 days',
    timestamp: faker.date.recent({ days: 0.5 }).toISOString(),
    user: { name: 'Principal', avatar: '' },
  },
  {
    id: '4',
    action: 'Book Issued',
    description: '"Introduction to Physics" issued to Sneha Reddy',
    timestamp: faker.date.recent({ days: 0.8 }).toISOString(),
    user: { name: 'Librarian', avatar: '' },
  },
  {
    id: '5',
    action: 'Attendance Marked',
    description: 'Attendance marked for Class 10-A - 42 present, 3 absent',
    timestamp: faker.date.recent({ days: 1 }).toISOString(),
    user: { name: 'Class Teacher', avatar: '' },
  },
]

export const quickStats = {
  todayBirthdays: students.filter((s) => {
    const today = new Date()
    const dob = new Date(s.dateOfBirth)
    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()
  }).length,
  pendingLeaveRequests: 5,
  overdueBooks: 12,
  upcomingExams: 3,
}

// Payment method breakdown for fee collection
export const paymentMethodsData = [
  { name: 'UPI', value: 2623000, color: '#3b82f6' },
  { name: 'Cash', value: 1130750, color: '#22c55e' },
  { name: 'Card', value: 542760, color: '#6d28d9' },
  { name: 'Cheque', value: 226490, color: '#64748b' },
]

// Recent fee transactions
export const recentFeeTransactions = [
  {
    id: 'txn1',
    studentName: 'Aarav Sharma',
    class: '10A',
    amount: 4999,
    paymentMethod: 'UPI',
    timestamp: faker.date.recent({ days: 0.001 }).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'txn2',
    studentName: 'Priya Patel',
    class: '8B',
    amount: 3500,
    paymentMethod: 'Card',
    timestamp: faker.date.recent({ days: 0.003 }).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'txn3',
    studentName: 'Rahul Verma',
    class: '9A',
    amount: 7500,
    paymentMethod: 'Cash',
    timestamp: faker.date.recent({ days: 0.01 }).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'txn4',
    studentName: 'Sneha Reddy',
    class: '11B',
    amount: 15000,
    paymentMethod: 'UPI',
    timestamp: faker.date.recent({ days: 0.02 }).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'txn5',
    studentName: 'Arjun Kumar',
    class: '7C',
    amount: 2500,
    paymentMethod: 'Cheque',
    timestamp: faker.date.recent({ days: 0.04 }).toISOString(),
    status: 'success' as const,
  },
]

// Class-wise fee collection progress
export const classWiseCollection = [
  { class: 'Class 12', collected: 850000, target: 1000000, percentage: 85 },
  { class: 'Class 11', collected: 680000, target: 900000, percentage: 76 },
  { class: 'Class 10', collected: 920000, target: 1100000, percentage: 84 },
  { class: 'Class 9', collected: 550000, target: 800000, percentage: 69 },
  { class: 'Class 8', collected: 480000, target: 700000, percentage: 69 },
]

// ==================== TEACHER DASHBOARD ====================

export const teacherSchedule = [
  { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201', type: 'lecture' as const },
  { period: 2, time: '09:15 - 10:00', subject: 'Mathematics', class: 'Class 10-B', room: 'Room 202', type: 'lecture' as const },
  { period: 3, time: '10:15 - 11:00', subject: 'Mathematics', class: 'Class 9-A', room: 'Room 105', type: 'lecture' as const },
  { period: 4, time: '11:00 - 11:45', subject: 'Free Period', class: '-', room: '-', type: 'free' as const },
  { period: 5, time: '12:30 - 01:15', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 106', type: 'lecture' as const },
  { period: 6, time: '01:15 - 02:00', subject: 'Mathematics', class: 'Class 8-A', room: 'Room 301', type: 'lecture' as const },
  { period: 7, time: '02:15 - 03:00', subject: 'Extra Class', class: 'Class 10-A', room: 'Room 201', type: 'extra' as const },
  { period: 8, time: '03:00 - 03:45', subject: 'Duty', class: 'Library Duty', room: 'Library', type: 'duty' as const },
]

export const teacherStats = {
  totalClasses: 6,
  classesToday: 6,
  attendanceMarked: 3,
  attendancePending: 3,
  leaveBalance: 8,
  averageClassStrength: 38,
  pendingMarksEntry: 2,
  upcomingPTMs: 1,
}

export const teacherClasses = [
  { class: 'Class 10-A', subject: 'Mathematics', students: 42, attendanceToday: 'marked', presentToday: 39, absentToday: 3 },
  { class: 'Class 10-B', subject: 'Mathematics', students: 40, attendanceToday: 'marked', presentToday: 37, absentToday: 3 },
  { class: 'Class 9-A', subject: 'Mathematics', students: 38, attendanceToday: 'marked', presentToday: 35, absentToday: 3 },
  { class: 'Class 9-B', subject: 'Mathematics', students: 36, attendanceToday: 'pending', presentToday: 0, absentToday: 0 },
  { class: 'Class 8-A', subject: 'Mathematics', students: 40, attendanceToday: 'pending', presentToday: 0, absentToday: 0 },
  { class: 'Class 8-B', subject: 'Mathematics', students: 35, attendanceToday: 'pending', presentToday: 0, absentToday: 0 },
]

export const teacherPendingTasks = [
  { id: 't1', task: 'Enter marks for Class 10-A Unit Test 3', type: 'marks', dueDate: faker.date.soon({ days: 2 }).toISOString(), priority: 'high' as const },
  { id: 't2', task: 'Enter marks for Class 9-B Half Yearly', type: 'marks', dueDate: faker.date.soon({ days: 5 }).toISOString(), priority: 'high' as const },
  { id: 't3', task: 'Submit Class 10-B term report', type: 'report', dueDate: faker.date.soon({ days: 7 }).toISOString(), priority: 'medium' as const },
  { id: 't4', task: 'Review Class 9-A homework submissions', type: 'homework', dueDate: faker.date.soon({ days: 1 }).toISOString(), priority: 'medium' as const },
  { id: 't5', task: 'Prepare question paper for Class 8 Final Exam', type: 'exam', dueDate: faker.date.soon({ days: 14 }).toISOString(), priority: 'low' as const },
]
