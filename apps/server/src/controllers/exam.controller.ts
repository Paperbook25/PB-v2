import type { Request, Response, NextFunction } from 'express'
import * as examService from '../services/exam.service.js'
import {
  listExamsSchema, submitMarksSchema, createGradeScaleSchema, updateGradeScaleSchema,
  generateReportCardsSchema, createExamSlotSchema, listCoScholasticSchema,
  submitCoScholasticSchema, createQuestionPaperSchema,
} from '../validators/exam.validators.js'
import type { CreateExamInput, UpdateExamInput } from '../validators/exam.validators.js'

// ==================== Exam CRUD ====================

export async function listExams(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listExamsSchema.parse(req.query)
    const result = await examService.listExams(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await examService.getExamById(String(req.params.id))
    res.json({ data: exam })
  } catch (err) { next(err) }
}

export async function createExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await examService.createExam(req.body as CreateExamInput)
    res.status(201).json({ data: exam })
  } catch (err) { next(err) }
}

export async function updateExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await examService.updateExam(String(req.params.id), req.body as UpdateExamInput)
    res.json({ data: exam })
  } catch (err) { next(err) }
}

export async function deleteExam(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.deleteExam(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function publishExam(req: Request, res: Response, next: NextFunction) {
  try {
    const exam = await examService.publishExam(String(req.params.id))
    res.json({ data: exam })
  } catch (err) { next(err) }
}

// ==================== Marks ====================

export async function getStudentsForMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getStudentsForMarks(String(req.params.examId), {
      className: req.query.className as string,
      section: req.query.section as string,
      subjectId: req.query.subjectId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getMarks(String(req.params.examId), {
      subjectId: req.query.subjectId as string,
      classId: req.query.classId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function submitMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitMarksSchema.parse(req.body)
    const result = await examService.submitMarks(String(req.params.examId), input)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getStudentMarks(String(req.params.studentId), {
      academicYear: req.query.academicYear as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Report Cards ====================

export async function getReportCards(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getReportCards(String(req.params.examId), {
      classId: req.query.classId as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentReportCard(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getStudentReportCard(String(req.params.studentId), {
      examId: req.query.examId as string,
    })
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function generateReportCards(req: Request, res: Response, next: NextFunction) {
  try {
    const input = generateReportCardsSchema.parse(req.body)
    const result = await examService.generateReportCards(input)
    res.json(result)
  } catch (err) { next(err) }
}

export async function deleteReportCard(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.deleteReportCard(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Grade Scales ====================

export async function listGradeScales(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.listGradeScales()
    res.json(result)
  } catch (err) { next(err) }
}

export async function getGradeScale(req: Request, res: Response, next: NextFunction) {
  try {
    const scale = await examService.getGradeScaleById(String(req.params.id))
    res.json({ data: scale })
  } catch (err) { next(err) }
}

export async function createGradeScale(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createGradeScaleSchema.parse(req.body)
    const scale = await examService.createGradeScale(input)
    res.status(201).json({ data: scale })
  } catch (err) { next(err) }
}

export async function updateGradeScale(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateGradeScaleSchema.parse(req.body)
    const scale = await examService.updateGradeScale(String(req.params.id), input)
    res.json({ data: scale })
  } catch (err) { next(err) }
}

export async function deleteGradeScale(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.deleteGradeScale(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Exam Timetable ====================

export async function getExamTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getExamTimetable(String(req.params.examId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function createExamSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExamSlotSchema.parse(req.body)
    const slot = await examService.createExamSlot(String(req.params.examId), input)
    res.status(201).json({ data: slot })
  } catch (err) { next(err) }
}

// ==================== Analytics & Progress ====================

export async function getExamAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getExamAnalytics(String(req.params.examId), {
      class: req.query.class as string,
      section: req.query.section as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getStudentProgress(String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Co-Scholastic ====================

export async function listCoScholastic(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listCoScholasticSchema.parse(req.query)
    const result = await examService.listCoScholastic(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function submitCoScholastic(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitCoScholasticSchema.parse(req.body)
    const result = await examService.submitCoScholastic(input, req.user?.name || 'system')
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Question Papers ====================

export async function listQuestionPapers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.listQuestionPapers({
      examId: req.query.examId as string,
      subjectId: req.query.subjectId as string,
      className: req.query.className as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getQuestionPaper(req: Request, res: Response, next: NextFunction) {
  try {
    const paper = await examService.getQuestionPaperById(String(req.params.id))
    res.json({ data: paper })
  } catch (err) { next(err) }
}

export async function createQuestionPaper(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createQuestionPaperSchema.parse(req.body)
    const paper = await examService.createQuestionPaper(input, req.user?.name || 'system')
    res.status(201).json({ data: paper })
  } catch (err) { next(err) }
}

export async function deleteQuestionPaper(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.deleteQuestionPaper(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== User-Scoped ====================

export async function getMyMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getMyMarks(req.user!.userId, {
      academicYear: req.query.academicYear as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyChildrenMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getMyChildrenMarks(req.user!.userId, {
      academicYear: req.query.academicYear as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyReportCard(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await examService.getMyReportCard(req.user!.userId, {
      examId: req.query.examId as string,
    })
    res.json({ data: result })
  } catch (err) { next(err) }
}
