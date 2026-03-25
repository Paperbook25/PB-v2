import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateRoomInput, UpdateRoomInput, CreateTimetableInput, UpdateTimetableInput,
  ListTimetablesInput, AddEntryInput, CreateSubstitutionInput,
  ListSubstitutionsInput, UpdatePeriodDefInput,
} from '../validators/timetable.validators.js'

// ==================== Enum Mappers ====================

const roomTypeToDb: Record<string, string> = {
  classroom: 'room_classroom', lab: 'room_lab', library: 'room_library',
  auditorium: 'room_auditorium', sports: 'room_sports',
}
const roomTypeFromDb: Record<string, string> = {
  room_classroom: 'classroom', room_lab: 'lab', room_library: 'library',
  room_auditorium: 'auditorium', room_sports: 'sports',
}

const ttStatusToDb: Record<string, string> = {
  draft: 'tt_draft', published: 'tt_published', archived: 'tt_archived',
}
const ttStatusFromDb: Record<string, string> = {
  tt_draft: 'draft', tt_published: 'published', tt_archived: 'archived',
}

const subStatusToDb: Record<string, string> = {
  pending: 'sub_pending', approved: 'sub_approved',
  rejected: 'sub_rejected', completed: 'sub_completed',
}
const subStatusFromDb: Record<string, string> = {
  sub_pending: 'pending', sub_approved: 'approved',
  sub_rejected: 'rejected', sub_completed: 'completed',
}

const periodTypeFromDb: Record<string, string> = {
  period_class: 'class', period_break: 'break', period_lunch: 'lunch',
  period_assembly: 'assembly', period_activity: 'activity',
}
const periodTypeToDb: Record<string, string> = {
  class: 'period_class', break: 'period_break', lunch: 'period_lunch',
  assembly: 'period_assembly', activity: 'period_activity',
}

function formatRoom(r: any) {
  return {
    id: r.id,
    name: r.name,
    type: roomTypeFromDb[r.type] || r.type,
    capacity: r.capacity || 0,
    building: r.building || '',
    floor: r.floor,
    facilities: [],
    isAvailable: r.isActive,
    isActive: r.isActive,
  }
}

// Format entry with timetable context for classId/className/sectionId/sectionName
function formatEntry(e: any, timetableContext?: any) {
  const tt = timetableContext || e.timetable
  return {
    id: e.id,
    timetableId: e.timetableId,
    day: e.dayOfWeek,
    dayOfWeek: e.dayOfWeek,
    periodId: e.periodId,
    periodName: e.period?.name,
    periodNumber: e.period?.periodNumber,
    order: e.period?.periodNumber,
    subjectId: e.subjectId,
    subjectName: e.subject?.name || null,
    subjectCode: e.subject?.code || null,
    teacherId: e.teacherId,
    teacherName: e.teacher ? `${e.teacher.firstName} ${e.teacher.lastName}`.trim() : null,
    roomId: e.roomId,
    roomName: e.room?.name || null,
    classId: tt?.classId || tt?.class?.id || null,
    className: tt?.class?.name || tt?.className || null,
    sectionId: tt?.sectionId || tt?.section?.id || null,
    sectionName: tt?.section?.name || tt?.sectionName || null,
  }
}

