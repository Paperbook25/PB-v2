import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  bankQuestions,
  onlineExams,
  onlineExamAttempts,
  getQuestionBankStats,
} from '../data/question-bank.data'
import type {
  BankQuestion,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ImportQuestionsRequest,
  OnlineExamConfig,
  OnlineExamAttempt,
  QuestionFilters,
} from '@/features/lms/types/question-bank.types'

// ==================== QUESTION BANK HANDLERS ====================

export const questionBankHandlers = [
  // GET /api/question-bank - List questions with filters
  http.get('/api/question-bank', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)

    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const subject = url.searchParams.get('subject') || ''
    const topic = url.searchParams.get('topic') || ''
    const difficulty = url.searchParams.get('difficulty') || ''
    const type = url.searchParams.get('type') || ''
    const status = url.searchParams.get('status') || ''
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || []

    let filtered = [...bankQuestions]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchLower) ||
          q.topic.toLowerCase().includes(searchLower) ||
          q.tags.some((t) => t.toLowerCase().includes(searchLower))
      )
    }

    if (subject) {
      filtered = filtered.filter((q) => q.subject === subject)
    }

    if (topic) {
      filtered = filtered.filter((q) => q.topic === topic)
    }

    if (difficulty) {
      filtered = filtered.filter((q) => q.difficulty === difficulty)
    }

    if (type) {
      filtered = filtered.filter((q) => q.type === type)
    }

    if (status) {
      filtered = filtered.filter((q) => q.status === status)
    }

    if (tags.length > 0) {
      filtered = filtered.filter((q) => tags.some((tag) => q.tags.includes(tag)))
    }

    // Sort by most recently updated
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Paginate
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paged,
      meta: { total, page, limit, totalPages },
    })
  }),

  // GET /api/question-bank/stats - Get question bank statistics
  http.get('/api/question-bank/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getQuestionBankStats() })
  }),

  // GET /api/question-bank/:id - Get single question
  http.get('/api/question-bank/:id', async ({ params }) => {
    await mockDelay('read')
    const { id } = params
    const question = bankQuestions.find((q) => q.id === id)

    if (!question) {
      return HttpResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: question })
  }),

  // POST /api/question-bank - Create question
  http.post('/api/question-bank', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateQuestionRequest

    const newQuestion: BankQuestion = {
      id: `QBQ${String(bankQuestions.length + 1).padStart(5, '0')}`,
      ...body,
      tags: body.tags || [],
      status: 'draft',
      usageCount: 0,
      createdBy: 'TCH001', // Would come from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    bankQuestions.push(newQuestion)

    return HttpResponse.json({ data: newQuestion }, { status: 201 })
  }),

  // PUT /api/question-bank/:id - Update question
  http.put('/api/question-bank/:id', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as UpdateQuestionRequest

    const index = bankQuestions.findIndex((q) => q.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    bankQuestions[index] = {
      ...bankQuestions[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: bankQuestions[index] })
  }),

  // DELETE /api/question-bank/:id - Delete question
  http.delete('/api/question-bank/:id', async ({ params }) => {
    await mockDelay('read')
    const { id } = params

    const index = bankQuestions.findIndex((q) => q.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    bankQuestions.splice(index, 1)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/question-bank/import - Bulk import questions
  http.post('/api/question-bank/import', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as ImportQuestionsRequest

    let imported = 0
    const errors: { index: number; error: string }[] = []

    body.questions.forEach((q, index) => {
      // Validate question
      if (!q.question || !q.correctAnswer) {
        errors.push({ index, error: 'Missing required fields' })
        return
      }

      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        errors.push({ index, error: 'MCQ must have at least 2 options' })
        return
      }

      const newQuestion: BankQuestion = {
        id: `QBQ${String(bankQuestions.length + imported + 1).padStart(5, '0')}`,
        ...q,
        subject: q.subject || body.subject,
        tags: q.tags || [],
        status: 'draft',
        usageCount: 0,
        createdBy: 'TCH001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      bankQuestions.push(newQuestion)
      imported++
    })

    return HttpResponse.json({
      data: {
        imported,
        failed: errors.length,
        errors,
      },
    })
  }),

  // ==================== ONLINE EXAM HANDLERS ====================

  // GET /api/online-exams - List online exams
  http.get('/api/online-exams', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)

    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status') || ''
    const search = url.searchParams.get('search') || ''

    let filtered = [...onlineExams]

    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort by created date
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paged,
      meta: { total, page, limit, totalPages },
    })
  }),

  // GET /api/online-exams/:id - Get single online exam
  http.get('/api/online-exams/:id', async ({ params }) => {
    await mockDelay('read')
    const { id } = params
    const exam = onlineExams.find((e) => e.id === id)

    if (!exam) {
      return HttpResponse.json({ error: 'Online exam not found' }, { status: 404 })
    }

    // Include questions if requested
    const questions = exam.questionIds
      ? bankQuestions.filter((q) => exam.questionIds?.includes(q.id))
      : []

    return HttpResponse.json({
      data: {
        ...exam,
        questions,
      },
    })
  }),

  // POST /api/online-exams - Create online exam
  http.post('/api/online-exams', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Partial<OnlineExamConfig>

    const newExam: OnlineExamConfig = {
      id: `OEXM${String(onlineExams.length + 1).padStart(3, '0')}`,
      title: body.title || 'Untitled Exam',
      description: body.description || '',
      questionIds: body.questionIds || [],
      questionBankIds: body.questionBankIds,
      randomQuestionCount: body.randomQuestionCount,
      duration: body.duration || 30,
      passingScore: body.passingScore || 40,
      maxAttempts: body.maxAttempts || 1,
      negativeMarkingEnabled: body.negativeMarkingEnabled || false,
      schedule: body.schedule,
      isScheduled: !!body.schedule,
      security: body.security || {
        shuffleQuestions: true,
        shuffleOptions: true,
        preventCopyPaste: true,
        preventRightClick: true,
        detectTabSwitch: true,
        fullScreenRequired: false,
        showRemainingTime: true,
        autoSubmitOnTimeUp: true,
      },
      linkedExamId: body.linkedExamId,
      courseId: body.courseId,
      status: body.schedule ? 'scheduled' : 'draft',
      createdBy: 'TCH001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onlineExams.push(newExam)

    return HttpResponse.json({ data: newExam }, { status: 201 })
  }),

  // PUT /api/online-exams/:id - Update online exam
  http.put('/api/online-exams/:id', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as Partial<OnlineExamConfig>

    const index = onlineExams.findIndex((e) => e.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Online exam not found' }, { status: 404 })
    }

    onlineExams[index] = {
      ...onlineExams[index],
      ...body,
      isScheduled: body.schedule ? true : onlineExams[index].isScheduled,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: onlineExams[index] })
  }),

  // DELETE /api/online-exams/:id - Delete online exam
  http.delete('/api/online-exams/:id', async ({ params }) => {
    await mockDelay('read')
    const { id } = params

    const index = onlineExams.findIndex((e) => e.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Online exam not found' }, { status: 404 })
    }

    onlineExams.splice(index, 1)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/online-exams/:id/start - Start exam attempt
  http.post('/api/online-exams/:id/start', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as { studentId: string; studentName: string }

    const exam = onlineExams.find((e) => e.id === id)
    if (!exam) {
      return HttpResponse.json({ error: 'Online exam not found' }, { status: 404 })
    }

    // Check if student has remaining attempts
    const studentAttempts = onlineExamAttempts.filter(
      (a) => a.examId === id && a.studentId === body.studentId
    )
    if (studentAttempts.length >= exam.maxAttempts) {
      return HttpResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
    }

    // Check scheduling
    if (exam.isScheduled && exam.schedule) {
      const now = new Date()
      const startTime = new Date(exam.schedule.startTime)
      const endTime = new Date(exam.schedule.endTime)

      if (now < startTime) {
        return HttpResponse.json({ error: 'Exam has not started yet' }, { status: 400 })
      }
      if (now > endTime) {
        return HttpResponse.json({ error: 'Exam has ended' }, { status: 400 })
      }
    }

    // Get questions for exam
    let questions = exam.questionIds
      ? bankQuestions.filter((q) => exam.questionIds?.includes(q.id))
      : []

    // Shuffle if configured
    if (exam.security.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5)
    }

    // Shuffle options for each question if configured
    if (exam.security.shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: q.type === 'mcq' ? [...q.options].sort(() => Math.random() - 0.5) : q.options,
      }))
    }

    // Create attempt record
    const attempt: OnlineExamAttempt = {
      id: `OATT${String(onlineExamAttempts.length + 1).padStart(3, '0')}`,
      examId: id as string,
      examTitle: exam.title,
      studentId: body.studentId,
      studentName: body.studentName,
      startedAt: new Date().toISOString(),
      timeSpent: 0,
      score: 0,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      answers: [],
      tabSwitchCount: 0,
      securityViolations: [],
      status: 'in_progress',
    }

    onlineExamAttempts.push(attempt)

    // Return exam with questions (hide correct answers)
    const questionsForStudent = questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      // Don't send correctAnswer or explanation until submitted
    }))

    return HttpResponse.json({
      data: {
        attempt,
        exam: {
          ...exam,
          questions: questionsForStudent,
        },
      },
    })
  }),

  // POST /api/online-exams/:id/submit - Submit exam attempt
  http.post('/api/online-exams/:id/submit', async ({ params, request }) => {
    await mockDelay('write')
    const { id } = params
    const body = (await request.json()) as {
      attemptId: string
      answers: { questionId: string; answer: string }[]
      timeSpent: number
      tabSwitchCount: number
      securityViolations: { type: string; timestamp: string }[]
      autoSubmit?: boolean
    }

    const exam = onlineExams.find((e) => e.id === id)
    if (!exam) {
      return HttpResponse.json({ error: 'Online exam not found' }, { status: 404 })
    }

    const attemptIndex = onlineExamAttempts.findIndex((a) => a.id === body.attemptId)
    if (attemptIndex === -1) {
      return HttpResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const attempt = onlineExamAttempts[attemptIndex]

    // Get questions and grade
    const questions = exam.questionIds
      ? bankQuestions.filter((q) => exam.questionIds?.includes(q.id))
      : []

    let score = 0
    const gradedAnswers = body.answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId)
      if (!question) return { ...a, correct: false, pointsEarned: 0 }

      const isCorrect = a.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
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

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0
    const passed = percentage >= exam.passingScore

    // Update attempt
    onlineExamAttempts[attemptIndex] = {
      ...attempt,
      submittedAt: new Date().toISOString(),
      timeSpent: body.timeSpent,
      score: Math.max(0, score), // Don't go negative
      totalPoints,
      percentage: Math.max(0, percentage),
      passed,
      answers: gradedAnswers,
      tabSwitchCount: body.tabSwitchCount,
      securityViolations: body.securityViolations as OnlineExamAttempt['securityViolations'],
      status: body.autoSubmit ? 'auto_submitted' : 'submitted',
    }

    return HttpResponse.json({
      data: {
        attempt: onlineExamAttempts[attemptIndex],
        // Include correct answers and explanations now
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
        })),
      },
    })
  }),

  // GET /api/online-exams/:id/attempts - Get attempts for an exam
  http.get('/api/online-exams/:id/attempts', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId') || ''

    let attempts = onlineExamAttempts.filter((a) => a.examId === id)

    if (studentId) {
      attempts = attempts.filter((a) => a.studentId === studentId)
    }

    return HttpResponse.json({ data: attempts })
  }),

  // POST /api/online-exams/:id/report-violation - Report security violation
  http.post('/api/online-exams/:id/report-violation', async ({ params, request }) => {
    await mockDelay('read')
    const { id } = params
    const body = (await request.json()) as {
      attemptId: string
      type: 'tab_switch' | 'copy_attempt' | 'right_click' | 'fullscreen_exit'
    }

    const attemptIndex = onlineExamAttempts.findIndex((a) => a.id === body.attemptId)
    if (attemptIndex === -1) {
      return HttpResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const attempt = onlineExamAttempts[attemptIndex]

    // Add violation
    attempt.securityViolations.push({
      type: body.type,
      timestamp: new Date().toISOString(),
    })

    if (body.type === 'tab_switch') {
      attempt.tabSwitchCount++
    }

    // Check if auto-submit needed
    const exam = onlineExams.find((e) => e.id === id)
    if (exam?.security.maxTabSwitches && attempt.tabSwitchCount >= exam.security.maxTabSwitches) {
      return HttpResponse.json({
        data: { shouldAutoSubmit: true, reason: 'Maximum tab switches exceeded' },
      })
    }

    return HttpResponse.json({ data: { recorded: true } })
  }),

  // GET /api/online-exams/my-attempts - Get student's own attempts
  http.get('/api/online-exams/my-attempts', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId') || 'STD001'

    const attempts = onlineExamAttempts.filter((a) => a.studentId === studentId)

    return HttpResponse.json({ data: attempts })
  }),
]
