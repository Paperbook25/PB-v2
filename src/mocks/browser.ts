import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'
import { mockDelay } from './utils/delay-config'
import { students, type Student } from './data/students.data'
import { staff } from './data/staff.data'
import { dashboardStats, feeCollectionData, attendanceData, announcements, upcomingEvents, recentActivities, quickStats, classWiseStudents, teacherSchedule, teacherStats, teacherClasses, teacherPendingTasks, paymentMethodsData, recentFeeTransactions, classWiseCollection } from './data/dashboard.data'
import { faker } from '@faker-js/faker'
import { admissionsHandlers } from './handlers/admissions.handlers'
import { staffHandlers } from './handlers/staff.handlers'
import { libraryHandlers } from './handlers/library.handlers'
import { financeHandlers } from './handlers/finance.handlers'
import { settingsHandlers } from './handlers/settings.handlers'
import { integrationsHandlers } from './handlers/integrations.handlers'
import { examsHandlers } from './handlers/exams.handlers'
import { attendanceHandlers } from './handlers/attendance.handlers'
import { studentsHandlers } from './handlers/students.handlers'
import { transportHandlers } from './handlers/transport.handlers'
import { lmsHandlers } from './handlers/lms.handlers'
import { hostelHandlers } from './handlers/hostel.handlers'
import { visitorsHandlers } from './handlers/visitors.handlers'
import { inventoryHandlers } from './handlers/inventory.handlers'
import { alumniHandlers } from './handlers/alumni.handlers'
import { questionBankHandlers } from './handlers/question-bank.handlers'
import { communicationHandlers } from './handlers/communication.handlers'
import { behaviorHandlers } from './handlers/behavior.handlers'
import { reportsHandlers } from './handlers/reports.handlers'
import { timetableHandlers } from './handlers/timetable.handlers'
import { parentPortalHandlers } from './handlers/parent-portal.handlers'
import { documentsHandlers } from './handlers/documents.handlers'
import { clubsHandlers } from './handlers/clubs.handlers'
import { complaintsHandlers } from './handlers/complaints.handlers'
import { facilitiesHandlers } from './handlers/facilities.handlers'
import { scholarshipsHandlers } from './handlers/scholarships.handlers'
import { addonHandlers } from './handlers/addon.handlers'
import { calendarHandlers } from './handlers/calendar.handlers'
import { permissionHandlers } from './handlers/permission.handlers'
import { aiPlannerHandlers } from './handlers/ai-planner.handlers'
import { agentChatHandlers } from './handlers/agent-chat.handlers'
import { schoolWebsiteHandlers } from './handlers/school-website.handlers'
import { applications } from './data/admissions.data'
import { getUserContext, isParent } from './utils/auth-context'
import { studentFees } from './data/finance.data'
import { issuedBooks } from './data/library.data'
import { generateStudentAttendanceView } from './data/attendance.data'