// Standard entry include with teacher
const entryInclude = {
  period: true,
  subject: { select: { id: true, name: true, code: true } },
  room: { select: { id: true, name: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
}

// ==================== Stats ====================

export async function getStats(schoolId: string) {
  const [
    totalTimetables,
    publishedCount,
    draftCount,
    totalRooms,
    totalSubstitutions,
    pendingSubs,
    totalClasses,
    totalTeachers,
    totalEntries,
    teacherEntries,
  ] = await Promise.all([
    prisma.timetable.count({ where: { organizationId: schoolId } }),
    prisma.timetable.count({ where: { status: 'tt_published', organizationId: schoolId } }),
    prisma.timetable.count({ where: { status: 'tt_draft', organizationId: schoolId } }),
    prisma.room.count({ where: { isActive: true, organizationId: schoolId } }),
    prisma.substitution.count({ where: { organizationId: schoolId } }),
    prisma.substitution.count({ where: { status: 'sub_pending', organizationId: schoolId } }),
    prisma.class.count({ where: { organizationId: schoolId } }),
    prisma.staff.count({ where: { status: 'active', organizationId: schoolId } }),
    prisma.timetableEntry.count({ where: { timetable: { status: 'tt_published', organizationId: schoolId } } }),
    prisma.timetableEntry.groupBy({
      by: ['teacherId'],
      where: { teacherId: { not: null }, timetable: { status: 'tt_published', organizationId: schoolId } },
      _count: true,
    }),
  ])

  const uniqueTeachersWithEntries = teacherEntries.length
  const totalTeacherEntries = teacherEntries.reduce((sum, t) => sum + t._count, 0)
  const avgPeriodsPerTeacher = uniqueTeachersWithEntries > 0
    ? Math.round(totalTeacherEntries / uniqueTeachersWithEntries)
    : 0

  // Room utilization: entries using rooms / (rooms * days * periods)
  const totalPeriods = await prisma.periodDefinition.count({ where: { isActive: true, organizationId: schoolId } })
  const maxSlots = totalRooms * 6 * totalPeriods // 6 working days
  const roomUtilization = maxSlots > 0
    ? Math.round((totalEntries / maxSlots) * 100)
    : 0

  return {
    data: {
      totalClasses,
      totalTimetables,
      publishedTimetables: publishedCount,
      draftTimetables: draftCount,
      totalTeachers,
      avgPeriodsPerTeacher,
      totalRooms,
      totalSubstitutions,
      pendingSubstitutions: pendingSubs,
      roomUtilization,
    },
  }
}

// ==================== Period Definitions ====================

export async function getPeriodDefinitions(schoolId: string) {
  const periods = await prisma.periodDefinition.findMany({
    where: { organizationId: schoolId },
    orderBy: { periodNumber: 'asc' },
  })
  return {
    data: periods.map(p => ({
      id: p.id,
      name: p.name,
      order: p.periodNumber,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      type: periodTypeFromDb[p.type] || p.type,
      isActive: p.isActive,
    })),
  }
}

export async function updatePeriodDefinition(schoolId: string, id: string, input: UpdatePeriodDefInput) {
  const existing = await prisma.periodDefinition.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Period definition not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.startTime !== undefined) data.startTime = input.startTime
  if (input.endTime !== undefined) data.endTime = input.endTime
  if (input.type !== undefined) data.type = periodTypeToDb[input.type] || input.type
  if (input.isActive !== undefined) data.isActive = input.isActive

  const updated = await prisma.periodDefinition.update({ where: { id }, data })
  return {
    data: {
      id: updated.id,
      name: updated.name,
      order: updated.periodNumber,
      periodNumber: updated.periodNumber,
      startTime: updated.startTime,
      endTime: updated.endTime,
      type: periodTypeFromDb[updated.type] || updated.type,
      isActive: updated.isActive,
    },
  }
}

// ==================== Subjects ====================

export async function getSubjects(schoolId: string) {
  const subjects = await prisma.subject.findMany({
    where: { organizationId: schoolId },
    orderBy: { name: 'asc' },
  })
  return {
    data: subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      type: s.type,
      color: '',
      weeklyPeriods: 0,
    })),
  }
}

// ==================== Rooms ====================

export async function listRooms(schoolId: string) {
  const rooms = await prisma.room.findMany({ where: { organizationId: schoolId }, orderBy: { name: 'asc' } })
  return { data: rooms.map(formatRoom) }
}

export async function createRoom(schoolId: string, input: CreateRoomInput) {
  const existing = await prisma.room.findFirst({ where: { name: input.name, organizationId: schoolId } })
  if (existing) throw AppError.conflict(`Room '${input.name}' already exists`)

  const room = await prisma.room.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      type: input.type ? (roomTypeToDb[input.type] as any) : 'room_classroom',
      capacity: input.capacity || null,
      building: input.building || null,
      floor: input.floor || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    },
  })
  return { data: formatRoom(room) }
}

export async function updateRoom(schoolId: string, id: string, input: UpdateRoomInput) {
  const existing = await prisma.room.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Room not found')

  if (input.name && input.name !== existing.name) {
    const dup = await prisma.room.findFirst({ where: { name: input.name, organizationId: schoolId } })
    if (dup) throw AppError.conflict(`Room '${input.name}' already exists`)
  }

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.type !== undefined) data.type = roomTypeToDb[input.type] || input.type
  if (input.capacity !== undefined) data.capacity = input.capacity
  if (input.building !== undefined) data.building = input.building
  if (input.floor !== undefined) data.floor = input.floor
  if (input.isActive !== undefined) data.isActive = input.isActive

  const updated = await prisma.room.update({ where: { id }, data })
  return { data: formatRoom(updated) }
}

