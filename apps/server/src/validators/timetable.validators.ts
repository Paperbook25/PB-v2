import { z } from 'zod'

const dayOfWeekEnum = z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
const roomTypeEnum = z.enum(['classroom', 'lab', 'library', 'auditorium', 'sports'])
const timetableStatusEnum = z.enum(['draft', 'published', 'archived'])

// ==================== Rooms ====================

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  type: roomTypeEnum.optional(),
  capacity: z.number().int().positive().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  type: roomTypeEnum.optional(),
  capacity: z.number().int().positive().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>

// ==================== Timetable ====================

export const createTimetableSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  academicYearId: z.string().uuid('Invalid academic year ID'),
  effectiveFrom: z.string().optional(),
})

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>

export const updateTimetableSchema = z.object({
  effectiveFrom: z.string().optional(),
  status: timetableStatusEnum.optional(),
})

export type UpdateTimetableInput = z.infer<typeof updateTimetableSchema>

export const listTimetablesSchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  status: timetableStatusEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type ListTimetablesInput = z.infer<typeof listTimetablesSchema>

// ==================== Timetable Entries ====================

export const addEntrySchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  periodId: z.string().uuid('Invalid period ID'),
  subjectId: z.string().uuid().optional().nullable(),
  teacherId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
})

export type AddEntryInput = z.infer<typeof addEntrySchema>

// ==================== Substitutions ====================

export const createSubstitutionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  timetableEntryId: z.string().uuid('Invalid timetable entry ID'),
  originalTeacherId: z.string().uuid().optional(),
  substituteTeacherId: z.string().uuid().optional(),
  reason: z.string().optional(),
})

export type CreateSubstitutionInput = z.infer<typeof createSubstitutionSchema>

export const listSubstitutionsSchema = z.object({
  date: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type ListSubstitutionsInput = z.infer<typeof listSubstitutionsSchema>

// ==================== Period Definition ====================

export const updatePeriodDefSchema = z.object({
  name: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(['class', 'break', 'lunch', 'assembly', 'activity']).optional(),
  isActive: z.boolean().optional(),
})

export type UpdatePeriodDefInput = z.infer<typeof updatePeriodDefSchema>
