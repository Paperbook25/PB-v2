import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import * as userService from '../services/user.service.js'
import type { CreateUserInput, UpdateUserInput } from '../validators/user.validators.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Access via a school subdomain.')
  }
  return req.schoolId
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listUsers(getSchoolId(req))
    res.json({ data: users })
  } catch (err) {
    next(err)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(String(req.params.id))
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(getSchoolId(req), req.body as CreateUserInput)
    res.status(201).json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(String(req.params.id), req.body as UpdateUserInput)
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.deleteUser(String(req.params.id))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.toggleUserStatus(String(req.params.id))
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function getMyChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) { res.status(404).json({ message: 'User not found' }); return }

    let childUserIds: string[] = []
    if (user.childIds) {
      try { childUserIds = JSON.parse(user.childIds) } catch { childUserIds = [] }
    }

    if (childUserIds.length === 0) {
      res.json({ data: [] })
      return
    }

    // Resolve child user IDs → student records
    const childUsers = await prisma.user.findMany({
      where: { id: { in: childUserIds } },
      select: { studentId: true },
    })
    const studentIds = childUsers.map(u => u.studentId).filter((id): id is string => !!id)

    if (studentIds.length === 0) {
      res.json({ data: [] })
      return
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { admissionNumber: { in: studentIds } },
          { id: { in: studentIds } },
        ],
      },
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
      },
    })

    const children = []
    for (const s of students) {
      // Get attendance summary
      const attendanceRecords = await prisma.studentAttendanceRecord.findMany({
        where: { studentId: s.id },
        select: { status: true },
      })
      const totalDays = attendanceRecords.length
      const presentDays = attendanceRecords.filter(r => r.status === 'att_present').length
      const absentDays = attendanceRecords.filter(r => r.status === 'att_absent').length

      // Get pending fees
      const fees = await prisma.studentFee.findMany({
        where: { studentId: s.id, status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] } },
      })
      const pendingFees = fees.reduce((sum, f) =>
        sum + (Number(f.totalAmount) - Number(f.paidAmount) - Number(f.discountAmount)), 0)

      children.push({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        class: s.class?.name || '',
        section: s.section?.name || '',
        rollNumber: s.rollNumber || 0,
        avatar: s.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`,
        attendance: {
          percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
          presentDays,
          absentDays,
          totalDays,
        },
        pendingFees,
        libraryBooks: 0,
      })
    }

    res.json({ data: children })
  } catch (err) {
    next(err)
  }
}
