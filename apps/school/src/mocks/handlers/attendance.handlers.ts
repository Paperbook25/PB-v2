import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  generateStudentsForClass,
  getAttendanceForDate,
  saveAttendanceRecords,
  leaveRequests,
  generateStudentAttendanceView,
  generateId,
  generatePeriodDefinitions,
  generatePeriodAttendance,
  generateStudentPeriodSummary,
  attendanceThreshold,
  attendanceAlerts,
  latePolicy,
  lateRecords,
  generateLatePatterns,
  notificationConfigs,
  absenceNotifications,
  generateNotificationStats,
  biometricDevices,
  biometricSyncLogs,
} from '../data/attendance.data'
import { getUserContext, isParent } from '../utils/auth-context'
import type {
  AttendanceStatus,
  LeaveStatus,
  PeriodNumber,
  BiometricDeviceType,
  NotificationChannel,
  NotificationEventType,
} from '@/features/attendance/types/attendance.types'

export const attendanceHandlers = [
  // ==================== ATTENDANCE ====================

  // Get students for attendance marking
  http.get('/api/attendance/students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Get existing attendance or generate new students
    const existingRecords = getAttendanceForDate(date, className, section)

    // Map to attendance students with current status
    const students = existingRecords.map((record) => ({
      id: record.studentId,
      name: record.studentName,
      admissionNumber: record.admissionNumber,
      rollNumber: record.rollNumber,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.studentName}`,
      status: record.status,
      remarks: record.remarks,
    }))

    return HttpResponse.json({ data: students })
  }),

  // Get class attendance for a date
  http.get('/api/attendance', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'

    const records = getAttendanceForDate(date, className, section)

    // Calculate summary
    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const late = records.filter((r) => r.status === 'late').length
    const halfDay = records.filter((r) => r.status === 'half_day').length
    const excused = records.filter((r) => r.status === 'excused').length

    return HttpResponse.json({
      data: {
        date,
        className,
        section,
        totalStudents: records.length,
        present,
        absent,
        late,
        halfDay,
        excused,
        records,
      },
    })
  }),

  // Mark attendance
  http.post('/api/attendance', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as {
      date: string
      className: string
      section: string
      records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
    }

    saveAttendanceRecords(body.date, body.className, body.section, body.records)

    return HttpResponse.json({
      success: true,
      markedCount: body.records.length,
    })
  }),

  // Get attendance history
  http.get('/api/attendance/history', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className')
    const section = url.searchParams.get('section')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Generate some historical data
    const records = []
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue

      const dateStr = d.toISOString().split('T')[0]
      const dayRecords = getAttendanceForDate(
        dateStr,
        className || 'Class 10',
        section || 'A'
      )
      records.push(...dayRecords)
    }

    return HttpResponse.json({
      data: records,
      meta: { total: records.length },
    })
  }),

  // ==================== STUDENT ATTENDANCE ====================

  // Get student's own attendance
  http.get('/api/attendance/my', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear') || '2024-25'

    // Get student ID from auth headers
    const context = getUserContext(request)
    const studentId = context?.studentId

    if (!studentId) {
      return HttpResponse.json({ error: 'Unauthorized - Student ID required' }, { status: 403 })
    }

    const data = generateStudentAttendanceView(studentId)

    return HttpResponse.json({ data })
  }),

  // Get attendance for parent's children
  http.get('/api/attendance/my-children', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear') || '2024-25'

    const context = getUserContext(request)

    if (!context || !isParent(context)) {
      return HttpResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    if (!context.childIds || context.childIds.length === 0) {
      return HttpResponse.json({ error: 'No children linked to account' }, { status: 404 })
    }

    // Generate attendance for each child
    const childrenAttendance = context.childIds.map((childId) => {
      return generateStudentAttendanceView(childId)
    })

    return HttpResponse.json({ data: childrenAttendance })
  }),

  // Get specific student's attendance
  http.get('/api/students/:studentId/attendance', async ({ params, request }) => {
    await mockDelay('read')
    const { studentId } = params
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear') || '2024-25'

    const data = generateStudentAttendanceView(studentId as string)

    return HttpResponse.json({ data })
  }),

  // ==================== REPORTS ====================

  // Get attendance report
  http.get('/api/attendance/report', async ({ request }) => {
    await mockDelay('write')
    const url = new URL(request.url)
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'

    // Generate report for all students
    const students = generateStudentsForClass(className, section)

    const report = students.map((student) => {
      const totalDays = faker.number.int({ min: 180, max: 200 })
      const presentDays = faker.number.int({ min: Math.floor(totalDays * 0.7), max: totalDays })
      const absentDays = faker.number.int({ min: 0, max: totalDays - presentDays })
      const lateDays = faker.number.int({ min: 0, max: 10 })
      const halfDays = faker.number.int({ min: 0, max: 5 })
      const excusedDays = totalDays - presentDays - absentDays - lateDays - halfDays

      return {
        studentId: student.id,
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        className,
        section,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        excusedDays: Math.max(0, excusedDays),
        attendancePercentage: Math.round((presentDays / totalDays) * 100),
        monthlyBreakdown: [],
      }
    })

    return HttpResponse.json({ data: report })
  }),

  // Get attendance summary
  http.get('/api/attendance/summary', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'
    const month = url.searchParams.get('month') || String(new Date().getMonth() + 1)
    const year = url.searchParams.get('year') || String(new Date().getFullYear())

    // Generate daily data for the month
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    const dailyData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day)
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const totalStudents = 40
      const present = faker.number.int({ min: 30, max: 40 })
      const absent = faker.number.int({ min: 0, max: totalStudents - present })
      const late = totalStudents - present - absent

      dailyData.push({
        date: date.toISOString().split('T')[0],
        present,
        absent,
        late,
      })
    }

    const avgPresent = dailyData.reduce((sum, d) => sum + d.present, 0) / dailyData.length

    return HttpResponse.json({
      data: {
        totalStudents: 40,
        averageAttendance: Math.round((avgPresent / 40) * 100),
        dailyData,
      },
    })
  }),

  // ==================== LEAVE MANAGEMENT ====================

  // Get leave requests
  http.get('/api/attendance/leaves', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const className = url.searchParams.get('className')
    const section = url.searchParams.get('section')

    let filtered = [...leaveRequests]

    if (status) {
      filtered = filtered.filter((l) => l.status === status)
    }
    if (className) {
      filtered = filtered.filter((l) => l.className === className)
    }
    if (section) {
      filtered = filtered.filter((l) => l.section === section)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Create leave request
  http.post('/api/attendance/leaves', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as {
      studentId: string
      leaveType: string
      startDate: string
      endDate: string
      reason: string
    }

    const newLeave = {
      id: generateId(),
      studentId: body.studentId,
      studentName: 'Student Name',
      className: 'Class 10',
      section: 'A',
      leaveType: body.leaveType as any,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
      status: 'pending' as LeaveStatus,
      appliedBy: 'Parent',
      appliedAt: new Date().toISOString(),
    }

    leaveRequests.push(newLeave)

    return HttpResponse.json({ data: newLeave }, { status: 201 })
  }),

  // Update leave request (approve/reject)
  http.put('/api/attendance/leaves/:id', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as {
      status: LeaveStatus
      rejectionReason?: string
    }

    const leaveIndex = leaveRequests.findIndex((l) => l.id === id)
    if (leaveIndex === -1) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    leaveRequests[leaveIndex] = {
      ...leaveRequests[leaveIndex],
      status: body.status,
      rejectionReason: body.rejectionReason,
      approvedBy: 'Current User',
      approvedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: leaveRequests[leaveIndex] })
  }),

  // Get student's leave requests
  http.get('/api/students/:studentId/leaves', async ({ params }) => {
    await mockDelay('read')
    const { studentId } = params

    const studentLeaves = leaveRequests.filter((l) => l.studentId === studentId)

    return HttpResponse.json({ data: studentLeaves })
  }),

  // ==================== PERIOD-WISE ATTENDANCE ====================

  // Get period definitions for a class
  http.get('/api/attendance/periods/definitions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'

    const periods = generatePeriodDefinitions(className, section)
    return HttpResponse.json({ data: periods })
  }),

  // Get period attendance for a date/class/section/period
  http.get('/api/attendance/periods', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'
    const period = parseInt(url.searchParams.get('period') || '1') as PeriodNumber

    const periods = generatePeriodDefinitions(className, section)
    const records = generatePeriodAttendance(date, className, section, period)

    return HttpResponse.json({
      data: {
        date,
        className,
        section,
        periods,
        records,
      },
    })
  }),

  // Mark period attendance
  http.post('/api/attendance/periods', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as {
      date: string
      className: string
      section: string
      period: PeriodNumber
      subject: string
      records: { studentId: string; status: AttendanceStatus }[]
    }

    return HttpResponse.json({
      success: true,
      markedCount: body.records.length,
    })
  }),

  // Get student period-wise summary
  http.get('/api/attendance/periods/summary', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'

    const summaries = generateStudentPeriodSummary(className, section)
    return HttpResponse.json({ data: summaries })
  }),

  // ==================== SHORTAGE ALERTS ====================

  // Get threshold config
  http.get('/api/attendance/thresholds', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: attendanceThreshold })
  }),

  // Update threshold config
  http.put('/api/attendance/thresholds', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Partial<typeof attendanceThreshold>
    Object.assign(attendanceThreshold, body)
    return HttpResponse.json({ data: attendanceThreshold })
  }),

  // Get active alerts
  http.get('/api/attendance/alerts', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const severity = url.searchParams.get('severity')
    const type = url.searchParams.get('type')

    let filtered = [...attendanceAlerts]
    if (severity) filtered = filtered.filter((a) => a.severity === severity)
    if (type) filtered = filtered.filter((a) => a.type === type)

    return HttpResponse.json({ data: filtered })
  }),

  // Acknowledge an alert
  http.post('/api/attendance/alerts/:id/acknowledge', async ({ params }) => {
    await mockDelay('read')
    const { id } = params
    const alert = attendanceAlerts.find((a) => a.id === id)
    if (!alert) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    alert.acknowledgedAt = new Date().toISOString()
    alert.acknowledgedBy = 'Current User'
    return HttpResponse.json({ data: alert })
  }),

  // ==================== LATE DETECTION ====================

  // Get late policy
  http.get('/api/attendance/late-policy', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: latePolicy })
  }),

  // Update late policy
  http.put('/api/attendance/late-policy', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Partial<typeof latePolicy>
    Object.assign(latePolicy, body)
    return HttpResponse.json({ data: latePolicy })
  }),

  // Get late records
  http.get('/api/attendance/late-records', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className')
    const date = url.searchParams.get('date')

    let filtered = [...lateRecords]
    if (className) filtered = filtered.filter((r) => r.className === className)
    if (date) filtered = filtered.filter((r) => r.date === date)

    return HttpResponse.json({ data: filtered })
  }),

  // Get habitual latecomers / late patterns
  http.get('/api/attendance/late-patterns', async () => {
    await mockDelay('write')
    const patterns = generateLatePatterns()
    return HttpResponse.json({ data: patterns })
  }),

  // ==================== ABSENCE NOTIFICATIONS ====================

  // Get notification configs
  http.get('/api/attendance/notifications/config', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: notificationConfigs })
  }),

  // Update notification config
  http.put('/api/attendance/notifications/config/:channel', async ({ params, request }) => {
    await mockDelay('read')
    const { channel } = params
    const body = (await request.json()) as {
      enabled: boolean
      events: NotificationEventType[]
      timing: 'immediate' | 'daily_digest'
    }

    const config = notificationConfigs.find((c) => c.channel === channel)
    if (!config) {
      return HttpResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    config.enabled = body.enabled
    config.events = body.events
    config.timing = body.timing

    return HttpResponse.json({ data: config })
  }),

  // Get notification history
  http.get('/api/attendance/notifications/history', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const channel = url.searchParams.get('channel')
    const eventType = url.searchParams.get('eventType')

    let filtered = [...absenceNotifications]
    if (channel) filtered = filtered.filter((n) => n.channel === channel)
    if (eventType) filtered = filtered.filter((n) => n.eventType === eventType)

    // Sort by sentAt descending
    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Get notification stats
  http.get('/api/attendance/notifications/stats', async () => {
    await mockDelay('read')
    const stats = generateNotificationStats()
    return HttpResponse.json({ data: stats })
  }),

  // Send test notification
  http.post('/api/attendance/notifications/test', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { channel: NotificationChannel; recipient: string }

    return HttpResponse.json({
      data: {
        id: generateId(),
        channel: body.channel,
        recipient: body.recipient,
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    })
  }),

  // ==================== BIOMETRIC DEVICES ====================

  // Get all devices
  http.get('/api/biometric/devices', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: biometricDevices })
  }),

  // Register a new device
  http.post('/api/biometric/devices', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as {
      name: string
      type: BiometricDeviceType
      location: string
      model: string
      serialNumber: string
      ipAddress: string
    }

    const newDevice = {
      id: generateId(),
      ...body,
      status: 'inactive' as const,
      lastSyncAt: undefined,
      installedAt: new Date().toISOString().split('T')[0],
      enrolledStudents: 0,
      totalCapacity: 500,
    }

    biometricDevices.push(newDevice)
    return HttpResponse.json({ data: newDevice }, { status: 201 })
  }),

  // Update device status
  http.put('/api/biometric/devices/:id', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as Partial<typeof biometricDevices[0]>

    const device = biometricDevices.find((d) => d.id === id)
    if (!device) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    Object.assign(device, body)
    return HttpResponse.json({ data: device })
  }),

  // Get sync logs
  http.get('/api/biometric/sync-logs', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const deviceId = url.searchParams.get('deviceId')

    let filtered = [...biometricSyncLogs]
    if (deviceId) filtered = filtered.filter((l) => l.deviceId === deviceId)

    filtered.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Trigger sync for a device
  http.post('/api/biometric/devices/:id/sync', async ({ params }) => {
    await mockDelay('heavy')
    const { id } = params

    const device = biometricDevices.find((d) => d.id === id)
    if (!device) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    device.lastSyncAt = new Date().toISOString()

    const newLog = {
      id: generateId(),
      deviceId: device.id,
      deviceName: device.name,
      syncedAt: new Date().toISOString(),
      recordsProcessed: faker.number.int({ min: 50, max: 300 }),
      recordsFailed: 0,
      status: 'success' as const,
      duration: faker.number.int({ min: 10, max: 60 }),
    }

    biometricSyncLogs.unshift(newLog)

    return HttpResponse.json({ data: newLog })
  }),
]
