import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  exams,
  subjects,
  gradeScales,
  studentMarks,
  generateId,
  generateMockStudents,
  generateReportCard,
  examTimetables,
  generateClassAnalytics,
  generateStudentProgress,
  coScholasticRecords,
  questionPapers,
} from '../data/exams.data'
import { getUserContext, isStudent, isParent } from '../utils/auth-context'
import type {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
  SubmitMarksRequest,
  GradeScale,
  CreateGradeScaleRequest,
  UpdateGradeScaleRequest,
  StudentMark,
  Subject,
  ExamSlot,
  CreateExamSlotRequest,
  CoScholasticRecord,
  SubmitCoScholasticRequest,
  QuestionPaper,
  CreateQuestionPaperRequest,
} from '@/features/exams/types/exams.types'

export const examsHandlers = [
  // ==================== USER-SCOPED HANDLERS ====================

  // Get student's own marks across all exams
  http.get('/api/exams/my-marks', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isStudent(context) || !context.studentId) {
      return HttpResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')

    let marks = studentMarks.filter((m) => m.studentId === context.studentId)

    if (academicYear) {
      const yearExams = exams.filter((e) => e.academicYear === academicYear)
      const yearExamIds = yearExams.map((e) => e.id)
      marks = marks.filter((m) => yearExamIds.includes(m.examId))
    }

    // Group marks by exam
    const examGroups = marks.reduce((acc, mark) => {
      if (!acc[mark.examId]) {
        const exam = exams.find((e) => e.id === mark.examId)
        acc[mark.examId] = {
          examId: mark.examId,
          examName: exam?.name || 'Unknown Exam',
          marks: [],
        }
      }
      acc[mark.examId].marks.push(mark)
      return acc
    }, {} as Record<string, { examId: string; examName: string; marks: typeof marks }>)

    return HttpResponse.json({ data: Object.values(examGroups) })
  }),

  // Get parent's children marks
  http.get('/api/exams/my-children-marks', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isParent(context)) {
      return HttpResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    if (!context.childIds || context.childIds.length === 0) {
      return HttpResponse.json({ error: 'No children linked to account' }, { status: 404 })
    }

    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')

    // Get marks for each child
    const childrenMarks = context.childIds.map((childId) => {
      let marks = studentMarks.filter((m) => m.studentId === childId)

      if (academicYear) {
        const yearExams = exams.filter((e) => e.academicYear === academicYear)
        const yearExamIds = yearExams.map((e) => e.id)
        marks = marks.filter((m) => yearExamIds.includes(m.examId))
      }

      // Get student info from first mark or use default
      const studentName = marks[0]?.studentName || `Student ${childId}`
      const studentClass = marks[0]?.studentClass || ''
      const studentSection = marks[0]?.studentSection || ''

      // Group marks by exam
      const examGroups = marks.reduce((acc, mark) => {
        if (!acc[mark.examId]) {
          const exam = exams.find((e) => e.id === mark.examId)
          acc[mark.examId] = {
            examId: mark.examId,
            examName: exam?.name || 'Unknown Exam',
            marks: [],
          }
        }
        acc[mark.examId].marks.push(mark)
        return acc
      }, {} as Record<string, { examId: string; examName: string; marks: typeof marks }>)

      return {
        studentId: childId,
        studentName,
        studentClass,
        studentSection,
        exams: Object.values(examGroups),
      }
    })

    return HttpResponse.json({ data: childrenMarks })
  }),

  // Get student's own report card
  http.get('/api/exams/my-report-card', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isStudent(context) || !context.studentId) {
      return HttpResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const examId = url.searchParams.get('examId')

    // Find the most recent published exam if not specified
    const exam = examId
      ? exams.find((e) => e.id === examId)
      : exams.find((e) => e.status === 'results_published')

    if (!exam) {
      return HttpResponse.json({ error: 'No published exam found' }, { status: 404 })
    }

    const reportCard = generateReportCard(context.studentId, exam)
    return HttpResponse.json({ data: reportCard })
  }),

  // ==================== EXAMS ====================

  // Get all exams
  http.get('/api/exams', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const academicYear = url.searchParams.get('academicYear')
    const className = url.searchParams.get('className')
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...exams]

    if (type) {
      filtered = filtered.filter((e) => e.type === type)
    }

    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }

    if (academicYear) {
      filtered = filtered.filter((e) => e.academicYear === academicYear)
    }

    if (className) {
      filtered = filtered.filter((e) => e.applicableClasses.includes(className))
    }

    if (search) {
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(search))
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single exam
  http.get('/api/exams/:id', async ({ params }) => {
    await mockDelay('read')
    const exam = exams.find((e) => e.id === params.id)
    if (!exam) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: exam })
  }),

  // Create exam
  http.post('/api/exams', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateExamRequest

    const newExam: Exam = {
      id: generateId('exam'),
      name: body.name,
      type: body.type,
      academicYear: body.academicYear,
      term: body.term,
      applicableClasses: body.applicableClasses,
      subjects: body.subjects.map((s) => ({
        ...s,
        id: generateId('subj'),
      })),
      startDate: body.startDate,
      endDate: body.endDate,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    exams.unshift(newExam)
    return HttpResponse.json({ data: newExam }, { status: 201 })
  }),

  // Update exam
  http.put('/api/exams/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateExamRequest
    const index = exams.findIndex((e) => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const updatedSubjects = body.subjects
      ? body.subjects.map((s) => ({
          ...s,
          id: generateId('subj'),
        }))
      : exams[index].subjects

    exams[index] = {
      ...exams[index],
      ...body,
      subjects: updatedSubjects,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: exams[index] })
  }),

  // Delete exam
  http.delete('/api/exams/:id', async ({ params }) => {
    await mockDelay('read')
    const index = exams.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }
    exams.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Publish exam results
  http.post('/api/exams/:id/publish', async ({ params }) => {
    await mockDelay('heavy')
    const exam = exams.find((e) => e.id === params.id)
    if (!exam) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    exam.status = 'results_published'
    exam.updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: exam })
  }),

  // ==================== MARKS ====================

  // Get students for marks entry
  http.get('/api/exams/:examId/students', async ({ request, params }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className')
    const section = url.searchParams.get('section')
    const subjectId = url.searchParams.get('subjectId')

    if (!className || !section) {
      return HttpResponse.json({ error: 'Class and section are required' }, { status: 400 })
    }

    const students = generateMockStudents(className, section, 30)

    // Check for existing marks
    const existingMarks = studentMarks.filter(
      (m) =>
        m.examId === params.examId &&
        m.subjectId === subjectId &&
        m.studentClass === className &&
        m.studentSection === section
    )

    const studentsWithMarks = students.map((student) => {
      const mark = existingMarks.find((m) => m.studentId === student.id)
      return {
        ...student,
        marksObtained: mark?.marksObtained,
        isAbsent: mark?.isAbsent,
        remarks: mark?.remarks,
      }
    })

    return HttpResponse.json({ data: studentsWithMarks })
  }),

  // Get exam marks
  http.get('/api/exams/:examId/marks', async ({ request, params }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const subjectId = url.searchParams.get('subjectId')
    const classId = url.searchParams.get('classId')

    let filtered = studentMarks.filter((m) => m.examId === params.examId)

    if (subjectId) {
      filtered = filtered.filter((m) => m.subjectId === subjectId)
    }

    if (classId) {
      filtered = filtered.filter((m) => m.studentClass === classId)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Submit marks
  http.post('/api/exams/:examId/marks', async ({ request, params }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as SubmitMarksRequest
    const exam = exams.find((e) => e.id === params.examId)

    if (!exam) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const subject = exam.subjects.find((s) => s.id === body.subjectId)
    if (!subject) {
      return HttpResponse.json({ error: 'Subject not found in exam' }, { status: 400 })
    }

    let marksSubmitted = 0

    body.marks.forEach((mark) => {
      const existingIndex = studentMarks.findIndex(
        (m) =>
          m.examId === params.examId &&
          m.subjectId === body.subjectId &&
          m.studentId === mark.studentId
      )

      const percentage = (mark.marksObtained / subject.maxMarks) * 100
      const gradeScale = gradeScales[0]
      const gradeRange = gradeScale.ranges.find(
        (r) => percentage >= r.minPercentage && percentage <= r.maxPercentage
      )

      const markData: StudentMark = {
        id: existingIndex >= 0 ? studentMarks[existingIndex].id : generateId('mark'),
        examId: params.examId as string,
        studentId: mark.studentId,
        studentName: faker.person.fullName(),
        studentClass: body.className || '',
        studentSection: body.section || '',
        admissionNumber: `ADM2024${faker.string.numeric(4)}`,
        subjectId: body.subjectId,
        subjectName: subject.name,
        marksObtained: mark.marksObtained,
        maxMarks: subject.maxMarks,
        grade: gradeRange?.grade || 'F',
        isAbsent: mark.isAbsent,
        remarks: mark.remarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        studentMarks[existingIndex] = markData
      } else {
        studentMarks.push(markData)
      }
      marksSubmitted++
    })

    // Update exam status if all marks are entered
    if (exam.status === 'scheduled') {
      exam.status = 'ongoing'
    }

    return HttpResponse.json({ success: true, marksSubmitted })
  }),

  // Get student marks
  http.get('/api/students/:studentId/marks', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')

    let marks = studentMarks.filter((m) => m.studentId === params.studentId)

    if (academicYear) {
      const yearExams = exams.filter((e) => e.academicYear === academicYear)
      const yearExamIds = yearExams.map((e) => e.id)
      marks = marks.filter((m) => yearExamIds.includes(m.examId))
    }

    return HttpResponse.json({ data: marks })
  }),

  // ==================== REPORT CARDS ====================

  // Get report cards for exam
  http.get('/api/exams/:examId/report-cards', async ({ params, request }) => {
    await mockDelay('write')
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')

    const exam = exams.find((e) => e.id === params.examId)
    if (!exam) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Generate report cards for all students in the exam
    const applicableClasses = classId ? [classId] : exam.applicableClasses
    const reportCards: any[] = []

    applicableClasses.forEach((cls) => {
      ['A', 'B'].forEach((section) => {
        const students = generateMockStudents(cls, section, 25)
        students.forEach((student) => {
          reportCards.push(generateReportCard(student.id, exam))
        })
      })
    })

    return HttpResponse.json({ data: reportCards.slice(0, 50) }) // Limit for performance
  }),

  // Get student report card
  http.get('/api/students/:studentId/report-card', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const examId = url.searchParams.get('examId')

    // Find the most recent published exam if not specified
    const exam = examId
      ? exams.find((e) => e.id === examId)
      : exams.find((e) => e.status === 'results_published')

    if (!exam) {
      return HttpResponse.json({ error: 'No published exam found' }, { status: 404 })
    }

    const reportCard = generateReportCard(params.studentId as string, exam)
    return HttpResponse.json({ data: reportCard })
  }),

  // Generate report cards
  http.post('/api/report-cards/generate', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as {
      examId: string
      classId?: string
      studentIds?: string[]
    }

    const exam = exams.find((e) => e.id === body.examId)
    if (!exam) {
      return HttpResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Simulate generation count
    let generatedCount = 0
    if (body.studentIds) {
      generatedCount = body.studentIds.length
    } else if (body.classId) {
      generatedCount = 50 // Approx students in one class (2 sections)
    } else {
      generatedCount = exam.applicableClasses.length * 50
    }

    return HttpResponse.json({ success: true, generatedCount })
  }),

  // Delete report card
  http.delete('/api/report-cards/:id', async ({ params }) => {
    await mockDelay('write')
    // Report cards are generated dynamically, so we just return success
    // In a real implementation, this would delete from a persistent store
    return HttpResponse.json({ success: true })
  }),

  // ==================== GRADE SCALES ====================

  // Get all grade scales
  http.get('/api/grade-scales', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: gradeScales })
  }),

  // Get single grade scale
  http.get('/api/grade-scales/:id', async ({ params }) => {
    await mockDelay('read')
    const scale = gradeScales.find((s) => s.id === params.id)
    if (!scale) {
      return HttpResponse.json({ error: 'Grade scale not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: scale })
  }),

  // Create grade scale
  http.post('/api/grade-scales', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateGradeScaleRequest

    // If setting as default, unset other defaults
    if (body.isDefault) {
      gradeScales.forEach((s) => {
        s.isDefault = false
      })
    }

    const newScale: GradeScale = {
      id: generateId('gs'),
      name: body.name,
      ranges: body.ranges,
      isDefault: body.isDefault || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    gradeScales.push(newScale)
    return HttpResponse.json({ data: newScale }, { status: 201 })
  }),

  // Update grade scale
  http.put('/api/grade-scales/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateGradeScaleRequest
    const index = gradeScales.findIndex((s) => s.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Grade scale not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      gradeScales.forEach((s) => {
        s.isDefault = false
      })
    }

    gradeScales[index] = {
      ...gradeScales[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: gradeScales[index] })
  }),

  // Delete grade scale
  http.delete('/api/grade-scales/:id', async ({ params }) => {
    await mockDelay('read')
    const index = gradeScales.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Grade scale not found' }, { status: 404 })
    }

    // Don't allow deleting the default scale
    if (gradeScales[index].isDefault) {
      return HttpResponse.json(
        { error: 'Cannot delete the default grade scale' },
        { status: 400 }
      )
    }

    gradeScales.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== EXAM TIMETABLE ====================

  // Get exam timetable
  http.get('/api/exams/:examId/timetable', async ({ params }) => {
    await mockDelay('read')
    const examId = params.examId as string
    const exam = exams.find((e) => e.id === examId)
    const slots = examTimetables[examId] || []

    return HttpResponse.json({
      data: {
        examId,
        examName: exam?.name || 'Unknown Exam',
        slots,
      },
    })
  }),

  // Create exam timetable slot
  http.post('/api/exams/:examId/timetable', async ({ params, request }) => {
    await mockDelay('read')
    const examId = params.examId as string
    const body = (await request.json()) as CreateExamSlotRequest
    const exam = exams.find((e) => e.id === examId)
    const subject = exam?.subjects.find((s) => s.id === body.subjectId)

    const newSlot: ExamSlot = {
      id: generateId('slot'),
      examId,
      subjectId: body.subjectId,
      subjectName: subject?.name || '',
      subjectCode: subject?.code || '',
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      room: body.room,
      invigilator: body.invigilator,
      applicableClasses: body.applicableClasses,
    }

    if (!examTimetables[examId]) {
      examTimetables[examId] = []
    }
    examTimetables[examId].push(newSlot)

    return HttpResponse.json({ data: newSlot }, { status: 201 })
  }),

  // ==================== CLASS ANALYTICS ====================

  // Get class analytics for an exam
  http.get('/api/exams/:examId/analytics', async ({ params, request }) => {
    await mockDelay('read')
    const examId = params.examId as string
    const url = new URL(request.url)
    const className = url.searchParams.get('class') || 'Class 10'
    const section = url.searchParams.get('section') || 'A'

    return HttpResponse.json({ data: generateClassAnalytics(examId, className, section) })
  }),

  // ==================== STUDENT PROGRESS ====================

  // Get student progress
  http.get('/api/students/:studentId/progress', async ({ params }) => {
    await mockDelay('read')
    const studentId = params.studentId as string
    const progress = generateStudentProgress(studentId)

    if (!progress) {
      return HttpResponse.json({ error: 'Student progress not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: progress })
  }),

  // ==================== CO-SCHOLASTIC ====================

  // Get co-scholastic records
  http.get('/api/exams/co-scholastic', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const term = url.searchParams.get('term')
    const area = url.searchParams.get('area')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...coScholasticRecords]

    if (studentId) {
      filtered = filtered.filter((r) => r.studentId === studentId)
    }
    if (term) {
      filtered = filtered.filter((r) => r.term === term)
    }
    if (area) {
      filtered = filtered.filter((r) => r.area === area)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Submit co-scholastic records
  http.post('/api/exams/co-scholastic', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as SubmitCoScholasticRequest

    const newRecords: CoScholasticRecord[] = body.records.map((record) => {
      const newRecord: CoScholasticRecord = {
        id: generateId('csr'),
        studentId: body.studentId,
        studentName: '',
        studentClass: '',
        studentSection: '',
        academicYear: '2024-25',
        term: body.term,
        area: record.area,
        grade: record.grade,
        remarks: record.remarks,
        assessedBy: 'Current User',
        assessedAt: new Date().toISOString(),
      }
      coScholasticRecords.push(newRecord)
      return newRecord
    })

    return HttpResponse.json({ data: newRecords }, { status: 201 })
  }),

  // ==================== QUESTION PAPERS ====================

  // Get question papers
  http.get('/api/exams/question-papers', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const examId = url.searchParams.get('examId')
    const subjectId = url.searchParams.get('subjectId')
    const className = url.searchParams.get('className')

    let filtered = [...questionPapers]

    if (examId) {
      filtered = filtered.filter((qp) => qp.examId === examId)
    }
    if (subjectId) {
      filtered = filtered.filter((qp) => qp.subjectId === subjectId)
    }
    if (className) {
      filtered = filtered.filter((qp) => qp.className === className)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single question paper
  http.get('/api/exams/question-papers/:id', async ({ params }) => {
    await mockDelay('read')
    const paper = questionPapers.find((qp) => qp.id === params.id)
    if (!paper) {
      return HttpResponse.json({ error: 'Question paper not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: paper })
  }),

  // Create question paper
  http.post('/api/exams/question-papers', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateQuestionPaperRequest
    const exam = body.examId ? exams.find((e) => e.id === body.examId) : undefined

    const newPaper: QuestionPaper = {
      id: generateId('qp'),
      examId: body.examId,
      examName: exam?.name,
      subjectId: body.subjectId,
      subjectName: body.subjectName,
      subjectCode: body.subjectCode,
      className: body.className,
      academicYear: body.academicYear,
      term: body.term,
      totalMarks: body.totalMarks,
      duration: body.duration,
      difficulty: body.difficulty,
      sections: body.sections,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    questionPapers.push(newPaper)
    return HttpResponse.json({ data: newPaper }, { status: 201 })
  }),

  // Delete question paper
  http.delete('/api/exams/question-papers/:id', async ({ params }) => {
    await mockDelay('read')
    const index = questionPapers.findIndex((qp) => qp.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Question paper not found' }, { status: 404 })
    }
    questionPapers.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