export async function deleteRoom(schoolId: string, id: string) {
  const existing = await prisma.room.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Room not found')

  await prisma.room.delete({ where: { id } })
  return { message: 'Room deleted successfully' }
}

// ==================== Timetables ====================

function formatTimetable(t: any, entries?: any[]) {
  return {
    id: t.id,
    name: `${t.class?.name || t.className || ''} ${t.section?.name || t.sectionName || ''}`.trim(),
    classId: t.classId,
    className: t.class?.name || t.className || '',
    sectionId: t.sectionId,
    sectionName: t.section?.name || t.sectionName || '',
    academicYear: t.academicYear?.name || t.academicYearName || '',
    academicYearId: t.academicYearId,
    academicYearName: t.academicYear?.name || t.academicYearName || '',
    term: '',
    effectiveFrom: t.effectiveFrom,
    effectiveTo: null,
    status: ttStatusFromDb[t.status] || t.status,
    entries: entries || [],
    entryCount: t._count?.entries,
    createdBy: '',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt || t.createdAt,
  }
}

export async function listTimetables(schoolId: string, input: ListTimetablesInput) {
  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { organizationId: schoolId }
  if (input.classId) where.classId = input.classId
  if (input.sectionId) where.sectionId = input.sectionId
  if (input.status) where.status = ttStatusToDb[input.status] || input.status

  const [timetables, total] = await Promise.all([
    prisma.timetable.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.timetable.count({ where }),
  ])

  return {
    data: timetables.map(t => formatTimetable(t)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function createTimetable(schoolId: string, input: CreateTimetableInput) {
  // Validate references
  const cls = await prisma.class.findFirst({ where: { id: input.classId, organizationId: schoolId } })
  if (!cls) throw AppError.notFound('Class not found')
  const section = await prisma.section.findFirst({ where: { id: input.sectionId, organizationId: schoolId } })
  if (!section) throw AppError.notFound('Section not found')
  const ay = await prisma.academicYear.findFirst({ where: { id: input.academicYearId, organizationId: schoolId } })
  if (!ay) throw AppError.notFound('Academic year not found')

  // Check unique
  const existing = await prisma.timetable.findUnique({
    where: {
      classId_sectionId_academicYearId: {
        classId: input.classId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId,
      },
    },
  })
  if (existing) throw AppError.conflict('Timetable already exists for this class/section/academic year')

  const timetable = await prisma.timetable.create({
    data: {
      organizationId: schoolId,
      classId: input.classId,
      sectionId: input.sectionId,
      academicYearId: input.academicYearId,
      effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
      status: 'tt_draft',
    },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      academicYear: { select: { id: true, name: true } },
    },
  })

  return { data: formatTimetable(timetable, []) }
}

export async function getTimetable(schoolId: string, id: string) {
  const timetable = await prisma.timetable.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      academicYear: { select: { id: true, name: true } },
      entries: {
        include: entryInclude,
        orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
      },
    },
  })
  if (!timetable) throw AppError.notFound('Timetable not found')

  const entries = timetable.entries.map(e => formatEntry(e, timetable))
  return { data: formatTimetable(timetable, entries) }
}

export async function updateTimetable(schoolId: string, id: string, input: UpdateTimetableInput) {
  const existing = await prisma.timetable.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Timetable not found')

  const data: any = {}
  if (input.effectiveFrom !== undefined) data.effectiveFrom = input.effectiveFrom ? new Date(input.effectiveFrom) : null
  if (input.status !== undefined) data.status = ttStatusToDb[input.status] || input.status

  await prisma.timetable.update({ where: { id }, data })
  return getTimetable(schoolId, id)
}

export async function publishTimetable(schoolId: string, id: string) {
  const timetable = await prisma.timetable.findFirst({ where: { id, organizationId: schoolId } })
  if (!timetable) throw AppError.notFound('Timetable not found')

  // Archive previously published timetable for same class/section/year
  await prisma.timetable.updateMany({
    where: {
      organizationId: schoolId,
      classId: timetable.classId,
      sectionId: timetable.sectionId,
      academicYearId: timetable.academicYearId,
      status: 'tt_published',
      id: { not: id },
    },
    data: { status: 'tt_archived' },
  })

  await prisma.timetable.update({
    where: { id },
    data: { status: 'tt_published' },
  })

  return getTimetable(schoolId, id)
}

// ==================== Timetable Entries ====================

