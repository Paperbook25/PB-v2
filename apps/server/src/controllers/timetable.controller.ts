import type { Request, Response, NextFunction } from 'express'
import * as timetableService from '../services/timetable.service.js'
import { listTimetablesSchema, listSubstitutionsSchema } from '../validators/timetable.validators.js'
import type {
  CreateRoomInput, UpdateRoomInput, CreateTimetableInput, UpdateTimetableInput,
  AddEntryInput, CreateSubstitutionInput, UpdatePeriodDefInput,
} from '../validators/timetable.validators.js'

// ==================== Stats ====================

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getStats()
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Period Definitions ====================

export async function getPeriodDefinitions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getPeriodDefinitions()
    res.json(result)
  } catch (err) { next(err) }
}

export async function updatePeriodDefinition(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updatePeriodDefinition(
      String(req.params.id), req.body as UpdatePeriodDefInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Subjects ====================

export async function getSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getSubjects()
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Rooms ====================

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.listRooms()
    res.json(result)
  } catch (err) { next(err) }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createRoom(req.body as CreateRoomInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updateRoom(String(req.params.id), req.body as UpdateRoomInput)
    res.json(result)
  } catch (err) { next(err) }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteRoom(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Timetables ====================

export async function listTimetables(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listTimetablesSchema.parse(req.query)
    const result = await timetableService.listTimetables(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createTimetable(req.body as CreateTimetableInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getTimetable(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function updateTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.updateTimetable(
      String(req.params.id), req.body as UpdateTimetableInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function publishTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.publishTimetable(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function addEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.addEntry(String(req.params.id), req.body as AddEntryInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function deleteEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteEntry(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Teacher/Room Views ====================

export async function getTeacherTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getTeacherTimetable(String(req.params.teacherId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getRoomTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.getRoomTimetable(String(req.params.roomId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Substitutions ====================

export async function listSubstitutions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listSubstitutionsSchema.parse(req.query)
    const result = await timetableService.listSubstitutions(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.createSubstitution(req.body as CreateSubstitutionInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function approveSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await timetableService.approveSubstitution(String(req.params.id), approvedBy)
    res.json(result)
  } catch (err) { next(err) }
}

export async function rejectSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await timetableService.rejectSubstitution(String(req.params.id), approvedBy)
    res.json(result)
  } catch (err) { next(err) }
}

export async function deleteSubstitution(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timetableService.deleteSubstitution(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
