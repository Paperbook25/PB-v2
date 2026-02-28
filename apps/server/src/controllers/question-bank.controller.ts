import type { Request, Response, NextFunction } from 'express'
import * as qbService from '../services/question-bank.service.js'
import {
  listQuestionsSchema, importQuestionsSchema, listOnlineExamsSchema,
  startAttemptSchema, submitAttemptSchema, reportViolationSchema,
} from '../validators/question-bank.validators.js'
import type {
  CreateQuestionInput, UpdateQuestionInput,
  CreateOnlineExamInput, UpdateOnlineExamInput,
} from '../validators/question-bank.validators.js'

// ==================== Questions ====================

export async function listQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listQuestionsSchema.parse(req.query)
    const result = await qbService.listQuestions(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getQuestionStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await qbService.getQuestionStats()
    res.json(result)
  } catch (err) { next(err) }
}

export async function getQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await qbService.getQuestionById(String(req.params.id))
    res.json({ data: q })
  } catch (err) { next(err) }
}

export async function createQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await qbService.createQuestion(req.body as CreateQuestionInput, req.user?.name || 'system')
    res.status(201).json({ data: q })
  } catch (err) { next(err) }
}

export async function updateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await qbService.updateQuestion(String(req.params.id), req.body as UpdateQuestionInput)
    res.json({ data: q })
  } catch (err) { next(err) }
}

export async function deleteQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await qbService.deleteQuestion(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function importQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const input = importQuestionsSchema.parse(req.body)
    const result = await qbService.importQuestions(input, req.user?.name || 'system')
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Online Exams ====================

export async function listOnlineExams(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listOnlineExamsSchema.parse(req.query)
    const result = await qbService.listOnlineExams(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getOnlineExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await qbService.getOnlineExamById(String(req.params.id))
    res.json({ data: exam })
  } catch (err) { next(err) }
}

export async function createOnlineExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await qbService.createOnlineExam(req.body as CreateOnlineExamInput, req.user?.name || 'system')
    res.status(201).json({ data: exam })
  } catch (err) { next(err) }
}

export async function updateOnlineExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await qbService.updateOnlineExam(String(req.params.id), req.body as UpdateOnlineExamInput)
    res.json({ data: exam })
  } catch (err) { next(err) }
}

export async function deleteOnlineExam(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await qbService.deleteOnlineExam(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function startAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const input = startAttemptSchema.parse(req.body)
    const result = await qbService.startAttempt(String(req.params.id), input)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function submitAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitAttemptSchema.parse(req.body)
    const result = await qbService.submitAttempt(String(req.params.id), input)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await qbService.getAttempts(String(req.params.id), {
      studentId: req.query.studentId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function reportViolation(req: Request, res: Response, next: NextFunction) {
  try {
    const input = reportViolationSchema.parse(req.body)
    const result = await qbService.reportViolation(String(req.params.id), input)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyAttempts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await qbService.getMyAttempts(req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
}
