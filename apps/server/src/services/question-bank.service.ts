import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateQuestionInput, UpdateQuestionInput, ListQuestionsInput, ImportQuestionsInput,
  CreateOnlineExamInput, UpdateOnlineExamInput, ListOnlineExamsInput,
  StartAttemptInput, SubmitAttemptInput, ReportViolationInput,
} from '../validators/question-bank.validators.js'

// ==================== Enum Mapping ====================

const questionTypeToDb: Record<string, string> = {
  mcq: 'qt_mcq', true_false: 'qt_true_false', short_answer: 'qt_short_answer',
}
const questionTypeFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(questionTypeToDb).map(([k, v]) => [v, k])
)

const questionDiffToDb: Record<string, string> = {
  easy: 'qd_easy', medium: 'qd_medium', hard: 'qd_hard',
}
const questionDiffFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(questionDiffToDb).map(([k, v]) => [v, k])
)

const questionStatusToDb: Record<string, string> = {
  draft: 'qs_draft', active: 'qs_active', archived: 'qs_archived',
}
const questionStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(questionStatusToDb).map(([k, v]) => [v, k])
)

const onlineExamStatusToDb: Record<string, string> = {
  draft: 'oes_draft', scheduled: 'oes_scheduled', active: 'oes_active', completed: 'oes_completed',
}
const onlineExamStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(onlineExamStatusToDb).map(([k, v]) => [v, k])
)

const attemptStatusToDb: Record<string, string> = {
  in_progress: 'eas_in_progress', submitted: 'eas_submitted',
  auto_submitted: 'eas_auto_submitted', timed_out: 'eas_timed_out',
}
const attemptStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(attemptStatusToDb).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

function formatQuestion(q: any) {
  return {
    id: q.id,
    question: q.question,
    type: questionTypeFromDb[q.type] || q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    points: q.points,
    explanation: q.explanation,
    subject: q.subject,
    topic: q.topic,
    difficulty: questionDiffFromDb[q.difficulty] || q.difficulty,
    tags: q.tags,
    status: questionStatusFromDb[q.status] || q.status,
    usageCount: q.usageCount,
    negativeMarks: q.negativeMarks,
    createdBy: q.createdBy,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }
}

function formatOnlineExam(e: any) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    questionIds: e.questionIds,
    randomQuestionCount: e.randomQuestionCount,
    duration: e.duration,
    passingScore: e.passingScore,
    maxAttempts: e.maxAttempts,
    negativeMarkingEnabled: e.negativeMarkingEnabled,
    schedule: e.schedule,
    isScheduled: e.isScheduled,
    security: e.security,
    linkedExamId: e.linkedExamId,
    courseId: e.courseId,
    status: onlineExamStatusFromDb[e.status] || e.status,
    createdBy: e.createdBy,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }
}

function formatAttempt(a: any) {
  return {
    id: a.id,
    examId: a.examId,
    examTitle: (a as any).exam?.title || '',
    studentId: a.studentId,
    studentName: a.studentName,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    timeSpent: a.timeSpent,
    score: a.score,
    totalPoints: a.totalPoints,
    percentage: a.percentage,
    passed: a.passed,
    answers: a.answers,
    tabSwitchCount: a.tabSwitchCount,
    securityViolations: a.securityViolations,
    status: attemptStatusFromDb[a.status] || a.status,
  }
}

const defaultSecurity = {
  shuffleQuestions: true,
  shuffleOptions: true,
  preventCopyPaste: true,
  preventRightClick: true,
  detectTabSwitch: true,
  fullScreenRequired: false,
  showRemainingTime: true,
  autoSubmitOnTimeUp: true,
}

// ==================== Questions CRUD ====================

