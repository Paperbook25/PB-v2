import type { Request, Response, NextFunction } from 'express'
import * as timetableService from '../services/timetable.service.js'
import { listTimetablesSchema, listSubstitutionsSchema } from '../validators/timetable.validators.js'
import type {
  CreateRoomInput, UpdateRoomInput, CreateTimetableInput, UpdateTimetableInput,
  AddEntryInput, CreateSubstitutionInput, UpdatePeriodDefInput,
} from '../validators/timetable.validators.js'
import { AppError } from '../utils/errors.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) throw AppError.badRequest('No school context.')
  return req.schoolId
}

// ==================== Stats ====================

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getStats(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Period Definitions ====================

export async function getPeriodDefinitions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getPeriodDefinitions(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function updatePeriodDefinition(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updatePeriodDefinition(
      getSchoolId(req), String(req.params.id), req.body as UpdatePeriodDefInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Subjects ====================

export async function getSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getSubjects(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Rooms ====================

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.listRooms(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createRoom(getSchoolId(req), req.body as CreateRoomInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updateRoom(getSchoolId(req), String(req.params.id), req.body as UpdateRoomInput)
    res.json(result)
  } catch (err) { next(err) }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteRoom(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Timetables ====================

export async function listTimetables(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listTimetablesSchema.parse(req.query)
    const result = await timetableService.listTimetables(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createTimetable(getSchoolId(req), req.body as CreateTimetableInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getTimetable(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function updateTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updateTimetable(
      getSchoolId(req), String(req.params.id), req.body as UpdateTimetableInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function publishTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.publishTimetable(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function addEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.addEntry(getSchoolId(req), String(req.params.id), req.body as AddEntryInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function deleteEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteEntry(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Teacher/Room Views ====================

export async function getTeacherTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getTeacherTimetable(getSchoolId(req), String(req.params.teacherId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getRoomTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getRoomTimetable(getSchoolId(req), String(req.params.roomId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Substitutions ====================

export async function listSubstitutions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listSubstitutionsSchema.parse(req.query)
    const result = await timetableService.listSubstitutions(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createSubstitution(getSchoolId(req), req.body as CreateSubstitutionInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function approveSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await timetableService.approveSubstitution(getSchoolId(req), String(req.params.id), approvedBy)
    res.json(result)
  } catch (err) { next(err) }
}

export async function rejectSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await timetableService.rejectSubstitution(getSchoolId(req), String(req.params.id), approvedBy)
    res.json(result)
  } catch (err) { next(err) }
}

export async function deleteSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteSubstitution(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