const appNotifications = [
  {
    id: 'n1',
    title: 'New Admission Application',
    message: 'Arjun Patel has submitted an admission application for Class 6.',
    type: 'admission' as const,
    read: false,
    createdAt: faker.date.recent({ days: 0.05 }).toISOString(),
    actionUrl: '/admissions',
  },
  {
    id: 'n2',
    title: 'Fee Payment Received',
    message: '₹25,000 received from Sneha Reddy (Class 8-B) for Term 2 fees.',
    type: 'fee' as const,
    read: false,
    createdAt: faker.date.recent({ days: 0.1 }).toISOString(),
    actionUrl: '/finance/collection',
  },
  {
    id: 'n3',
    title: 'Attendance Alert',
    message: 'Rahul Kumar (Class 10-A) attendance dropped below 75%. Current: 72%.',
    type: 'attendance' as const,
    read: false,
    createdAt: faker.date.recent({ days: 0.2 }).toISOString(),
    actionUrl: '/attendance/alerts',
  },
  {
    id: 'n4',
    title: 'Overdue Library Book',
    message: '"Advanced Mathematics" is overdue by 3 days. Borrower: Priya Singh.',
    type: 'library' as const,
    read: false,
    createdAt: faker.date.recent({ days: 0.5 }).toISOString(),
    actionUrl: '/library/notifications',
  },
  {
    id: 'n5',
    title: 'Staff Leave Request',
    message: 'Amit Kumar (Mathematics Teacher) requested leave for 2 days starting Dec 18.',
    type: 'alert' as const,
    read: true,
    createdAt: faker.date.recent({ days: 0.8 }).toISOString(),
    actionUrl: '/staff/leave',
  },
  {
    id: 'n6',
    title: 'Upcoming PTM',
    message: 'Parent-Teacher Meeting scheduled for Class 10 & 12 on Saturday, 10 AM.',
    type: 'event' as const,
    read: true,
    createdAt: faker.date.recent({ days: 1 }).toISOString(),
    actionUrl: '/settings?tab=calendar',
  },
  {
    id: 'n7',
    title: 'Exam Results Published',
    message: 'Unit Test 3 results for Class 9-A have been published by Mrs. Sharma.',
    type: 'message' as const,
    read: true,
    createdAt: faker.date.recent({ days: 1.5 }).toISOString(),
    actionUrl: '/exams/analytics',
  },
  {
    id: 'n8',
    title: 'System Update',
    message: 'New features added: Academic Calendar and Email Templates in Settings.',
    type: 'system' as const,
    read: true,
    createdAt: faker.date.recent({ days: 2 }).toISOString(),
  },
]

