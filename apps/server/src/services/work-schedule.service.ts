import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Work Schedules ====================

export async function listWorkSchedules(schoolId: string) {
  return prisma.workSchedule.findMany({
    where: { organizationId: schoolId },
    orderBy: { isDefault: 'desc' },
  })
}

export async function createWorkSchedule(schoolId: string, input: {
  name: string; startTime: string; endTime: string;
  breakStartTime?: string; breakEndTime?: string;
  workingDays?: string[]; graceMinutes?: number;
  halfDayMinHours?: number; fullDayMinHours?: number; isDefault?: boolean;
}) {
  // If this is set as default, unset other defaults
  if (input.isDefault) {
    await prisma.workSchedule.updateMany({
      where: { organizationId: schoolId, isDefault: true },
      data: { isDefault: false },
    })
  }

  return prisma.workSchedule.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      startTime: input.startTime,
      endTime: input.endTime,
      breakStartTime: input.breakStartTime,
      breakEndTime: input.breakEndTime,
      workingDays: input.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      graceMinutes: input.graceMinutes ?? 15,
      halfDayMinHours: input.halfDayMinHours ?? 4,
      fullDayMinHours: input.fullDayMinHours ?? 8,
      isDefault: input.isDefault ?? false,
    },
  })
}

export async function updateWorkSchedule(id: string, schoolId: string, input: Record<string, unknown>) {
  const existing = await prisma.workSchedule.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Work schedule not found')

  if (input.isDefault === true) {
    await prisma.workSchedule.updateMany({
      where: { organizationId: schoolId, isDefault: true },
      data: { isDefault: false },
    })
  }

  return prisma.workSchedule.update({ where: { id }, data: input as any })
}

export async function deleteWorkSchedule(id: string, schoolId: string) {
  const existing = await prisma.workSchedule.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Work schedule not found')
  if (existing.isDefault) throw AppError.badRequest('Cannot delete the default work schedule')
  return prisma.workSchedule.delete({ where: { id } })
}

// ==================== Attendance Validation Against Schedule ====================

export async function validateCheckIn(schoolId: string, checkInTime: string) {
  const schedule = await prisma.workSchedule.findFirst({
    where: { organizationId: schoolId, isDefault: true },
  })

  if (!schedule) return { status: 'present', isLate: false }

  const [schedH, schedM] = schedule.startTime.split(':').map(Number)
  const [checkH, checkM] = checkInTime.split(':').map(Number)
  const schedMinutes = schedH * 60 + schedM
  const checkMinutes = checkH * 60 + checkM
  const lateMinutes = checkMinutes - schedMinutes

  if (lateMinutes <= schedule.graceMinutes) {
    return { status: 'present', isLate: false, lateMinutes: 0 }
  }

  // Check half-day threshold based on hours worked
  const halfDayThreshold = (schedule.halfDayMinHours || 4) * 60
  // If arrival is more than half-day-hours late from start, mark as half-day
  if (lateMinutes >= halfDayThreshold) {
    return { status: 'half_day', isLate: true, lateMinutes }
  }

  return { status: 'present', isLate: true, lateMinutes }
}
