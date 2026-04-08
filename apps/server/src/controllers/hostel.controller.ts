import type { Request, Response, NextFunction } from 'express'
import * as hostelService from '../services/hostel.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Hostel operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Rooms ====================

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, block, roomType, search } = req.query
    const result = await hostelService.listRooms(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      block: block as string | undefined,
      roomType: roomType as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await hostelService.getRoomById(getSchoolId(req), String(req.params.id))
    res.json({ data: room })
  } catch (err) { next(err) }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await hostelService.createRoom(getSchoolId(req), req.body)
    res.status(201).json({ data: room })
  } catch (err) { next(err) }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await hostelService.updateRoom(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: room })
  } catch (err) { next(err) }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await hostelService.deleteRoom(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Allocations ====================

export async function listAllocations(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, roomId, search } = req.query
    const result = await hostelService.listAllocations(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      roomId: roomId as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function allocateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const allocation = await hostelService.allocateStudent(getSchoolId(req), req.body)
    res.status(201).json({ data: allocation })
  } catch (err) { next(err) }
}

export async function vacateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const allocation = await hostelService.vacateStudent(getSchoolId(req), String(req.params.id))
    res.json({ data: allocation })
  } catch (err) { next(err) }
}

// ==================== Eligible Students ====================

export async function getEligibleStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../config/db.js')
    // Get student IDs already allocated
    const allocated = await prisma.hostelAllocation.findMany({
      where: { organizationId: getSchoolId(req), status: 'active' },
      select: { studentId: true },
    })
    const allocatedIds = new Set(allocated.map((a) => a.studentId))

    const students = await prisma.student.findMany({
      where: { organizationId: getSchoolId(req), status: 'active' },
      select: { id: true, firstName: true, lastName: true, admissionNumber: true, classId: true },
      orderBy: { firstName: 'asc' },
    })

    res.json({ data: students.filter((s) => !allocatedIds.has(s.id)) })
  } catch (err) { next(err) }
}

// ==================== Stats ====================

export async function getHostelStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await hostelService.getHostelStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
