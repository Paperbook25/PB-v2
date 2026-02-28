import { faker } from '@faker-js/faker'
import type {
  AttendanceRecord,
  AttendanceStudent,
  AttendanceStatus,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  PeriodDefinition,
  PeriodAttendanceRecord,
  PeriodNumber,
  StudentPeriodSummary,
  AttendanceThreshold,
  AttendanceAlert,
  AlertType,
  AlertSeverity,
  LatePolicy,
  LateRecord,
  LatePatternStudent,
  NotificationConfig,
  NotificationChannel,
  NotificationEventType,
  AbsenceNotification,
  NotificationStats,
  BiometricDevice,
  BiometricDeviceType,
  BiometricDeviceStatus,
  BiometricSyncLog,
} from '@/features/attendance/types/attendance.types'
import { SUBJECTS, PERIOD_NAMES } from '@/features/attendance/types/attendance.types'

// Helper to generate ID
export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

// Generate mock students for a class/section
export function generateStudentsForClass(className: string, section: string, count: number = 40): AttendanceStudent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `STU-${className.replace('Class ', '')}-${section}-${String(i + 1).padStart(3, '0')}`,
    name: faker.person.fullName(),
    admissionNumber: `ADM2024${String(faker.number.int({ min: 1000, max: 9999 }))}`,
    rollNumber: i + 1,
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.person.firstName()}${i}`,
  }))
}

// Store for attendance records (simulates database)
export const attendanceRecords: Map<string, AttendanceRecord[]> = new Map()

// Generate attendance for a specific date
export function generateAttendanceForDate(
  students: AttendanceStudent[],
  date: string,
  className: string,
  section: string
): AttendanceRecord[] {
  const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'excused']
  const weights = [75, 10, 8, 4, 3] // % probability for each status

  return students.map((student) => {
    // Weighted random status
    const rand = faker.number.int({ min: 1, max: 100 })
    let cumulative = 0
    let status: AttendanceStatus = 'present'
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i]
      if (rand <= cumulative) {
        status = statuses[i]
        break
      }
    }

    return {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      date,
      status,
      checkInTime: status === 'present' ? '08:00' : status === 'late' ? '08:45' : undefined,
      checkOutTime: status !== 'absent' ? '14:30' : undefined,
      remarks: status === 'excused' ? 'Medical appointment' : undefined,
      markedBy: 'Priya Teacher',
      markedAt: new Date().toISOString(),
    }
  })
}

// Get or create attendance for a date/class/section
export function getAttendanceForDate(
  date: string,
  className: string,
  section: string
): AttendanceRecord[] {
  const key = `${date}-${className}-${section}`

  if (!attendanceRecords.has(key)) {
    const students = generateStudentsForClass(className, section)
    const records = generateAttendanceForDate(students, date, className, section)
    attendanceRecords.set(key, records)
  }

  return attendanceRecords.get(key)!
}

// Save attendance records
export function saveAttendanceRecords(
  date: string,
  className: string,
  section: string,
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
): void {
  const key = `${date}-${className}-${section}`
  const existingRecords = attendanceRecords.get(key) || []

  // Update existing records or create new ones
  const updatedRecords = existingRecords.map((record) => {
    const update = records.find((r) => r.studentId === record.studentId)
    if (update) {
      return {
        ...record,
        status: update.status,
        remarks: update.remarks,
        markedAt: new Date().toISOString(),
      }
    }
    return record
  })

  attendanceRecords.set(key, updatedRecords)
}

// Leave requests store
export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave_001',
    studentId: 'STU-10-A-001',
    studentName: 'Rahul Kumar',
    className: 'Class 10',
    section: 'A',
    leaveType: 'sick',
    startDate: faker.date.recent({ days: 5 }).toISOString().split('T')[0],
    endDate: faker.date.recent({ days: 3 }).toISOString().split('T')[0],
    reason: 'Fever and cold. Doctor advised rest for 3 days.',
    status: 'approved',
    appliedBy: 'Suresh Kumar (Parent)',
    appliedAt: faker.date.recent({ days: 6 }).toISOString(),
    approvedBy: 'Priya Teacher',
    approvedAt: faker.date.recent({ days: 5 }).toISOString(),
  },
  {
    id: 'leave_002',
    studentId: 'STU-10-A-015',
    studentName: 'Priya Sharma',
    className: 'Class 10',
    section: 'A',
    leaveType: 'family_emergency',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Family function - Sister\'s wedding',
    status: 'pending',
    appliedBy: 'Ramesh Sharma (Parent)',
    appliedAt: faker.date.recent({ days: 1 }).toISOString(),
  },
  {
    id: 'leave_003',
    studentId: 'STU-9-B-008',
    studentName: 'Amit Singh',
    className: 'Class 9',
    section: 'B',
    leaveType: 'medical',
    startDate: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
    endDate: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
    reason: 'Surgery - appendectomy. Medical certificate attached.',
    status: 'approved',
    appliedBy: 'Vikram Singh (Parent)',
    appliedAt: faker.date.recent({ days: 11 }).toISOString(),
    approvedBy: 'Dr. Sharma (Principal)',
    approvedAt: faker.date.recent({ days: 10 }).toISOString(),
  },
  {
    id: 'leave_004',
    studentId: 'STU-8-A-022',
    studentName: 'Neha Gupta',
    className: 'Class 8',
    section: 'A',
    leaveType: 'casual',
    startDate: faker.date.soon({ days: 3 }).toISOString().split('T')[0],
    endDate: faker.date.soon({ days: 3 }).toISOString().split('T')[0],
    reason: 'Personal work',
    status: 'rejected',
    appliedBy: 'Rajesh Gupta (Parent)',
    appliedAt: faker.date.recent({ days: 2 }).toISOString(),
    approvedBy: 'Priya Teacher',
    approvedAt: faker.date.recent({ days: 1 }).toISOString(),
    rejectionReason: 'Exam week - leave not permitted',
  },
]

// Generate student attendance view
export function generateStudentAttendanceView(studentId: string) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()

  // Generate monthly data
  const monthlyData = months.slice(0, currentMonth + 1).map((month) => {
    const totalDays = faker.number.int({ min: 20, max: 26 })
    const present = faker.number.int({ min: Math.floor(totalDays * 0.7), max: totalDays })
    const absent = faker.number.int({ min: 0, max: totalDays - present })
    const late = totalDays - present - absent

    return {
      month,
      present,
      absent,
      late,
      percentage: Math.round((present / totalDays) * 100),
    }
  })

  // Calculate totals
  const totalDays = monthlyData.reduce((sum, m) => sum + m.present + m.absent + m.late, 0)
  const presentDays = monthlyData.reduce((sum, m) => sum + m.present, 0)
  const absentDays = monthlyData.reduce((sum, m) => sum + m.absent, 0)
  const lateDays = monthlyData.reduce((sum, m) => sum + m.late, 0)

  // Generate recent records
  const recentRecords: AttendanceRecord[] = Array.from({ length: 10 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'present', 'late', 'absent']
    const status = statuses[faker.number.int({ min: 0, max: statuses.length - 1 })]

    return {
      id: generateId(),
      studentId,
      studentName: 'Rahul Kumar',
      admissionNumber: 'ADM20240001',
      rollNumber: 1,
      date: date.toISOString().split('T')[0],
      status,
      checkInTime: status === 'present' ? '08:00' : status === 'late' ? '08:35' : undefined,
      checkOutTime: status !== 'absent' ? '14:30' : undefined,
      markedBy: 'Priya Teacher',
      markedAt: date.toISOString(),
    }
  })

  return {
    studentId,
    studentName: 'Rahul Kumar',
    className: 'Class 10',
    section: 'A',
    academicYear: '2024-25',
    summary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: Math.round((presentDays / totalDays) * 100),
    },
    recentRecords,
    monthlyData,
  }
}

// ==================== PERIOD-WISE ATTENDANCE ====================

const periodTimes: Record<PeriodNumber, { start: string; end: string }> = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:45', end: '09:30' },
  3: { start: '09:45', end: '10:30' },
  4: { start: '10:30', end: '11:15' },
  5: { start: '11:30', end: '12:15' },
  6: { start: '12:15', end: '13:00' },
  7: { start: '13:45', end: '14:30' },
  8: { start: '14:30', end: '15:15' },
}

export function generatePeriodDefinitions(className: string, section: string): PeriodDefinition[] {
  const periodsCount = className.includes('11') || className.includes('12') ? 8 : 7
  const subjectPool = className.includes('11') || className.includes('12')
    ? ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science', 'Biology', 'Physical Education', 'Hindi']
    : ['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Art', 'Physical Education']

  return Array.from({ length: periodsCount }, (_, i) => {
    const period = (i + 1) as PeriodNumber
    return {
      period,
      name: PERIOD_NAMES[period],
      startTime: periodTimes[period].start,
      endTime: periodTimes[period].end,
      subject: subjectPool[i % subjectPool.length],
      teacherId: `TCH-${String(i + 1).padStart(3, '0')}`,
      teacherName: faker.person.fullName(),
    }
  })
}

export function generatePeriodAttendance(
  date: string,
  className: string,
  section: string,
  period: PeriodNumber
): PeriodAttendanceRecord[] {
  const students = generateStudentsForClass(className, section, 40)
  const periods = generatePeriodDefinitions(className, section)
  const periodDef = periods.find((p) => p.period === period)!

  return students.map((student) => {
    const rand = faker.number.int({ min: 1, max: 100 })
    let status: AttendanceStatus = 'present'
    if (rand > 90) status = 'absent'
    else if (rand > 85) status = 'late'

    return {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      date,
      period,
      periodName: periodDef.name,
      subject: periodDef.subject || 'General',
      status,
      markedBy: periodDef.teacherName || 'Teacher',
      markedAt: new Date().toISOString(),
    }
  })
}

export function generateStudentPeriodSummary(className: string, section: string): StudentPeriodSummary[] {
  const students = generateStudentsForClass(className, section, 40)
  const subjectPool = ['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Art', 'Physical Education']

  return students.map((student) => {
    const totalPeriods = faker.number.int({ min: 150, max: 180 })
    const attendedPeriods = faker.number.int({ min: Math.floor(totalPeriods * 0.7), max: totalPeriods })
    const absentPeriods = totalPeriods - attendedPeriods
    const latePeriods = faker.number.int({ min: 0, max: 10 })

    return {
      studentId: student.id,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      totalPeriods,
      attendedPeriods,
      absentPeriods,
      latePeriods,
      periodPercentage: Math.round((attendedPeriods / totalPeriods) * 100),
      subjectWise: subjectPool.map((subject) => {
        const total = faker.number.int({ min: 20, max: 30 })
        const attended = faker.number.int({ min: Math.floor(total * 0.65), max: total })
        return {
          subject,
          total,
          attended,
          percentage: Math.round((attended / total) * 100),
        }
      }),
    }
  })
}

// ==================== SHORTAGE ALERTS ====================

export const attendanceThreshold: AttendanceThreshold = {
  id: 'threshold_001',
  minimumPercentage: 75,
  warningPercentage: 80,
  consecutiveAbsenceDays: 3,
  notifyParent: true,
  notifyTeacher: true,
  notifyPrincipal: false,
  enabled: true,
}

export const attendanceAlerts: AttendanceAlert[] = [
  {
    id: 'alert_001',
    studentId: 'STU-10-A-012',
    studentName: 'Vikash Patel',
    className: 'Class 10',
    section: 'A',
    type: 'below_threshold',
    severity: 'critical',
    currentPercentage: 68,
    threshold: 75,
    message: 'Attendance dropped below minimum threshold of 75%. Currently at 68%.',
    createdAt: faker.date.recent({ days: 2 }).toISOString(),
  },
  {
    id: 'alert_002',
    studentId: 'STU-9-B-005',
    studentName: 'Anita Devi',
    className: 'Class 9',
    section: 'B',
    type: 'consecutive_absences',
    severity: 'warning',
    currentPercentage: 78,
    threshold: 3,
    message: 'Absent for 3 consecutive days without prior leave approval.',
    createdAt: faker.date.recent({ days: 1 }).toISOString(),
  },
  {
    id: 'alert_003',
    studentId: 'STU-8-A-020',
    studentName: 'Ravi Shankar',
    className: 'Class 8',
    section: 'A',
    type: 'below_threshold',
    severity: 'warning',
    currentPercentage: 79,
    threshold: 80,
    message: 'Attendance approaching minimum threshold. Currently at 79%, warning at 80%.',
    createdAt: faker.date.recent({ days: 3 }).toISOString(),
  },
  {
    id: 'alert_004',
    studentId: 'STU-10-B-008',
    studentName: 'Meena Kumari',
    className: 'Class 10',
    section: 'B',
    type: 'period_shortage',
    severity: 'critical',
    currentPercentage: 62,
    threshold: 75,
    message: 'Mathematics period attendance is only 62%. Minimum required is 75%.',
    createdAt: faker.date.recent({ days: 1 }).toISOString(),
  },
  {
    id: 'alert_005',
    studentId: 'STU-7-A-033',
    studentName: 'Suresh Yadav',
    className: 'Class 7',
    section: 'A',
    type: 'consecutive_absences',
    severity: 'critical',
    currentPercentage: 72,
    threshold: 3,
    message: 'Absent for 5 consecutive days. Parent not reachable.',
    createdAt: faker.date.recent({ days: 1 }).toISOString(),
  },
]

// ==================== LATE DETECTION ====================

export const latePolicy: LatePolicy = {
  id: 'policy_001',
  schoolStartTime: '08:00',
  lateAfterMinutes: 15,
  halfDayAfterTime: '10:30',
  enabled: true,
}

export const lateRecords: LateRecord[] = Array.from({ length: 25 }, (_, i) => {
  const classNum = faker.number.int({ min: 6, max: 12 })
  const section = faker.helpers.arrayElement(['A', 'B', 'C'])
  const lateMinutes = faker.number.int({ min: 5, max: 90 })
  const studentName = faker.person.fullName()

  return {
    id: `late_${String(i + 1).padStart(3, '0')}`,
    studentId: `STU-${classNum}-${section}-${String(faker.number.int({ min: 1, max: 40 })).padStart(3, '0')}`,
    studentName,
    className: `Class ${classNum}`,
    section,
    date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    arrivalTime: `08:${String(15 + Math.floor(lateMinutes / 60 * 45)).padStart(2, '0')}`,
    lateByMinutes: lateMinutes,
    reason: faker.helpers.arrayElement([
      'Traffic jam',
      'Bus was late',
      'Medical appointment',
      'Overslept',
      undefined,
      undefined,
    ]),
    isHabitual: lateMinutes > 30 || i < 5,
  }
})

export function generateLatePatterns(): LatePatternStudent[] {
  return Array.from({ length: 12 }, (_, i) => {
    const classNum = faker.number.int({ min: 6, max: 12 })
    const section = faker.helpers.arrayElement(['A', 'B', 'C'])
    const totalLateDays = faker.number.int({ min: 3, max: 25 })
    const lateCount30Days = faker.number.int({ min: 1, max: Math.min(totalLateDays, 15) })
    const isHabitual = lateCount30Days >= 5

    return {
      studentId: `STU-${classNum}-${section}-${String(i + 1).padStart(3, '0')}`,
      studentName: faker.person.fullName(),
      className: `Class ${classNum}`,
      section,
      totalLateDays,
      averageLateMinutes: faker.number.int({ min: 10, max: 45 }),
      lateCount30Days,
      trend: faker.helpers.arrayElement(['improving', 'stable', 'worsening'] as const),
      isHabitual,
      recentLates: lateRecords.slice(0, 3),
    }
  })
}

// ==================== ABSENCE NOTIFICATIONS ====================

export const notificationConfigs: NotificationConfig[] = [
  {
    id: 'nconf_001',
    channel: 'sms',
    enabled: true,
    events: ['absence', 'late'],
    timing: 'immediate',
  },
  {
    id: 'nconf_002',
    channel: 'email',
    enabled: true,
    events: ['absence', 'low_attendance', 'leave_status'],
    timing: 'daily_digest',
  },
  {
    id: 'nconf_003',
    channel: 'whatsapp',
    enabled: false,
    events: ['absence'],
    timing: 'immediate',
  },
  {
    id: 'nconf_004',
    channel: 'in_app',
    enabled: true,
    events: ['absence', 'late', 'low_attendance', 'leave_status'],
    timing: 'immediate',
  },
]

export const absenceNotifications: AbsenceNotification[] = Array.from({ length: 30 }, (_, i) => {
  const classNum = faker.number.int({ min: 1, max: 12 })
  const section = faker.helpers.arrayElement(['A', 'B', 'C'])
  const channel = faker.helpers.arrayElement(['sms', 'email', 'whatsapp', 'in_app'] as NotificationChannel[])
  const eventType = faker.helpers.arrayElement(['absence', 'late', 'low_attendance'] as NotificationEventType[])
  const status = faker.helpers.arrayElement(['sent', 'delivered', 'failed', 'pending'] as const)

  return {
    id: `notif_${String(i + 1).padStart(3, '0')}`,
    studentId: `STU-${classNum}-${section}-${String(faker.number.int({ min: 1, max: 40 })).padStart(3, '0')}`,
    studentName: faker.person.fullName(),
    className: `Class ${classNum}`,
    section,
    date: faker.date.recent({ days: 14 }).toISOString().split('T')[0],
    channel,
    eventType,
    recipient: channel === 'sms' ? faker.phone.number({ style: 'national' }) : faker.internet.email(),
    message: eventType === 'absence'
      ? `Your child was marked absent today.`
      : eventType === 'late'
        ? `Your child arrived late today.`
        : `Your child's attendance is below the required threshold.`,
    status,
    sentAt: faker.date.recent({ days: 14 }).toISOString(),
    deliveredAt: status === 'delivered' ? faker.date.recent({ days: 14 }).toISOString() : undefined,
  }
})