export async function addEntry(schoolId: string, timetableId: string, input: AddEntryInput) {
  const timetable = await prisma.timetable.findFirst({
    where: { id: timetableId, organizationId: schoolId },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  })
  if (!timetable) throw AppError.notFound('Timetable not found')
  if (timetable.status !== 'tt_draft') {
    throw AppError.badRequest('Can only add entries to draft timetables')
  }

  // Accept both 'day' and 'dayOfWeek' from frontend
  const dayOfWeek = (input as any).day || input.dayOfWeek

  // Check teacher conflict (same day+period in any timetable)
  if (input.teacherId) {
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        teacherId: input.teacherId,
        dayOfWeek: dayOfWeek as any,
        periodId: input.periodId,
        timetableId: { not: timetableId },
      },
    })
    if (teacherConflict) {
      throw AppError.conflict('Teacher is already assigned to another class at this time')
    }
  }

  // Check room conflict (same day+period in published timetables)
  if (input.roomId) {
    const roomConflict = await prisma.timetableEntry.findFirst({
      where: {
        roomId: input.roomId,
        dayOfWeek: dayOfWeek as any,
        periodId: input.periodId,
        timetable: { status: 'tt_published' },
        timetableId: { not: timetableId },
      },
    })
    if (roomConflict) {
      throw AppError.conflict('Room is already booked at this time')
    }
  }

  const entry = await prisma.timetableEntry.upsert({
    where: {
      timetableId_dayOfWeek_periodId: {
        timetableId,
        dayOfWeek: dayOfWeek as any,
        periodId: input.periodId,
      },
    },
    create: {
      timetableId,
      dayOfWeek: dayOfWeek as any,
      periodId: input.periodId,
      subjectId: input.subjectId || null,
      teacherId: input.teacherId || null,
      roomId: input.roomId || null,
    },
    update: {
      subjectId: input.subjectId || null,
      teacherId: input.teacherId || null,
      roomId: input.roomId || null,
    },
    include: entryInclude,
  })

  return { data: formatEntry(entry, timetable) }
}

export async function deleteEntry(schoolId: string, entryId: string) {
  const entry = await prisma.timetableEntry.findFirst({
    where: { id: entryId, timetable: { organizationId: schoolId } },
    include: { timetable: true },
  })
  if (!entry) throw AppError.notFound('Entry not found')
  if (entry.timetable.status !== 'tt_draft') {
    throw AppError.badRequest('Can only delete entries from draft timetables')
  }

  await prisma.timetableEntry.delete({ where: { id: entryId } })
  return { success: true, message: 'Entry deleted successfully' }
}

// ==================== Teacher/Room Views ====================

