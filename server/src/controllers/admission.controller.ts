import type { Request, Response, NextFunction } from 'express'
import * as admissionService from '../services/admission.service.js'
import {
  listApplicationsSchema, changeStatusSchema, addDocumentSchema,
  updateDocumentSchema, addNoteSchema, updateInterviewSchema,
  updateEntranceExamSchema, createExamScheduleSchema, recordExamScoreSchema,
  sendCommunicationSchema, recordPaymentSchema,
} from '../validators/admission.validators.js'
import type {
  CreateApplicationInput, UpdateApplicationInput, RecordPaymentInput,
} from '../validators/admission.validators.js'

// ==================== CRUD ====================

export async function listApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listApplicationsSchema.parse(req.query)
    const result = await admissionService.listApplications(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getStats()
    res.json(result)
  } catch (err) { next(err) }
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.getApplicationById(String(req.params.id))
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.createApplication(req.body as CreateApplicationInput)
    res.status(201).json({ data: app })
  } catch (err) { next(err) }
}

export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await admissionService.updateApplication(String(req.params.id), req.body as UpdateApplicationInput)
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const input = changeStatusSchema.parse(req.body)
    const app = await admissionService.changeStatus(String(req.params.id), input, req.user?.name || 'system')
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.deleteApplication(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Documents ====================

export async function addDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addDocumentSchema.parse(req.body)
    const doc = await admissionService.addDocument(String(req.params.id), input)
    res.status(201).json({ data: doc })
  } catch (err) { next(err) }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDocumentSchema.parse(req.body)
    const doc = await admissionService.updateDocument(
      String(req.params.id), String(req.params.docId), input, req.user?.name
    )
    res.json({ data: doc })
  } catch (err) { next(err) }
}

// ==================== Notes ====================

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addNoteSchema.parse(req.body)
    const note = await admissionService.addNote(
      String(req.params.id), input, req.user?.userId || '', req.user?.name || ''
    )
    res.status(201).json({ data: note })
  } catch (err) { next(err) }
}

// ==================== Interview & Entrance Exam ====================

export async function updateInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateInterviewSchema.parse(req.body)
    const app = await admissionService.updateInterview(String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

export async function updateEntranceExam(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateEntranceExamSchema.parse(req.body)
    const app = await admissionService.updateEntranceExam(String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

// ==================== Waitlist & Class Capacity ====================

export async function getWaitlist(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getWaitlist({ class: req.query.class as string })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getClassCapacity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getClassCapacity()
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Exam Schedules ====================

export async function listExamSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listExamSchedules()
    res.json(result)
  } catch (err) { next(err) }
}

export async function createExamSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExamScheduleSchema.parse(req.body)
    const schedule = await admissionService.createExamSchedule(input)
    res.status(201).json({ data: schedule })
  } catch (err) { next(err) }
}

// ==================== Exam Results ====================

export async function getExamResults(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getExamResults({
      class: req.query.class as string,
      scheduleId: req.query.scheduleId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function recordExamScore(req: Request, res: Response, next: NextFunction) {
  try {
    const input = recordExamScoreSchema.parse(req.body)
    const app = await admissionService.recordExamScore(String(req.params.id), input)
    res.json({ data: app })
  } catch (err) { next(err) }
}

// ==================== Communications ====================

export async function listCommunications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listCommunications({
      applicationId: req.query.applicationId as string,
      type: req.query.type as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function listCommunicationTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listCommunicationTemplates()
    res.json(result)
  } catch (err) { next(err) }
}

export async function sendCommunication(req: Request, res: Response, next: NextFunction) {
  try {
    const input = sendCommunicationSchema.parse(req.body)
    const result = await admissionService.sendCommunication(input, req.user?.name || 'system')
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Payments ====================

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.listPayments({
      status: req.query.status as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getPayment(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const input = recordPaymentSchema.parse(req.body)
    const result = await admissionService.recordPayment(String(req.params.id), input)
    res.json({ data: result })
  } catch (err) { next(err) }
}

// ==================== Analytics & Export ====================

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.getAnalytics()
    res.json(result)
  } catch (err) { next(err) }
}

export async function exportApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.exportApplications({
      status: req.query.status as string,
      class: req.query.class as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Public Apply ====================

export async function publicApply(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admissionService.publicApply(req.body as CreateApplicationInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}