export function generateNotificationStats(): NotificationStats {
  const totalSent = absenceNotifications.length
  const delivered = absenceNotifications.filter((n) => n.status === 'delivered').length
  const failed = absenceNotifications.filter((n) => n.status === 'failed').length
  const pending = absenceNotifications.filter((n) => n.status === 'pending').length

  return {
    totalSent,
    delivered,
    failed,
    pending,
    byChannel: {
      sms: absenceNotifications.filter((n) => n.channel === 'sms').length,
      email: absenceNotifications.filter((n) => n.channel === 'email').length,
      whatsapp: absenceNotifications.filter((n) => n.channel === 'whatsapp').length,
      in_app: absenceNotifications.filter((n) => n.channel === 'in_app').length,
    },
    byEvent: {
      absence: absenceNotifications.filter((n) => n.eventType === 'absence').length,
      late: absenceNotifications.filter((n) => n.eventType === 'late').length,
      low_attendance: absenceNotifications.filter((n) => n.eventType === 'low_attendance').length,
      leave_status: absenceNotifications.filter((n) => n.eventType === 'leave_status').length,
    },
  }
}

// ==================== BIOMETRIC DEVICES ====================

export const biometricDevices: BiometricDevice[] = [
  {
    id: 'bio_001',
    name: 'Main Gate Scanner',
    type: 'fingerprint',
    location: 'Main Entrance',
    status: 'active',
    model: 'ZKTeco K40',
    serialNumber: 'ZK-2024-001',
    ipAddress: '192.168.1.101',
    lastSyncAt: faker.date.recent({ days: 1 }).toISOString(),
    installedAt: '2024-01-15',
    enrolledStudents: 450,
    totalCapacity: 1000,
  },
  {
    id: 'bio_002',
    name: 'Back Gate RFID',
    type: 'rfid',
    location: 'Back Entrance',
    status: 'active',
    model: 'HikVision DS-K1T804',
    serialNumber: 'HV-2024-002',
    ipAddress: '192.168.1.102',
    lastSyncAt: faker.date.recent({ days: 1 }).toISOString(),
    installedAt: '2024-02-10',
    enrolledStudents: 380,
    totalCapacity: 500,
  },
  {
    id: 'bio_003',
    name: 'Staff Room Scanner',
    type: 'facial',
    location: 'Staff Room Entrance',
    status: 'active',
    model: 'ZKTeco SpeedFace',
    serialNumber: 'ZK-2024-003',
    ipAddress: '192.168.1.103',
    lastSyncAt: faker.date.recent({ days: 1 }).toISOString(),
    installedAt: '2024-03-05',
    enrolledStudents: 65,
    totalCapacity: 200,
  },
  {
    id: 'bio_004',
    name: 'Library RFID',
    type: 'rfid',
    location: 'Library Entrance',
    status: 'maintenance',
    model: 'HikVision DS-K1T342',
    serialNumber: 'HV-2024-004',
    ipAddress: '192.168.1.104',
    lastSyncAt: faker.date.recent({ days: 5 }).toISOString(),
    installedAt: '2024-04-20',
    enrolledStudents: 500,
    totalCapacity: 1000,
    errorMessage: 'Scheduled maintenance - firmware update pending',
  },
  {
    id: 'bio_005',
    name: 'Lab Wing Scanner',
    type: 'fingerprint',
    location: 'Science Lab Building',
    status: 'error',
    model: 'ZKTeco UA860',
    serialNumber: 'ZK-2024-005',
    ipAddress: '192.168.1.105',
    lastSyncAt: faker.date.recent({ days: 3 }).toISOString(),
    installedAt: '2024-05-12',
    enrolledStudents: 200,
    totalCapacity: 500,
    errorMessage: 'Connection timeout - device unreachable',
  },
]

export const biometricSyncLogs: BiometricSyncLog[] = Array.from({ length: 20 }, (_, i) => {
  const device = faker.helpers.arrayElement(biometricDevices)
  const recordsProcessed = faker.number.int({ min: 100, max: 500 })
  const recordsFailed = faker.number.int({ min: 0, max: 10 })

  return {
    id: `sync_${String(i + 1).padStart(3, '0')}`,
    deviceId: device.id,
    deviceName: device.name,
    syncedAt: faker.date.recent({ days: 7 }).toISOString(),
    recordsProcessed,
    recordsFailed,
    status: recordsFailed === 0 ? 'success' : recordsFailed > 5 ? 'failed' : 'partial',
    duration: faker.number.int({ min: 5, max: 120 }),
    errorMessage: recordsFailed > 5 ? 'Partial sync failure - some records could not be processed' : undefined,
  }
})
