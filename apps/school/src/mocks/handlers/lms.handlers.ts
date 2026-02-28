import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  courses,
  modules,
  lessons,
  liveClasses,
  enrollments,
  assignments,
  submissions,
  quizzes,
  quizAttempts,
  instructors,
  getLmsStats,
  certificates,
  certificateTemplates,
} from '../data/lms.data'
import type {
  Course,
  CourseModule,
  Lesson,
  LiveClass,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  Certificate,
  CertificateType,
} from '@/features/lms/types/lms.types'

export const lmsHandlers = [
  // ==================== STATS ====================

  // Get LMS stats
  http.get('/api/lms/stats', async () => {
    await mockDelay('read')
    const stats = getLmsStats()
    return HttpResponse.json({ data: stats })
  }),

  // Get all instructors
  http.get('/api/lms/instructors', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: instructors })
  }),

  // ==================== COURSES ====================

  // Get paginated courses with filters
  http.get('/api/lms/courses', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const category = url.searchParams.get('category')
    const level = url.searchParams.get('level')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filtered = [...courses]

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.instructorName.toLowerCase().includes(s)
      )
    }
    if (category) {
      filtered = filtered.filter((c) => c.category === category)
    }
    if (level) {
      filtered = filtered.filter((c) => c.level === level)
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Get single course
  http.get('/api/lms/courses/:id', async ({ params }) => {
    await mockDelay('read')
    const course = courses.find((c) => c.id === params.id)
    if (!course) {
      return HttpResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: course })
  }),

  // Create course
  http.post('/api/lms/courses', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()

    const instructor = instructors.find((i) => i.id === body.instructorId)

    const newCourse: Course = {
      id: `CRS-${Date.now()}`,
      title: body.title as string,
      description: body.description as string || '',
      thumbnail: (body.thumbnail as string) || `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`,
      category: body.category as Course['category'],
      level: body.level as Course['level'],
      instructorId: body.instructorId as string,
      instructorName: instructor?.name || '',
      price: body.price as number || 0,
      status: (body.status as Course['status']) || 'draft',
      duration: body.duration as number || 0,
      enrollmentCount: 0,
      rating: 0,
      tags: (body.tags as string[]) || [],
      createdAt: now,
      updatedAt: now,
    }

    courses.push(newCourse)
    return HttpResponse.json({ data: newCourse }, { status: 201 })
  }),

  // Update course
  http.put('/api/lms/courses/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = courses.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Course>
    courses[index] = {
      ...courses[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: courses[index] })
  }),

  // Delete course
  http.delete('/api/lms/courses/:id', async ({ params }) => {
    await mockDelay('read')
    const index = courses.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    courses.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== MODULES ====================

  // Get modules for a course, sorted by order
  http.get('/api/lms/courses/:id/modules', async ({ params }) => {
    await mockDelay('read')
    const courseModules = modules
      .filter((m) => m.courseId === params.id)
      .sort((a, b) => a.order - b.order)
    return HttpResponse.json({ data: courseModules })
  }),

  // Create module
  http.post('/api/lms/modules', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const newModule: CourseModule = {
      id: `MOD-${Date.now()}`,
      courseId: body.courseId as string,
      title: body.title as string,
      description: body.description as string || '',
      order: body.order as number || modules.filter((m) => m.courseId === body.courseId).length + 1,
      duration: body.duration as number || 0,
    }

    modules.push(newModule)
    return HttpResponse.json({ data: newModule }, { status: 201 })
  }),

  // Update module
  http.put('/api/lms/modules/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = modules.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<CourseModule>
    modules[index] = { ...modules[index], ...body }
    return HttpResponse.json({ data: modules[index] })
  }),

  // Delete module
  http.delete('/api/lms/modules/:id', async ({ params }) => {
    await mockDelay('read')
    const index = modules.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Module not found' }, { status: 404 })
    }
    modules.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== LESSONS ====================

  // Get lessons for a module, sorted by order
  http.get('/api/lms/modules/:id/lessons', async ({ params }) => {
    await mockDelay('read')
    const moduleLessons = lessons
      .filter((l) => l.moduleId === params.id)
      .sort((a, b) => a.order - b.order)
    return HttpResponse.json({ data: moduleLessons })
  }),

  // Create lesson
  http.post('/api/lms/lessons', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const newLesson: Lesson = {
      id: `LES-${Date.now()}`,
      moduleId: body.moduleId as string,
      courseId: body.courseId as string,
      title: body.title as string,
      type: body.type as Lesson['type'],
      order: body.order as number || lessons.filter((l) => l.moduleId === body.moduleId).length + 1,
      duration: body.duration as number || 0,
      contentUrl: body.contentUrl as string || '',
      videoProvider: body.videoProvider as Lesson['videoProvider'],
      isFree: body.isFree as boolean || false,
    }

    lessons.push(newLesson)
    return HttpResponse.json({ data: newLesson }, { status: 201 })
  }),

  // Update lesson
  http.put('/api/lms/lessons/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = lessons.findIndex((l) => l.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Lesson>
    lessons[index] = { ...lessons[index], ...body }
    return HttpResponse.json({ data: lessons[index] })
  }),

  // Delete lesson
  http.delete('/api/lms/lessons/:id', async ({ params }) => {
    await mockDelay('read')
    const index = lessons.findIndex((l) => l.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    lessons.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== LIVE CLASSES ====================

  // Get paginated live classes with filters
  http.get('/api/lms/live-classes', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const courseId = url.searchParams.get('courseId')
    const instructorId = url.searchParams.get('instructorId')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filtered = [...liveClasses]

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (lc) =>
          lc.title.toLowerCase().includes(s) ||
          lc.courseName.toLowerCase().includes(s) ||
          lc.instructorName.toLowerCase().includes(s)
      )
    }
    if (courseId) {
      filtered = filtered.filter((lc) => lc.courseId === courseId)
    }
    if (instructorId) {
      filtered = filtered.filter((lc) => lc.instructorId === instructorId)
    }
    if (status) {
      filtered = filtered.filter((lc) => lc.status === status)
    }

    filtered.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Get single live class
  http.get('/api/lms/live-classes/:id', async ({ params }) => {
    await mockDelay('read')
    const liveClass = liveClasses.find((lc) => lc.id === params.id)
    if (!liveClass) {
      return HttpResponse.json({ error: 'Live class not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: liveClass })
  }),

  // Schedule live class
  http.post('/api/lms/live-classes', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const course = courses.find((c) => c.id === body.courseId)
    const instructor = instructors.find((i) => i.id === body.instructorId)

    const newLiveClass: LiveClass = {
      id: `LC-${Date.now()}`,
      courseId: body.courseId as string,
      courseName: course?.title || '',
      title: body.title as string,
      instructorId: body.instructorId as string,
      instructorName: instructor?.name || '',
      scheduledAt: body.scheduledAt as string,
      duration: body.duration as number || 60,
      meetingLink: body.meetingLink as string || `https://meet.paperbook.edu/${Date.now()}`,
      meetingId: body.meetingId as string || String(Date.now()),
      meetingPassword: body.meetingPassword as string || '',
      status: 'scheduled',
      attendanceCount: 0,
      recordingUrl: undefined,
    }

    liveClasses.push(newLiveClass)
    return HttpResponse.json({ data: newLiveClass }, { status: 201 })
  }),

  // Update live class
  http.put('/api/lms/live-classes/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = liveClasses.findIndex((lc) => lc.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Live class not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<LiveClass>
    liveClasses[index] = { ...liveClasses[index], ...body }
    return HttpResponse.json({ data: liveClasses[index] })
  }),

  // Delete live class
  http.delete('/api/lms/live-classes/:id', async ({ params }) => {
    await mockDelay('read')
    const index = liveClasses.findIndex((lc) => lc.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Live class not found' }, { status: 404 })
    }
    liveClasses.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ENROLLMENTS ====================

  // Get paginated enrollments with filters
  http.get('/api/lms/enrollments', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const courseId = url.searchParams.get('courseId')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...enrollments]

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.studentName.toLowerCase().includes(s) ||
          e.courseName.toLowerCase().includes(s) ||
          e.studentId.toLowerCase().includes(s)
      )
    }
    if (courseId) {
      filtered = filtered.filter((e) => e.courseId === courseId)
    }
    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Enroll student (check for duplicate)
  http.post('/api/lms/enrollments', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const duplicate = enrollments.find(
      (e) =>
        e.studentId === body.studentId &&
        e.courseId === body.courseId &&
        e.status !== 'dropped'
    )
    if (duplicate) {
      return HttpResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 409 }
      )
    }

    const course = courses.find((c) => c.id === body.courseId)
    const courseLessons = lessons.filter((l) => l.courseId === body.courseId)

    const newEnrollment: Enrollment = {
      id: `ENR-${Date.now()}`,
      courseId: body.courseId as string,
      courseName: course?.title || '',
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: courseLessons.length,
    }

    enrollments.push(newEnrollment)

    // Update course enrollment count
    if (course) {
      course.enrollmentCount++
    }

    return HttpResponse.json({ data: newEnrollment }, { status: 201 })
  }),

  // Update enrollment status
  http.patch('/api/lms/enrollments/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = enrollments.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Enrollment>
    enrollments[index] = { ...enrollments[index], ...body }
    return HttpResponse.json({ data: enrollments[index] })
  }),

  // Get enrollment progress
  http.get('/api/lms/enrollments/:id/progress', async ({ params }) => {
    await mockDelay('read')
    const enrollment = enrollments.find((e) => e.id === params.id)
    if (!enrollment) {
      return HttpResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const courseLessons = lessons.filter((l) => l.courseId === enrollment.courseId)
    const completedLessonIds = courseLessons
      .slice(0, enrollment.lessonsCompleted)
      .map((l) => l.id)

    return HttpResponse.json({
      data: {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        studentId: enrollment.studentId,
        progress: enrollment.progress,
        lessonsCompleted: enrollment.lessonsCompleted,
        totalLessons: enrollment.totalLessons,
        completedLessonIds,
      },
    })
  }),

  // ==================== ASSIGNMENTS ====================

  // Get assignments list (filterable)
  http.get('/api/lms/assignments', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const courseId = url.searchParams.get('courseId')
    const search = url.searchParams.get('search')

    let filtered = [...assignments]

    if (courseId) {
      filtered = filtered.filter((a) => a.courseId === courseId)
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.courseName.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single assignment
  http.get('/api/lms/assignments/:id', async ({ params }) => {
    await mockDelay('read')
    const assignment = assignments.find((a) => a.id === params.id)
    if (!assignment) {
      return HttpResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: assignment })
  }),

  // Create assignment
  http.post('/api/lms/assignments', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>
    const course = courses.find((c) => c.id === body.courseId)

    const newAssignment: Assignment = {
      id: `ASG-${Date.now()}`,
      lessonId: body.lessonId as string || '',
      courseId: body.courseId as string,
      courseName: course?.title || '',
      title: body.title as string,
      instructions: body.instructions as string || '',
      maxScore: body.maxScore as number || 100,
      dueDate: body.dueDate as string,
      submissionCount: 0,
      createdAt: new Date().toISOString(),
    }

    assignments.push(newAssignment)
    return HttpResponse.json({ data: newAssignment }, { status: 201 })
  }),

  // Update assignment
  http.put('/api/lms/assignments/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = assignments.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Assignment>
    assignments[index] = { ...assignments[index], ...body }
    return HttpResponse.json({ data: assignments[index] })
  }),

  // Delete assignment
  http.delete('/api/lms/assignments/:id', async ({ params }) => {
    await mockDelay('read')
    const index = assignments.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    assignments.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Get submissions for an assignment
  http.get('/api/lms/assignments/:id/submissions', async ({ params }) => {
    await mockDelay('read')
    const assignmentSubmissions = submissions.filter(
      (s) => s.assignmentId === params.id
    )
    return HttpResponse.json({ data: assignmentSubmissions })
  }),

  // Submit assignment
  http.post('/api/lms/submissions', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const newSubmission: AssignmentSubmission = {
      id: `SUB-${Date.now()}`,
      assignmentId: body.assignmentId as string,
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      submittedAt: new Date().toISOString(),
      submissionText: body.submissionText as string || '',
      attachmentUrl: body.attachmentUrl as string || undefined,
      score: null,
      feedback: '',
      status: 'submitted',
    }

    submissions.push(newSubmission)

    // Update assignment submission count
    const assignment = assignments.find((a) => a.id === body.assignmentId)
    if (assignment) {
      assignment.submissionCount++
    }

    return HttpResponse.json({ data: newSubmission }, { status: 201 })
  }),

  // Grade submission
  http.post('/api/lms/submissions/:id/grade', async ({ params, request }) => {
    await mockDelay('read')
    const index = submissions.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Submission not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>

    submissions[index] = {
      ...submissions[index],
      score: body.score as number,
      feedback: body.feedback as string || '',
      status: 'graded',
    }

    return HttpResponse.json({ data: submissions[index] })
  }),

  // ==================== QUIZZES ====================

  // Get quizzes list (filterable)
  http.get('/api/lms/quizzes', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const courseId = url.searchParams.get('courseId')
    const search = url.searchParams.get('search')

    let filtered = [...quizzes]

    if (courseId) {
      filtered = filtered.filter((q) => q.courseId === courseId)
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.courseName.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single quiz
  http.get('/api/lms/quizzes/:id', async ({ params }) => {
    await mockDelay('read')
    const quiz = quizzes.find((q) => q.id === params.id)
    if (!quiz) {
      return HttpResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: quiz })
  }),

  // Create quiz
  http.post('/api/lms/quizzes', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>
    const course = courses.find((c) => c.id === body.courseId)

    const questions = (body.questions as Quiz['questions']) || []
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    const newQuiz: Quiz = {
      id: `QZ-${Date.now()}`,
      lessonId: body.lessonId as string || '',
      courseId: body.courseId as string,
      courseName: course?.title || '',
      title: body.title as string,
      description: body.description as string || '',
      duration: body.duration as number || 30,
      passingScore: body.passingScore as number || 50,
      maxAttempts: body.maxAttempts as number || 3,
      questions,
      totalPoints,
      createdAt: new Date().toISOString(),
    }

    quizzes.push(newQuiz)
    return HttpResponse.json({ data: newQuiz }, { status: 201 })
  }),

  // Update quiz
  http.put('/api/lms/quizzes/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = quizzes.findIndex((q) => q.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<Quiz>

    // Recalculate total points if questions changed
    if (body.questions) {
      body.totalPoints = body.questions.reduce((sum, q) => sum + q.points, 0)
    }

    quizzes[index] = { ...quizzes[index], ...body }
    return HttpResponse.json({ data: quizzes[index] })
  }),

  // Delete quiz
  http.delete('/api/lms/quizzes/:id', async ({ params }) => {
    await mockDelay('read')
    const index = quizzes.findIndex((q) => q.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    quizzes.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Submit quiz answers (calculate score, create attempt)
  http.post('/api/lms/quizzes/:id/submit', async ({ params, request }) => {
    await mockDelay('read')
    const quiz = quizzes.find((q) => q.id === params.id)
    if (!quiz) {
      return HttpResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const studentAnswers = body.answers as { questionId: string; answer: string }[]

    // Calculate score
    const answers = quiz.questions.map((q) => {
      const studentAnswer = studentAnswers.find((a) => a.questionId === q.id)
      const isCorrect = studentAnswer
        ? studentAnswer.answer.toLowerCase() === q.correctAnswer.toLowerCase()
        : false

      return {
        questionId: q.id,
        answer: studentAnswer?.answer || '',
        correct: isCorrect,
      }
    })

    const score = quiz.questions.reduce(
      (sum, q, i) => sum + (answers[i].correct ? q.points : 0),
      0
    )
    const percentage = Math.round((score / quiz.totalPoints) * 100)

    const newAttempt: QuizAttempt = {
      id: `QA-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      answers,
      submittedAt: new Date().toISOString(),
    }

    quizAttempts.push(newAttempt)
    return HttpResponse.json({ data: newAttempt }, { status: 201 })
  }),

  // Get quiz attempts
  http.get('/api/lms/quizzes/:id/attempts', async ({ params }) => {
    await mockDelay('read')
    const attempts = quizAttempts.filter((a) => a.quizId === params.id)
    return HttpResponse.json({ data: attempts })
  }),

  // ==================== LESSON PROGRESS ====================

  // Mark lesson completed (update enrollment progress)
  http.post('/api/lms/lessons/:id/progress', async ({ params, request }) => {
    await mockDelay('read')
    const lesson = lessons.find((l) => l.id === params.id)
    if (!lesson) {
      return HttpResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const studentId = body.studentId as string

    // Find the student's enrollment for this course
    const enrollment = enrollments.find(
      (e) => e.studentId === studentId && e.courseId === lesson.courseId && e.status === 'active'
    )

    if (!enrollment) {
      return HttpResponse.json(
        { error: 'No active enrollment found for this course' },
        { status: 404 }
      )
    }

    // Update enrollment progress
    enrollment.lessonsCompleted = Math.min(
      enrollment.lessonsCompleted + 1,
      enrollment.totalLessons
    )
    enrollment.progress = Math.round(
      (enrollment.lessonsCompleted / enrollment.totalLessons) * 100
    )

    // If all lessons completed, mark enrollment as completed
    if (enrollment.lessonsCompleted >= enrollment.totalLessons) {
      enrollment.status = 'completed'
      enrollment.progress = 100
    }

    return HttpResponse.json({
      data: {
        lessonId: lesson.id,
        courseId: lesson.courseId,
        studentId,
        lessonsCompleted: enrollment.lessonsCompleted,
        totalLessons: enrollment.totalLessons,
        progress: enrollment.progress,
        enrollmentStatus: enrollment.status,
      },
    })
  }),

  // ==================== CERTIFICATES ====================

  // Get all certificate templates
  http.get('/api/lms/certificates/templates', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: certificateTemplates })
  }),

  // Get certificates for a student
  http.get('/api/lms/certificates', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const courseId = url.searchParams.get('courseId')

    let filtered = [...certificates]

    if (studentId) {
      filtered = filtered.filter((c) => c.studentId === studentId)
    }
    if (courseId) {
      filtered = filtered.filter((c) => c.courseId === courseId)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single certificate
  http.get('/api/lms/certificates/:id', async ({ params }) => {
    await mockDelay('read')
    const certificate = certificates.find((c) => c.id === params.id)
    if (!certificate) {
      return HttpResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: certificate })
  }),

  // Verify certificate by certificate number
  http.get('/api/lms/certificates/verify/:certNumber', async ({ params }) => {
    await mockDelay('read')
    const certificate = certificates.find((c) => c.certificateNumber === params.certNumber)
    if (!certificate) {
      return HttpResponse.json({
        data: { valid: false, message: 'Certificate not found' }
      })
    }
    return HttpResponse.json({
      data: {
        valid: true,
        certificate,
        message: 'Certificate is valid and verified'
      }
    })
  }),

  // Generate certificate for completed enrollment
  http.post('/api/lms/certificates/generate', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as Record<string, unknown>
    const enrollmentId = body.enrollmentId as string
    const type = (body.type as CertificateType) || 'completion'

    const enrollment = enrollments.find((e) => e.id === enrollmentId)
    if (!enrollment) {
      return HttpResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.status !== 'completed') {
      return HttpResponse.json(
        { error: 'Certificate can only be generated for completed enrollments' },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const existingCert = certificates.find((c) => c.enrollmentId === enrollmentId)
    if (existingCert) {
      return HttpResponse.json({ data: existingCert })
    }

    const course = courses.find((c) => c.id === enrollment.courseId)
    const instructor = instructors.find((i) => i.id === course?.instructorId)

    const certNumber = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    const newCertificate: Certificate = {
      id: `CERT-${Date.now()}`,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName,
      studentId: enrollment.studentId,
      studentName: enrollment.studentName,
      instructorName: instructor?.name || 'Course Instructor',
      type,
      issueDate: new Date().toISOString(),
      certificateNumber: certNumber,
      completionPercentage: 100,
      grade: type === 'excellence' ? 'A+' : type === 'achievement' ? 'A' : 'B',
      hoursCompleted: course?.duration || 30,
      skills: course?.tags || [],
      verificationUrl: `https://verify.paperbook.edu/cert/${certNumber}`,
    }

    certificates.push(newCertificate)
    return HttpResponse.json({ data: newCertificate }, { status: 201 })
  }),
]