export async function getTeacherTimetable(schoolId: string, teacherId: string) {
  const teacher = await prisma.staff.findFirst({
    where: { id: teacherId, organizationId: schoolId },
    include: { department: true },
  })

  const entries = await prisma.timetableEntry.findMany({
    where: {
      teacherId,
      timetable: { status: 'tt_published', organizationId: schoolId },
    },
    include: {
      ...entryInclude,
      timetable: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
  })

  const formattedEntries = entries.map(e => formatEntry(e, e.timetable))

  // Compute free periods per day
  const totalPeriods = await prisma.periodDefinition.count({
    where: { isActive: true, type: 'period_class', organizationId: schoolId },
  })
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const freePeriodsPerDay: Record<string, number> = {}
  for (const day of days) {
    const dayEntries = formattedEntries.filter(e => e.day === day)
    freePeriodsPerDay[day] = Math.max(0, totalPeriods - dayEntries.length)
  }

  return {
    data: {
      teacherId,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : '',
      department: teacher?.department?.name || '',
      entries: formattedEntries,
      totalPeriods: formattedEntries.length,
      freePeriodsPerDay,
    },
  }
}

export async function getRoomTimetable(schoolId: string, roomId: string) {
  const room = await prisma.room.findFirst({ where: { id: roomId, organizationId: schoolId } })
  if (!room) throw AppError.notFound('Room not found')

  const entries = await prisma.timetableEntry.findMany({
    where: {
      roomId,
      timetable: { status: 'tt_published', organizationId: schoolId },
    },
    include: {
      ...entryInclude,
      timetable: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
  })

  const formattedEntries = entries.map(e => formatEntry(e, e.timetable))

  // Compute utilization
  const totalPeriods = await prisma.periodDefinition.count({ where: { isActive: true, organizationId: schoolId } })
  const maxSlots = 6 * totalPeriods // 6 working days
  const utilizationPercent = maxSlots > 0
    ? Math.round((entries.length / maxSlots) * 100)
    : 0

  return {
    data: {
      roomId: room.id,
      roomName: room.name,
      entries: formattedEntries,
      utilizationPercent,
    },
  }
}

// ==================== Substitutions ====================

function formatSubstitution(s: any) {
  return {
    id: s.id,
    date: s.date,
    timetableEntryId: s.timetableEntryId,
    periodId: s.timetableEntry?.periodId || null,
    periodName: s.timetableEntry?.period?.name || null,
    periodNumber: s.timetableEntry?.period?.periodNumber || null,
    originalTeacherId: s.originalTeacherId,
    originalTeacherName: s.originalTeacher
      ? `${s.originalTeacher.firstName} ${s.originalTeacher.lastName}`.trim()
      : null,
    substituteTeacherId: s.substituteTeacherId,
    substituteTeacherName: s.substituteTeacher
      ? `${s.substituteTeacher.firstName} ${s.substituteTeacher.lastName}`.trim()
      : null,
    classId: s.timetableEntry?.timetable?.classId || null,
    className: s.timetableEntry?.timetable?.class?.name || null,
    sectionId: s.timetableEntry?.timetable?.sectionId || null,
    sectionName: s.timetableEntry?.timetable?.section?.name || null,
    subjectId: s.timetableEntry?.subjectId || null,
    subjectName: s.timetableEntry?.subject?.name || null,
    reason: s.reason,
    status: subStatusFromDb[s.status] || s.status,
    approvedBy: s.approvedBy,
    approvedAt: s.approvedAt,
    createdBy: '',
    createdAt: s.createdAt,
  }
}

const substitutionInclude = {
  timetableEntry: {
    include: {
      timetable: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
      period: true,
      subject: { select: { id: true, name: true } },
    },
  },
  originalTeacher: { select: { id: true, firstName: true, lastName: true } },
  substituteTeacher: { select: { id: true, firstName: true, lastName: true } },
}

export async function listSubstitutions(schoolId: string, input: ListSubstitutionsInput) {
  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { organizationId: schoolId }
  if (input.date) where.date = new Date(input.date)
  if (input.status) where.status = subStatusToDb[input.status] || input.status

  const [subs, total] = await Promise.all([
    prisma.substitution.findMany({
      where,
      include: substitutionInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.substitution.count({ where }),
  ])

  return {
    data: subs.map(formatSubstitution),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function createSubstitution(schoolId: string, input: CreateSubstitutionInput) {
  const entry = await prisma.timetableEntry.findFirst({
    where: { id: input.timetableEntryId, timetable: { organizationId: schoolId } },
  })
  if (!entry) throw AppError.notFound('Timetable entry not found')

  const sub = await prisma.substitution.create({
    data: {
      organizationId: schoolId,
      date: new Date(input.date),
      timetableEntryId: input.timetableEntryId,
      originalTeacherId: input.originalTeacherId || entry.teacherId,
      substituteTeacherId: input.substituteTeacherId || null,
      reason: input.reason || null,
      status: 'sub_pending',
    },
    include: substitutionInclude,
  })

  return { data: formatSubstitution(sub) }
}

export async function approveSubstitution(schoolId: string, id: string, approvedBy: string) {
  const sub = await prisma.substitution.findFirst({ where: { id, organizationId: schoolId } })
  if (!sub) throw AppError.notFound('Substitution not found')
  if (sub.status !== 'sub_pending') throw AppError.badRequest('Can only approve pending substitutions')

  const updated = await prisma.substitution.update({
    where: { id },
    data: {
      status: 'sub_approved',
      approvedBy,
      approvedAt: new Date(),
    },
    include: substitutionInclude,
  })

  return { data: formatSubstitution(updated) }
}

export async function rejectSubstitution(schoolId: string, id: string, approvedBy: string) {
  const sub = await prisma.substitution.findFirst({ where: { id, organizationId: schoolId } })
  if (!sub) throw AppError.notFound('Substitution not found')
  if (sub.status !== 'sub_pending') throw AppError.badRequest('Can only reject pending substitutions')

  const updated = await prisma.substitution.update({
    where: { id },
    data: {
      status: 'sub_rejected',
      approvedBy,
      approvedAt: new Date(),
    },
    include: substitutionInclude,
  })

  return { data: formatSubstitution(updated) }
}

export async function deleteSubstitution(schoolId: string, id: string) {
  const sub = await prisma.substitution.findFirst({ where: { id, organizationId: schoolId } })
  if (!sub) throw AppError.notFound('Substitution not found')

  await prisma.substitution.delete({ where: { id } })
  return { success: true, message: 'Substitution deleted successfully' }
}
