import type { Request, Response, NextFunction } from 'express'
import * as admissionService from '../services/admission.service.js'
import { AppError } from '../utils/errors.js'
import {
  listApplicationsSchema, changeStatusSchema, addDocumentSchema,
  updateDocumentSchema, addNoteSchema, updateInterviewSchema,
  updateEntranceExamSchema, createExamScheduleSchema, recordExamScoreSchema,
  sendCommunicationSchema, recordPaymentSchema,
} from '../validators/admission.validators.js'
import type {
  CreateApplicationInput, UpdateApplicationInput, RecordPaymentInput,
} from '../validators/admission.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Admission operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== CRUD ====================

export async function listApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listApplicationsSchema.parse(req.query)
    const result = await admissionService.listApplications(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getStats(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.getApplicationById(getSchoolId(req), String(req.params.id))
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.createApplication(getSchoolId(req), req.body as CreateApplicationInput)
    res.status(201).json({ data: app })
  } catch (err) { next(err) }
}

export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.updateApplication(getSchoolId(req), String(req.params.id), req.body as UpdateApplicationInput)
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const input = changeStatusSchema.parse(req.body)
    const app = await admissionService.changeStatus(getSchoolId(req), String(req.params.id), input, req.user?.name || 'system')
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.deleteApplication(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Documents ====================

export async function addDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addDocumentSchema.parse(req.body)
    const doc = await admissionService.addDocument(getSchoolId(req), String(req.params.id), input)
    res.status(201).json({ data: doc })
  } catch (err) { next(err) }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDocumentSchema.parse(req.body)
    const doc = await admissionService.updateDocument(
      getSchoolId(req), String(req.params.id), String(req.params.docId), input, req.user?.name
    )
    res.json({ data: doc })
  } catch (err) { next(err) }
}

// ==================== Notes ====================

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addNoteSchema.parse(req.body)
    const note = await admissionService.addNote(
      getSchoolId(req), String(req.params.id), input, req.user?.userId || '', req.user?.name || ''
    )
    res.status(201).json({ data: note })
  } catch (err) { next(err) }
}

// ==================== Interview & Entrance Exam ====================

export async function updateInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateInterviewSchema.parse(req.body)
    const app = await admissionService.updateInterview(getSchoolId(req), String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function updateEntranceExam(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateEntranceExamSchema.parse(req.body)
    const app = await admissionService.updateEntranceExam(getSchoolId(req), String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

// ==================== Waitlist & Class Capacity ====================

export async function getWaitlist(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getWaitlist(getSchoolId(req), { class: req.query.class as string })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getClassCapacity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getClassCapacity(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Exam Schedules ====================

export async function listExamSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listExamSchedules(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function createExamSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExamScheduleSchema.parse(req.body)
    const schedule = await admissionService.createExamSchedule(getSchoolId(req), input)
    res.status(201).json({ data: schedule })
  } catch (err) { next(err) }
}

// ==================== Exam Results ====================

export async function getExamResults(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getExamResults(getSchoolId(req), {
      class: req.query.class as string,
      scheduleId: req.query.scheduleId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function recordExamScore(req: Request, res: Response, next: NextFunction) {
  try {
    const input = recordExamScoreSchema.parse(req.body)
    const app = await admissionService.recordExamScore(getSchoolId(req), String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

// ==================== Communications ====================

export async function listCommunications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listCommunications(getSchoolId(req), {
      applicationId: req.query.applicationId as string,
      type: req.query.type as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function listCommunicationTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listCommunicationTemplates(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function sendCommunication(req: Request, res: Response, next: NextFunction) {
  try {
    const input = sendCommunicationSchema.parse(req.body)
    const result = await admissionService.sendCommunication(getSchoolId(req), input, req.user?.name || 'system')
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Payments ====================

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listPayments(getSchoolId(req), {
      status: req.query.status as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getPayment(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const input = recordPaymentSchema.parse(req.body)
    const result = await admissionService.recordPayment(getSchoolId(req), String(req.params.id), input)
    res.json({ data: result })
  } catch (err) { next(err) }
}

// ==================== Analytics & Export ====================

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getAnalytics(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function exportApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.exportApplications(getSchoolId(req), {
      status: req.query.status as string,
      class: req.query.class as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Public Apply ====================

export async function publicApply(req: Request, res: Response, next: NextFunction) {
  try {
    // Public endpoint: schoolId comes from tenant middleware (subdomain), not auth
    const schoolId = req.schoolId
    if (!schoolId) {
      throw AppError.badRequest('No school context. Public apply requires a school subdomain.')
    }
    const result = await admissionService.publicApply(schoolId, req.body as CreateApplicationInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}
