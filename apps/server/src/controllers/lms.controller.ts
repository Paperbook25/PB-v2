import type { Request, Response, NextFunction } from 'express'
import * as lmsService from '../services/lms.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. LMS operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Courses ====================

export async function listCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, status, classId, teacherId } = req.query
    const result = await lmsService.listCourses(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
      classId: classId as string | undefined,
      teacherId: teacherId as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await lmsService.getCourseById(getSchoolId(req), String(req.params.id))
    res.json({ data: course })
  } catch (err) { next(err) }
}

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await lmsService.createCourse(getSchoolId(req), req.body)
    res.status(201).json({ data: course })
  } catch (err) { next(err) }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await lmsService.updateCourse(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: course })
  } catch (err) { next(err) }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await lmsService.deleteCourse(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Lessons ====================

export async function createLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const lesson = await lmsService.createLesson(
      getSchoolId(req),
      String(req.params.courseId),
      req.body
    )
    res.status(201).json({ data: lesson })
  } catch (err) { next(err) }
}

export async function updateLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const lesson = await lmsService.updateLesson(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: lesson })
  } catch (err) { next(err) }
}

export async function deleteLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await lmsService.deleteLesson(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Assignments ====================

export async function listAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, courseId, classId, status, teacherId } = req.query
    const result = await lmsService.listAssignments(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      courseId: courseId as string | undefined,
      classId: classId as string | undefined,
      status: status as string | undefined,
      teacherId: teacherId as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await lmsService.getAssignmentById(getSchoolId(req), String(req.params.id))
    res.json({ data: assignment })
  } catch (err) { next(err) }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await lmsService.createAssignment(getSchoolId(req), req.body)
    res.status(201).json({ data: assignment })
  } catch (err) { next(err) }
}

export async function updateAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await lmsService.updateAssignment(
      getSchoolId(req),
      String(req.params.id),
      req.body
    )
    res.json({ data: assignment })
  } catch (err) { next(err) }
}

export async function deleteAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await lmsService.deleteAssignment(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Submissions ====================

export async function submitAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await lmsService.submitAssignment(
      getSchoolId(req),
      String(req.params.assignmentId),
      req.body
    )
    res.status(201).json({ data: submission })
  } catch (err) { next(err) }
}

export async function gradeSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await lmsService.gradeSubmission(
      getSchoolId(req),
      String(req.params.id),
      req.body
    )
    res.json({ data: submission })
  } catch (err) { next(err) }
}

// ==================== Stats ====================

export async function getLmsStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await lmsService.getLmsStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
