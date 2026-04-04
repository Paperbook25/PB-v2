import type { Request, Response, NextFunction } from 'express'
import * as libraryService from '../services/library.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Library operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Books ====================

export async function listBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, category, status } = req.query
    const result = await libraryService.listBooks(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      status: status as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getBook(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await libraryService.getBookById(getSchoolId(req), String(req.params.id))
    res.json({ data: book })
  } catch (err) { next(err) }
}

export async function createBook(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await libraryService.createBook(getSchoolId(req), req.body)
    res.status(201).json({ data: book })
  } catch (err) { next(err) }
}

export async function updateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await libraryService.updateBook(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: book })
  } catch (err) { next(err) }
}

export async function deleteBook(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await libraryService.deleteBook(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Issues ====================

export async function issueBook(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await libraryService.issueBook(getSchoolId(req), req.body)
    res.status(201).json({ data: issue })
  } catch (err) { next(err) }
}

export async function returnBook(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await libraryService.returnBook(getSchoolId(req), String(req.params.id))
    res.json({ data: issue })
  } catch (err) { next(err) }
}

export async function listIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, borrowerId, bookId } = req.query
    const result = await libraryService.listIssues(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      borrowerId: borrowerId as string | undefined,
      bookId: bookId as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getOverdueBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await libraryService.getOverdueBooks(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getLibraryStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await libraryService.getLibraryStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}

// ==================== Fines ====================

export async function listFines(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, borrowerId } = req.query
    const result = await libraryService.listFines(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      borrowerId: borrowerId as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function updateFine(req: Request, res: Response, next: NextFunction) {
  try {
    const fine = await libraryService.updateFine(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: fine })
  } catch (err) { next(err) }
}

export async function deleteFine(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await libraryService.deleteFine(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Reservations ====================

export async function listReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, studentId, bookId } = req.query
    const result = await libraryService.listReservations(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      studentId: studentId as string | undefined,
      bookId: bookId as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function createReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await libraryService.createReservation(getSchoolId(req), req.body)
    res.status(201).json({ data: reservation })
  } catch (err) { next(err) }
}

export async function cancelReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await libraryService.cancelReservation(getSchoolId(req), String(req.params.id))
    res.json({ data: reservation })
  } catch (err) { next(err) }
}

// ==================== Renewal ====================

export async function renewBook(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await libraryService.renewBook(getSchoolId(req), String(req.params.id), req.body ?? {})
    res.json({ data: issue })
  } catch (err) { next(err) }
}

// ==================== Available Students ====================

export async function getAvailableStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, limit } = req.query
    const data = await libraryService.getAvailableStudents(getSchoolId(req), {
      search: search as string | undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
}