const handlers = [
  // Dashboard
  http.get('/api/dashboard/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: dashboardStats })
  }),

  http.get('/api/dashboard/fee-collection', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: feeCollectionData })
  }),

  http.get('/api/dashboard/attendance', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: attendanceData })
  }),

  http.get('/api/dashboard/class-wise-students', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: classWiseStudents })
  }),

  http.get('/api/dashboard/announcements', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: announcements })
  }),

  http.get('/api/dashboard/events', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: upcomingEvents })
  }),

  http.get('/api/dashboard/activities', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: recentActivities })
  }),

  http.get('/api/dashboard/quick-stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: quickStats })
  }),

  http.get('/api/dashboard/payment-methods', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: paymentMethodsData })
  }),

  http.get('/api/dashboard/fee-transactions', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: recentFeeTransactions })
  }),

  http.get('/api/dashboard/class-wise-collection', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: classWiseCollection })
  }),

  // Teacher Dashboard
  http.get('/api/dashboard/teacher-stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: teacherStats })
  }),

  http.get('/api/dashboard/teacher-schedule', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: teacherSchedule })
  }),

  http.get('/api/dashboard/teacher-classes', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: teacherClasses })
  }),

  http.get('/api/dashboard/teacher-tasks', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: teacherPendingTasks })
  }),

  http.get('/api/dashboard/struggling-students', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 6 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        class: `Class ${faker.number.int({ min: 8, max: 12 })}-${faker.helpers.arrayElement(['A', 'B', 'C'])}`,
        alertType: faker.helpers.arrayElement(['attendance', 'performance']),
        issue: faker.helpers.arrayElement([
          'Low attendance this month',
          'Declining test scores',
          'Missed multiple assignments',
          'Below average in recent exam',
        ]),
        value: faker.helpers.arrayElement(['C-', 'D', 'D+', '65', '58', '72']),
      })),
    })
  }),

  http.get('/api/dashboard/pending-grades', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 5 }, () => {
        const total = faker.number.int({ min: 30, max: 50 })
        const entered = faker.number.int({ min: 0, max: total - 5 })
        return {
          id: faker.string.uuid(),
          name: faker.helpers.arrayElement(['Unit Test 3', 'Mid-Term Exam', 'Quiz 4', 'Practical Exam']),
          class: `Class ${faker.number.int({ min: 8, max: 12 })}-${faker.helpers.arrayElement(['A', 'B', 'C'])}`,
          subject: faker.helpers.arrayElement(['Mathematics', 'Physics', 'Chemistry', 'English']),
          totalStudents: total,
          enteredCount: entered,
        }
      }),
    })
  }),

  // ==================== ACCOUNTANT DASHBOARD ====================
  http.get('/api/dashboard/accountant-stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        todayCollection: faker.number.int({ min: 50000, max: 200000 }),
        todayReceipts: faker.number.int({ min: 5, max: 25 }),
        totalPending: faker.number.int({ min: 500000, max: 2000000 }),
        studentsWithDues: faker.number.int({ min: 50, max: 200 }),
        monthCollection: faker.number.int({ min: 1000000, max: 5000000 }),
        monthGrowth: faker.number.int({ min: -10, max: 20 }),
        collectionRate: faker.number.int({ min: 65, max: 90 }),
      },
    })
  }),

  http.get('/api/dashboard/today-collection', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        total: faker.number.int({ min: 50000, max: 200000 }),
        receipts: faker.number.int({ min: 5, max: 25 }),
        cash: faker.number.int({ min: 10000, max: 50000 }),
        online: faker.number.int({ min: 20000, max: 100000 }),
        cheque: faker.number.int({ min: 5000, max: 50000 }),
      },
    })
  }),

  http.get('/api/dashboard/collection-trends', async () => {
    await mockDelay('read')
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return HttpResponse.json({
      data: days.map((day) => ({
        day,
        amount: faker.number.int({ min: 20000, max: 150000 }),
      })),
    })
  }),

  http.get('/api/dashboard/pending-dues', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => ({
        studentId: faker.string.uuid(),
        studentName: faker.person.fullName(),
        className: `Class ${faker.number.int({ min: 1, max: 12 })}`,
        section: faker.helpers.arrayElement(['A', 'B', 'C']),
        amount: faker.number.int({ min: 5000, max: 50000 }),
        daysOverdue: faker.number.int({ min: 1, max: 90 }),
      })),
    })
  }),

  http.get('/api/dashboard/recent-transactions', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        studentName: faker.person.fullName(),
        feeType: faker.helpers.arrayElement(['Tuition Fee', 'Transport Fee', 'Lab Fee', 'Library Fee']),
        amount: faker.number.int({ min: 1000, max: 25000 }),
        mode: faker.helpers.arrayElement(['Cash', 'Online', 'Cheque', 'UPI']),
        date: faker.date.recent({ days: 1 }).toISOString(),
      })),
    })
  }),

  // ==================== LIBRARIAN DASHBOARD ====================
  http.get('/api/dashboard/librarian-stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        totalBooks: faker.number.int({ min: 5000, max: 15000 }),
        totalTitles: faker.number.int({ min: 2000, max: 5000 }),
        issuedBooks: faker.number.int({ min: 200, max: 500 }),
        activeMembers: faker.number.int({ min: 100, max: 300 }),
        overdueBooks: faker.number.int({ min: 5, max: 30 }),
        overdueMembers: faker.number.int({ min: 3, max: 20 }),
        pendingReservations: faker.number.int({ min: 0, max: 15 }),
      },
    })
  }),

  http.get('/api/dashboard/circulation-stats', async () => {
    await mockDelay('read')
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return HttpResponse.json({
      data: days.map((day) => ({
        day,
        issued: faker.number.int({ min: 5, max: 25 }),
        returned: faker.number.int({ min: 3, max: 20 }),
      })),
    })
  }),

  http.get('/api/dashboard/overdue-books', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 8 }, () => ({
        id: faker.string.uuid(),
        bookTitle: faker.lorem.words(3),
        memberName: faker.person.fullName(),
        dueDate: faker.date.recent({ days: 10 }).toISOString(),
        daysOverdue: faker.number.int({ min: 1, max: 14 }),
      })),
    })
  }),

  http.get('/api/dashboard/pending-reservations', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        bookTitle: faker.lorem.words(3),
        memberName: faker.person.fullName(),
        reservedAt: faker.date.recent({ days: 3 }).toISOString(),
        status: faker.helpers.arrayElement(['available', 'waiting']),
      })),
    })
  }),

  http.get('/api/dashboard/library-activity', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        action: faker.helpers.arrayElement(['Issue', 'Return', 'Reserve', 'Renew']),
        bookTitle: faker.lorem.words(3),
        memberName: faker.person.fullName(),
        timestamp: faker.date.recent({ days: 1 }).toISOString(),
      })),
    })
  }),

  // ==================== TRANSPORT MANAGER DASHBOARD ====================
  http.get('/api/dashboard/transport-stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        totalVehicles: faker.number.int({ min: 10, max: 30 }),
        activeVehicles: faker.number.int({ min: 8, max: 25 }),
        activeRoutes: faker.number.int({ min: 8, max: 20 }),
        totalStudents: faker.number.int({ min: 300, max: 800 }),
        maintenanceDue: faker.number.int({ min: 0, max: 5 }),
        totalDrivers: faker.number.int({ min: 10, max: 30 }),
        availableDrivers: faker.number.int({ min: 8, max: 25 }),
      },
    })
  }),

  http.get('/api/dashboard/fleet-status', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 12 }, () => ({
        id: faker.string.uuid(),
        registrationNumber: `KA ${faker.number.int({ min: 10, max: 99 })} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.number.int({ min: 1000, max: 9999 })}`,
        routeName: `Route ${faker.number.int({ min: 1, max: 15 })} - ${faker.location.street()}`,
        driverName: faker.person.fullName(),
        status: faker.helpers.arrayElement(['active', 'active', 'active', 'maintenance', 'inactive']),
      })),
    })
  }),

  http.get('/api/dashboard/maintenance-alerts', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        vehicleNumber: `KA ${faker.number.int({ min: 10, max: 99 })} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.number.int({ min: 1000, max: 9999 })}`,
        issue: faker.helpers.arrayElement(['Oil Change', 'Tire Replacement', 'Brake Service', 'AC Service', 'Engine Check']),
        dueDate: faker.date.soon({ days: 10 }).toISOString(),
        priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
      })),
    })
  }),

  http.get('/api/dashboard/route-performance', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 8 }, (_, i) => ({
        id: faker.string.uuid(),
        name: `Route ${i + 1} - ${faker.location.street()}`,
        onTimeRate: faker.number.int({ min: 70, max: 98 }),
        totalStudents: faker.number.int({ min: 25, max: 60 }),
        totalStops: faker.number.int({ min: 8, max: 15 }),
      })),
    })
  }),

  http.get('/api/dashboard/driver-status', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['on_duty', 'available', 'on_leave']),
        assignedVehicle: `KA ${faker.number.int({ min: 10, max: 99 })} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.number.int({ min: 1000, max: 9999 })}`,
      })),
    })
  }),

  // ==================== NOTIFICATION CENTER ====================
  http.get('/api/notifications', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: appNotifications })
  }),

  http.patch('/api/notifications/:id/read', async ({ params }) => {
    await mockDelay('read')
    const notification = appNotifications.find((n) => n.id === params.id)
    if (notification) notification.read = true
    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/notifications/mark-all-read', async () => {
    await mockDelay('read')
    appNotifications.forEach((n) => (n.read = true))
    return HttpResponse.json({ success: true })
  }),

  // ==================== STUDENT DASHBOARD ENHANCEMENTS ====================
  http.get('/api/dashboard/student-courses', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 6 }, () => ({
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement([
          'Mathematics Advanced',
          'Physics Fundamentals',
          'Chemistry Lab',
          'English Literature',
          'Computer Science',
          'Biology Basics',
        ]),
        progress: faker.number.int({ min: 20, max: 95 }),
        lastAccessed: faker.date.recent({ days: 3 }).toISOString(),
      })),
    })
  }),

  http.get('/api/dashboard/student-assignments', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 6 }, () => ({
        id: faker.string.uuid(),
        title: faker.helpers.arrayElement([
          'Chapter 5 Problems',
          'Lab Report',
          'Essay Assignment',
          'Practice Questions',
          'Project Work',
        ]),
        courseName: faker.helpers.arrayElement(['Mathematics', 'Physics', 'Chemistry', 'English']),
        dueDate: faker.date.soon({ days: 10 }).toISOString(),
        daysUntilDue: faker.number.int({ min: -2, max: 10 }),
      })),
    })
  }),

  http.get('/api/dashboard/student-transport', async () => {
    await mockDelay('read')
    // 80% chance of having transport assigned
    if (Math.random() > 0.2) {
      return HttpResponse.json({
        data: {
          routeName: `Route ${faker.number.int({ min: 1, max: 10 })} - ${faker.location.street()}`,
          vehicleNumber: `KA ${faker.number.int({ min: 10, max: 99 })} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.number.int({ min: 1000, max: 9999 })}`,
          driverName: faker.person.fullName(),
          driverPhone: faker.phone.number(),
          stopName: faker.location.streetAddress(),
          pickupTime: `${faker.number.int({ min: 6, max: 8 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])} AM`,
          dropTime: `${faker.number.int({ min: 2, max: 4 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])} PM`,
        },
      })
    }
    return HttpResponse.json({ data: null })
  }),

  // ==================== PARENT DASHBOARD ENHANCEMENTS ====================
  http.get('/api/dashboard/child-timetable', async () => {
    await mockDelay('read')
    const periods = [
      { period: 1, time: '8:00 - 8:45', subject: 'Mathematics', teacherName: 'Mrs. Sharma', room: 'Room 101' },
      { period: 2, time: '8:45 - 9:30', subject: 'English', teacherName: 'Mr. Gupta', room: 'Room 102' },
      { period: 3, time: '9:45 - 10:30', subject: 'Science', teacherName: 'Dr. Patel', room: 'Lab 1' },
      { period: 4, time: '10:30 - 11:15', subject: 'Hindi', teacherName: 'Mrs. Singh', room: 'Room 103' },
      { period: 5, time: '11:30 - 12:15', subject: 'Social Studies', teacherName: 'Mr. Verma', room: 'Room 104' },
      { period: 6, time: '12:15 - 1:00', subject: 'Computer Science', teacherName: 'Mr. Kumar', room: 'Computer Lab' },
    ]
    return HttpResponse.json({ data: periods })
  }),

  http.get('/api/dashboard/child-assignments', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: Array.from({ length: 6 }, () => ({
        id: faker.string.uuid(),
        title: faker.helpers.arrayElement([
          'Chapter 5 Problems',
          'Lab Report',
          'Essay Assignment',
          'Practice Questions',
          'Project Work',
        ]),
        courseName: faker.helpers.arrayElement(['Mathematics', 'Physics', 'Chemistry', 'English']),
        dueDate: faker.date.soon({ days: 10 }).toISOString(),
        daysUntilDue: faker.number.int({ min: -2, max: 10 }),
      })),
    })
  }),

  http.get('/api/dashboard/child-teachers', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Mrs. Priya Sharma', subject: 'Mathematics', email: 'priya.sharma@school.edu' },
        { id: '2', name: 'Mr. Rajesh Gupta', subject: 'English', email: 'rajesh.gupta@school.edu' },
        { id: '3', name: 'Dr. Anita Patel', subject: 'Science', email: 'anita.patel@school.edu' },
        { id: '4', name: 'Mrs. Sunita Singh', subject: 'Hindi', email: 'sunita.singh@school.edu' },
        { id: '5', name: 'Mr. Arun Kumar', subject: 'Computer Science', email: 'arun.kumar@school.edu' },
      ],
    })
  }),

  // ==================== USER-SCOPED ====================

  // Get parent's children with aggregated stats
  http.get('/api/users/my-children', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isParent(context)) {
      return HttpResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    if (!context.childIds || context.childIds.length === 0) {
      return HttpResponse.json({ error: 'No children linked to account' }, { status: 404 })
    }

    // Build a Map for O(1) student lookups instead of O(n) find() in a loop
    const studentMap = new Map(students.map(s => [s.id, s]))
    // Build Maps for O(1) fee and book lookups
    const feesByStudent = new Map<string, typeof studentFees>()
    studentFees.forEach(fee => {
      const existing = feesByStudent.get(fee.studentId) || []
      existing.push(fee)
      feesByStudent.set(fee.studentId, existing)
    })
    const booksByStudent = new Map<string, number>()
    issuedBooks.forEach(book => {
      if (book.status !== 'returned') {
        booksByStudent.set(book.studentId, (booksByStudent.get(book.studentId) || 0) + 1)
      }
    })

    // Build children data with aggregated stats
    const children = context.childIds.map((childId) => {
      // O(1) lookup using Map instead of O(n) find()
      const student = studentMap.get(childId)

      // Get attendance data
      const attendanceData = generateStudentAttendanceView(childId)

      // Get fees data using O(1) Map lookup
      const fees = feesByStudent.get(childId) || []
      const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0)
      const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0)
      const totalDiscount = fees.reduce((sum, f) => sum + f.discountAmount, 0)
      const pendingFees = totalFees - totalPaid - totalDiscount

      // Get library books count using O(1) Map lookup
      const libraryBooks = booksByStudent.get(childId) || 0

      return {
        id: childId,
        name: student?.name || `Student ${childId}`,
        class: student?.class || 'Class 10',
        section: student?.section || 'A',
        rollNumber: student?.rollNumber || 1,
        avatar: student?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${childId}`,
        attendance: {
          percentage: attendanceData.summary.attendancePercentage,
          presentDays: attendanceData.summary.presentDays,
          absentDays: attendanceData.summary.absentDays,
          totalDays: attendanceData.summary.totalDays,
        },
        pendingFees,
        libraryBooks,
      }
    })

    return HttpResponse.json({ data: children })
  }),

  // Students
  http.get('/api/students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const classFilter = url.searchParams.get('class')
    const section = url.searchParams.get('section')
    const status = url.searchParams.get('status')

    let filtered = [...students]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.admissionNumber.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      )
    }

    if (classFilter) {
      filtered = filtered.filter((s) => s.class === classFilter)
    }

    if (section) {
      filtered = filtered.filter((s) => s.section === section)
    }

    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginatedData = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  http.get('/api/students/:id', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)

    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: student })
  }),

  // Create student (used by enrollment)
  http.post('/api/students', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Partial<Student> & { firstName?: string; lastName?: string }

    const now = new Date()
    const admissionYear = now.getFullYear()
    const count = students.length + 1

    // Support both name and firstName/lastName patterns
    const name = body.name || (body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : '')

    const newStudent: Student = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      admissionNumber: `ADM${admissionYear}${String(count).padStart(4, '0')}`,
      name,
      email: body.email || '',
      phone: body.phone || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender || 'male',
      bloodGroup: body.bloodGroup || 'O+',
      class: body.class || '',
      section: body.section || 'A',
      rollNumber: body.rollNumber || 1,
      admissionDate: now.toISOString(),
      photoUrl: body.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      address: body.address || { street: '', city: '', state: '', pincode: '' },
      parent: body.parent || { fatherName: '', motherName: '', guardianPhone: '', guardianEmail: '', occupation: '' },
      status: 'active',
    }

    students.unshift(newStudent)

    return HttpResponse.json({ data: newStudent }, { status: 201 })
  }),

  // Update student
  http.put('/api/students/:id', async ({ params, request }) => {
    await mockDelay('read')
    const studentIndex = students.findIndex((s) => s.id === params.id)

    if (studentIndex === -1) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<Student> & { firstName?: string; lastName?: string }
    const existingStudent = students[studentIndex]

    // Support both name and firstName/lastName patterns
    let name = existingStudent.name
    if (body.name) {
      name = body.name
    } else if (body.firstName && body.lastName) {
      name = `${body.firstName} ${body.lastName}`
    }

    const updatedStudent: Student = {
      ...existingStudent,
      ...body,
      name,
      photoUrl: body.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
    }

    students[studentIndex] = updatedStudent

    return HttpResponse.json({ data: updatedStudent })
  }),

  // Delete student
  http.delete('/api/students/:id', async ({ params }) => {
    await mockDelay('read')
    const studentIndex = students.findIndex((s) => s.id === params.id)

    if (studentIndex === -1) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    students.splice(studentIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // Enroll student from application
  http.post('/api/students/enroll', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      applicationId: string
      section: string
      rollNumber: number
      bloodGroup: string
    }

    // Find the application
    const applicationIndex = applications.findIndex((a) => a.id === body.applicationId)
    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const application = applications[applicationIndex]

    // Check if already enrolled
    if (application.status === 'enrolled') {
      return HttpResponse.json({ error: 'Application already enrolled' }, { status: 400 })
    }

    // Create the student
    const now = new Date()
    const admissionYear = now.getFullYear()
    const count = students.length + 1

    const newStudent: Student = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      admissionNumber: `ADM${admissionYear}${String(count).padStart(4, '0')}`,
      name: application.studentName,
      email: application.email,
      phone: application.phone,
      dateOfBirth: application.dateOfBirth,
      gender: application.gender,
      bloodGroup: body.bloodGroup,
      class: application.applyingForClass,
      section: body.section,
      rollNumber: body.rollNumber,
      admissionDate: now.toISOString(),
      photoUrl: application.photoUrl,
      address: application.address,
      parent: {
        fatherName: application.fatherName,
        motherName: application.motherName,
        guardianPhone: application.guardianPhone,
        guardianEmail: application.guardianEmail,
        occupation: application.guardianOccupation,
      },
      status: 'active',
    }

    students.unshift(newStudent)

    // Update application status to enrolled
    const updatedApplication = {
      ...application,
      status: 'enrolled' as const,
      enrolledStudentId: newStudent.id,
      statusHistory: [
        ...application.statusHistory,
        {
          id: Math.random().toString(36).substring(2, 9),
          fromStatus: application.status,
          toStatus: 'enrolled' as const,
          changedAt: now.toISOString(),
          changedBy: 'Current User',
          note: `Student enrolled with roll number ${body.rollNumber} in Section ${body.section}`,
        },
      ],
      updatedAt: now.toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({
      student: newStudent,
      application: updatedApplication
    }, { status: 201 })
  }),

  // Get next roll number for a class/section
  http.get('/api/students/next-roll-number', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('class') || ''
    const section = url.searchParams.get('section') || ''

    // Find the highest roll number in this class/section
    const classStudents = students.filter(
      (s) => s.class === className && s.section === section
    )

    const maxRollNumber = classStudents.reduce(
      (max, s) => Math.max(max, s.rollNumber),
      0
    )

    return HttpResponse.json({ nextRollNumber: maxRollNumber + 1 })
  }),

  // Staff
  http.get('/api/staff', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const department = url.searchParams.get('department')
    const status = url.searchParams.get('status')

    let filtered = [...staff]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.employeeId.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      )
    }

    if (department) {
      filtered = filtered.filter((s) => s.department === department)
    }

    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginatedData = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  http.get('/api/staff/:id', async ({ params }) => {
    await mockDelay('read')
    const member = staff.find((s) => s.id === params.id)

    if (!member) {
      return HttpResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: member })
  }),
]

export const worker = setupWorker(...handlers, ...admissionsHandlers, ...staffHandlers, ...libraryHandlers, ...financeHandlers, ...settingsHandlers, ...integrationsHandlers, ...examsHandlers, ...attendanceHandlers, ...studentsHandlers, ...transportHandlers, ...lmsHandlers, ...hostelHandlers, ...visitorsHandlers, ...inventoryHandlers, ...alumniHandlers, ...questionBankHandlers, ...communicationHandlers, ...behaviorHandlers, ...reportsHandlers, ...timetableHandlers, ...parentPortalHandlers, ...documentsHandlers, ...clubsHandlers, ...complaintsHandlers, ...facilitiesHandlers, ...scholarshipsHandlers, ...addonHandlers, ...calendarHandlers, ...permissionHandlers, ...aiPlannerHandlers, ...agentChatHandlers, ...schoolWebsiteHandlers)