export async function listQuestions(query: ListQuestionsInput) {
  const { page, limit, search, subject, topic, difficulty, type, status, tags } = query
  const where: any = {}

  if (search) {
    where.OR = [
      { question: { contains: search } },
      { topic: { contains: search } },
    ]
  }
  if (subject) where.subject = subject
  if (topic) where.topic = topic
  if (difficulty && questionDiffToDb[difficulty]) where.difficulty = questionDiffToDb[difficulty]
  if (type && questionTypeToDb[type]) where.type = questionTypeToDb[type]
  if (status && questionStatusToDb[status]) where.status = questionStatusToDb[status]

  const [total, questions] = await Promise.all([
    prisma.bankQuestion.count({ where }),
    prisma.bankQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  // Filter by tags in application layer (JSON column)
  let filtered = questions
  if (tags) {
    const tagArr = tags.split(',').map(t => t.trim().toLowerCase())
    filtered = questions.filter(q => {
      const qTags = (q.tags as string[]) || []
      return tagArr.some(t => qTags.map(qt => qt.toLowerCase()).includes(t))
    })
  }

  return {
    data: filtered.map(formatQuestion),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getQuestionStats() {
  const [total, bySubject, byDifficulty, byType, recentlyAdded] = await Promise.all([
    prisma.bankQuestion.count(),
    prisma.bankQuestion.groupBy({ by: ['subject'], _count: { id: true } }),
    prisma.bankQuestion.groupBy({ by: ['difficulty'], _count: { id: true } }),
    prisma.bankQuestion.groupBy({ by: ['type'], _count: { id: true } }),
    prisma.bankQuestion.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ])

  // Most used topics
  const topTopics = await prisma.bankQuestion.groupBy({
    by: ['topic'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  return {
    data: {
      totalQuestions: total,
      bySubject: Object.fromEntries(bySubject.map(s => [s.subject, s._count.id])),
      byDifficulty: Object.fromEntries(
        byDifficulty.map(d => [questionDiffFromDb[d.difficulty] || d.difficulty, d._count.id])
      ),
      byType: Object.fromEntries(
        byType.map(t => [questionTypeFromDb[t.type] || t.type, t._count.id])
      ),
      recentlyAdded,
      mostUsedTopics: topTopics.map(t => ({ topic: t.topic, count: t._count.id })),
    },
  }
}

export async function getQuestionById(id: string) {
  const q = await prisma.bankQuestion.findUnique({ where: { id } })
  if (!q) throw AppError.notFound('Question not found')
  return formatQuestion(q)
}

export async function createQuestion(input: CreateQuestionInput, createdBy: string) {
  const q = await prisma.bankQuestion.create({
    data: {
      question: input.question,
      type: questionTypeToDb[input.type] as any,
      options: input.options,
      correctAnswer: input.correctAnswer,
      points: input.points || 1,
      explanation: input.explanation,
      subject: input.subject,
      topic: input.topic,
      difficulty: questionDiffToDb[input.difficulty] as any,
      tags: input.tags || [],
      status: input.status ? (questionStatusToDb[input.status] as any) : 'qs_draft',
      negativeMarks: input.negativeMarks,
      createdBy,
    },
  })
  return formatQuestion(q)
}

export async function updateQuestion(id: string, input: UpdateQuestionInput) {
  const existing = await prisma.bankQuestion.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Question not found')

  const data: any = {}
  if (input.question !== undefined) data.question = input.question
  if (input.type && questionTypeToDb[input.type]) data.type = questionTypeToDb[input.type]
  if (input.options !== undefined) data.options = input.options
  if (input.correctAnswer !== undefined) data.correctAnswer = input.correctAnswer
  if (input.points !== undefined) data.points = input.points
  if (input.explanation !== undefined) data.explanation = input.explanation
  if (input.subject !== undefined) data.subject = input.subject
  if (input.topic !== undefined) data.topic = input.topic
  if (input.difficulty && questionDiffToDb[input.difficulty]) data.difficulty = questionDiffToDb[input.difficulty]
  if (input.tags !== undefined) data.tags = input.tags
  if (input.status && questionStatusToDb[input.status]) data.status = questionStatusToDb[input.status]
  if (input.negativeMarks !== undefined) data.negativeMarks = input.negativeMarks

  const q = await prisma.bankQuestion.update({ where: { id }, data })
  return formatQuestion(q)
}

export async function deleteQuestion(id: string) {
  const existing = await prisma.bankQuestion.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Question not found')
  await prisma.bankQuestion.delete({ where: { id } })
  return { success: true }
}

export async function importQuestions(input: ImportQuestionsInput, createdBy: string) {
  let imported = 0
  const errors: { index: number; error: string }[] = []

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i]
    try {
      if (!q.question || !q.correctAnswer) {
        errors.push({ index: i, error: 'Missing required fields' })
        continue
      }
      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        errors.push({ index: i, error: 'MCQ must have at least 2 options' })
        continue
      }

      await prisma.bankQuestion.create({
        data: {
          question: q.question,
          type: (questionTypeToDb[q.type || 'mcq'] || 'qt_mcq') as any,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          explanation: q.explanation,
          subject: q.subject || input.subject || 'general',
          topic: q.topic || 'general',
          difficulty: (questionDiffToDb[q.difficulty || 'medium'] || 'qd_medium') as any,
          tags: q.tags || [],
          status: 'qs_draft',
          negativeMarks: q.negativeMarks,
          createdBy,
        },
      })
      imported++
    } catch (err: any) {
      errors.push({ index: i, error: err.message || 'Unknown error' })
    }
  }

  return { data: { imported, failed: errors.length, errors } }
}

// ==================== Online Exams ====================

export async function listOnlineExams(query: ListOnlineExamsInput) {
  const { page, limit, status, search } = query
  const where: any = {}
  if (status && onlineExamStatusToDb[status]) where.status = onlineExamStatusToDb[status]
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [total, exams] = await Promise.all([
    prisma.onlineExam.count({ where }),
    prisma.onlineExam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: exams.map(formatOnlineExam),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getOnlineExamById(id: string) {
  const exam = await prisma.onlineExam.findUnique({ where: { id } })
  if (!exam) throw AppError.notFound('Online exam not found')

  // Resolve questions
  const questionIds = (exam.questionIds as string[]) || []
  const questions = questionIds.length > 0
    ? await prisma.bankQuestion.findMany({ where: { id: { in: questionIds } } })
    : []

  return {
    ...formatOnlineExam(exam),
    questions: questions.map(formatQuestion),
  }
}

export async function createOnlineExam(input: CreateOnlineExamInput, createdBy: string) {
  const security = { ...defaultSecurity, ...input.security }
  const isScheduled = !!input.schedule

  const exam = await prisma.onlineExam.create({
    data: {
      title: input.title,
      description: input.description,
      questionIds: input.questionIds || [],
      randomQuestionCount: input.randomQuestionCount,
      duration: input.duration || 30,
      passingScore: input.passingScore || 40,
      maxAttempts: input.maxAttempts || 1,
      negativeMarkingEnabled: input.negativeMarkingEnabled || false,
      schedule: input.schedule || undefined,
      isScheduled,
      security,
      linkedExamId: input.linkedExamId,
      courseId: input.courseId,
      status: isScheduled ? 'oes_scheduled' : 'oes_draft',
      createdBy,
    },
  })
  return formatOnlineExam(exam)
}

export async function updateOnlineExam(id: string, input: UpdateOnlineExamInput) {
  const existing = await prisma.onlineExam.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Online exam not found')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.questionIds !== undefined) data.questionIds = input.questionIds
  if (input.randomQuestionCount !== undefined) data.randomQuestionCount = input.randomQuestionCount
  if (input.duration !== undefined) data.duration = input.duration
  if (input.passingScore !== undefined) data.passingScore = input.passingScore
  if (input.maxAttempts !== undefined) data.maxAttempts = input.maxAttempts
  if (input.negativeMarkingEnabled !== undefined) data.negativeMarkingEnabled = input.negativeMarkingEnabled
  if (input.schedule !== undefined) {
    data.schedule = input.schedule
    data.isScheduled = !!input.schedule
  }
  if (input.security !== undefined) {
    data.security = { ...defaultSecurity, ...(existing.security as object), ...input.security }
  }
  if (input.linkedExamId !== undefined) data.linkedExamId = input.linkedExamId
  if (input.courseId !== undefined) data.courseId = input.courseId

  const exam = await prisma.onlineExam.update({ where: { id }, data })
  return formatOnlineExam(exam)
}

export async function deleteOnlineExam(id: string) {
  const existing = await prisma.onlineExam.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Online exam not found')
  await prisma.onlineExam.delete({ where: { id } })
  return { success: true }
}

// ==================== Attempts ====================

export async function startAttempt(examId: string, input: StartAttemptInput) {
  const exam = await prisma.onlineExam.findUnique({ where: { id: examId } })
  if (!exam) throw AppError.notFound('Online exam not found')

  // Check max attempts
  const existingAttempts = await prisma.onlineExamAttempt.count({
    where: { examId, studentId: input.studentId },
  })
  if (existingAttempts >= exam.maxAttempts) {
    throw AppError.badRequest('Maximum attempts reached')
  }

  // Check schedule
  if (exam.isScheduled && exam.schedule) {
    const schedule = exam.schedule as any
    const now = new Date()
    if (schedule.startTime && new Date(schedule.startTime) > now) {
      throw AppError.badRequest('Exam has not started yet')
    }
    if (schedule.endTime && new Date(schedule.endTime) < now) {
      throw AppError.badRequest('Exam has ended')
    }
  }

  // Create attempt
  const attempt = await prisma.onlineExamAttempt.create({
    data: {
      examId,
      studentId: input.studentId,
      studentName: input.studentName,
      status: 'eas_in_progress',
    },
    include: { exam: true },
  })

  // Resolve questions
  const questionIds = (exam.questionIds as string[]) || []
  let questions = questionIds.length > 0
    ? await prisma.bankQuestion.findMany({ where: { id: { in: questionIds } } })
    : []

  const security = exam.security as any

  // Shuffle if needed
  if (security?.shuffleQuestions) {
    questions = questions.sort(() => Math.random() - 0.5)
  }

  // Return questions WITHOUT correctAnswer/explanation
  const safeQuestions = questions.map(q => {
    let options = q.options as string[]
    if (security?.shuffleOptions && options) {
      options = [...options].sort(() => Math.random() - 0.5)
    }
    return {
      id: q.id,
      question: q.question,
      type: questionTypeFromDb[q.type] || q.type,
      options,
      points: q.points,
    }
  })

  // Compute total points
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  await prisma.onlineExamAttempt.update({
    where: { id: attempt.id },
    data: { totalPoints },
  })

  return {
    data: {
      attempt: { ...formatAttempt(attempt), totalPoints },
      exam: {
        ...formatOnlineExam(exam),
        questions: safeQuestions,
      },
    },
  }
}

export async function submitAttempt(examId: string, input: SubmitAttemptInput) {
  const exam = await prisma.onlineExam.findUnique({ where: { id: examId } })
  if (!exam) throw AppError.notFound('Online exam not found')

  const attempt = await prisma.onlineExamAttempt.findUnique({ where: { id: input.attemptId } })
  if (!attempt) throw AppError.notFound('Attempt not found')

  // Get questions for grading
  const questionIds = (exam.questionIds as string[]) || []
  const questions = questionIds.length > 0
    ? await prisma.bankQuestion.findMany({ where: { id: { in: questionIds } } })
    : []
  const questionMap = new Map(questions.map(q => [q.id, q]))

  // Grade answers
  let score = 0
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const gradedAnswers = input.answers.map(a => {
    const question = questionMap.get(a.questionId)
    if (!question) return { ...a, correct: false, pointsEarned: 0 }

    const isCorrect = a.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    let pointsEarned = 0
    if (isCorrect) {
      pointsEarned = question.points
    } else if (exam.negativeMarkingEnabled && question.negativeMarks) {
      pointsEarned = -question.negativeMarks
    }
    score += pointsEarned

    return {
      questionId: a.questionId,
      answer: a.answer,
      correct: isCorrect,
      pointsEarned,
    }
  })

  // Score never below 0
  score = Math.max(0, score)
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0
  const passed = percentage >= exam.passingScore
  const status = input.autoSubmit ? 'eas_auto_submitted' : 'eas_submitted'

  const updated = await prisma.onlineExamAttempt.update({
    where: { id: input.attemptId },
    data: {
      submittedAt: new Date(),
      timeSpent: input.timeSpent,
      score,
      totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      answers: gradedAnswers,
      tabSwitchCount: input.tabSwitchCount || 0,
      securityViolations: input.securityViolations || [],
      status: status as any,
    },
    include: { exam: true },
  })

  // Return questions WITH correctAnswer/explanation for review
  const reviewQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    type: questionTypeFromDb[q.type] || q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    points: q.points,
  }))

  return {
    data: {
      attempt: formatAttempt(updated),
      questions: reviewQuestions,
    },
  }
}

export async function getAttempts(examId: string, query: { studentId?: string }) {
  const where: any = { examId }
  if (query.studentId) where.studentId = query.studentId

  const attempts = await prisma.onlineExamAttempt.findMany({
    where,
    include: { exam: { select: { title: true } } },
    orderBy: { startedAt: 'desc' },
  })

  return { data: attempts.map(formatAttempt) }
}

export async function reportViolation(examId: string, input: ReportViolationInput) {
  const exam = await prisma.onlineExam.findUnique({ where: { id: examId } })
  if (!exam) throw AppError.notFound('Online exam not found')

  const attempt = await prisma.onlineExamAttempt.findUnique({ where: { id: input.attemptId } })
  if (!attempt) throw AppError.notFound('Attempt not found')

  const violations = (attempt.securityViolations as any[]) || []
  violations.push({ type: input.type, timestamp: new Date().toISOString() })

  let tabSwitchCount = attempt.tabSwitchCount
  if (input.type === 'tab_switch') {
    tabSwitchCount++
  }

  await prisma.onlineExamAttempt.update({
    where: { id: input.attemptId },
    data: { securityViolations: violations, tabSwitchCount },
  })

  const security = exam.security as any
  if (security?.maxTabSwitches && tabSwitchCount >= security.maxTabSwitches) {
    return { data: { shouldAutoSubmit: true, reason: 'Maximum tab switches exceeded' } }
  }

  return { data: { recorded: true } }
}

export async function getMyAttempts(userId: string) {
  // Resolve user to student
  const user = await prisma.user.findUnique({ where: { id: userId } })
  let studentId = user?.studentId || userId

  // Try to find student by id or admission number
  const student = await prisma.student.findFirst({
    where: { OR: [{ id: studentId }, { admissionNumber: studentId }] },
  })
  if (student) studentId = student.id

  const attempts = await prisma.onlineExamAttempt.findMany({
    where: { studentId },
    include: { exam: { select: { title: true } } },
    orderBy: { startedAt: 'desc' },
  })

  return { data: attempts.map(formatAttempt) }
}
