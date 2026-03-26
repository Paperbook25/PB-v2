import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateExamInput, UpdateExamInput, ListExamsInput, SubmitMarksInput,
  CreateGradeScaleInput, UpdateGradeScaleInput, GenerateReportCardsInput,
  CreateExamSlotInput, SubmitCoScholasticInput, ListCoScholasticInput,
  CreateQuestionPaperInput,
} from '../validators/exam.validators.js'

// ==================== Enum Mapping ====================

const examTypeToDb: Record<string, string> = {
  unit_test: 'et_unit_test', mid_term: 'et_mid_term', quarterly: 'et_quarterly',
  half_yearly: 'et_half_yearly', annual: 'et_annual', practical: 'et_practical',
  online: 'et_online',
}
const examTypeFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(examTypeToDb).map(([k, v]) => [v, k])
)

const examStatusToDb: Record<string, string> = {
  scheduled: 'exs_scheduled', ongoing: 'exs_ongoing',
  completed: 'exs_completed', results_published: 'exs_results_published',
}
const examStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(examStatusToDb).map(([k, v]) => [v, k])
)

const coAreaToDb: Record<string, string> = {
  art: 'csa_art', music: 'csa_music', dance: 'csa_dance', sports: 'csa_sports',
  yoga: 'csa_yoga', discipline: 'csa_discipline', work_education: 'csa_work_education',
  health_education: 'csa_health_education',
}
const coAreaFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(coAreaToDb).map(([k, v]) => [v, k])
)

const paperDiffToDb: Record<string, string> = {
  easy: 'pd_easy', medium: 'pd_medium', hard: 'pd_hard',
}
const paperDiffFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(paperDiffToDb).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

function formatExam(e: any) {
  return {
    id: e.id,
    name: e.name,
    type: examTypeFromDb[e.type] || e.type,
    academicYear: e.academicYear,
    term: e.term,
    applicableClasses: e.applicableClasses,
    subjects: e.subjects,
    startDate: e.startDate,
    endDate: e.endDate,
    status: examStatusFromDb[e.status] || e.status,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }
}

function computeGrade(percentage: number, ranges: any[]): string {
  for (const r of ranges) {
    if (percentage >= r.minPercentage && percentage <= r.maxPercentage) {
      return r.grade
    }
  }
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

async function getDefaultGradeRanges(schoolId: string) {
  const scale = await prisma.gradeScale.findFirst({ where: { isDefault: true, organizationId: schoolId } })
  if (scale) return scale.ranges as any[]
  return [
    { grade: 'A', minPercentage: 90, maxPercentage: 100 },
    { grade: 'B', minPercentage: 80, maxPercentage: 89.99 },
    { grade: 'C', minPercentage: 70, maxPercentage: 79.99 },
    { grade: 'D', minPercentage: 60, maxPercentage: 69.99 },
    { grade: 'F', minPercentage: 0, maxPercentage: 59.99 },
  ]
}

// ==================== Exam CRUD ====================

export async function listExams(schoolId: string, query: ListExamsInput) {
  const { page, limit, type, status, academicYear, className, search } = query
  const where: any = { organizationId: schoolId }

  if (search) {
    where.name = { contains: search }
  }
  if (type && examTypeToDb[type]) where.type = examTypeToDb[type]
  if (status && examStatusToDb[status]) where.status = examStatusToDb[status]
  if (academicYear) where.academicYear = academicYear

  const [total, exams] = await Promise.all([
    prisma.exam.count({ where }),
    prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  // If className filter, filter in application layer (JSON column)
  let filtered = exams
  if (className) {
    filtered = exams.filter(e => {
      const classes = e.applicableClasses as string[]
      return classes && classes.includes(className)
    })
  }

  return {
    data: filtered.map(formatExam),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getExamById(schoolId: string, id: string) {
  const exam = await prisma.exam.findFirst({ where: { id, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')
  return formatExam(exam)
}

export async function createExam(schoolId: string, input: CreateExamInput) {
  const subjects = input.subjects.map(s => ({
    id: s.id || crypto.randomUUID(),
    name: s.name,
    code: s.code,
    maxMarks: s.maxMarks,
    passingMarks: s.passingMarks || Math.ceil(s.maxMarks * 0.33),
  }))

  const exam = await prisma.exam.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      type: examTypeToDb[input.type] as any,
      academicYear: input.academicYear,
      term: input.term,
      applicableClasses: input.applicableClasses,
      subjects,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    },
  })
  return formatExam(exam)
}

export async function updateExam(schoolId: string, id: string, input: UpdateExamInput) {
  const existing = await prisma.exam.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Exam not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.type && examTypeToDb[input.type]) data.type = examTypeToDb[input.type]
  if (input.academicYear !== undefined) data.academicYear = input.academicYear
  if (input.term !== undefined) data.term = input.term
  if (input.applicableClasses !== undefined) data.applicableClasses = input.applicableClasses
  if (input.subjects !== undefined) {
    data.subjects = input.subjects.map(s => ({
      id: s.id || crypto.randomUUID(),
      name: s.name,
      code: s.code,
      maxMarks: s.maxMarks,
      passingMarks: s.passingMarks || Math.ceil(s.maxMarks * 0.33),
    }))
  }
  if (input.startDate) data.startDate = new Date(input.startDate)
  if (input.endDate) data.endDate = new Date(input.endDate)

  const exam = await prisma.exam.update({ where: { id }, data })
  return formatExam(exam)
}

export async function deleteExam(schoolId: string, id: string) {
  const existing = await prisma.exam.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Exam not found')
  await prisma.exam.delete({ where: { id } })
  return { success: true }
}

export async function publishExam(schoolId: string, id: string) {
  const existing = await prisma.exam.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Exam not found')

  const exam = await prisma.exam.update({
    where: { id },
    data: { status: 'exs_results_published' },
  })
  return formatExam(exam)
}

// ==================== Marks ====================

export async function getStudentsForMarks(schoolId: string, examId: string, query: { className?: string; section?: string; subjectId?: string }) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  if (!query.className || !query.section) {
    throw AppError.badRequest('className and section are required')
  }

  const cls = await prisma.class.findFirst({ where: { name: query.className, organizationId: schoolId } })
  if (!cls) throw AppError.badRequest(`Class '${query.className}' not found`)

  const sec = await prisma.section.findFirst({ where: { classId: cls.id, name: query.section, organizationId: schoolId } })
  if (!sec) throw AppError.badRequest(`Section '${query.section}' not found`)

  const students = await prisma.student.findMany({
    where: { classId: cls.id, sectionId: sec.id, status: 'active', organizationId: schoolId },
    orderBy: { rollNumber: 'asc' },
  })

  // Find existing marks
  const existingMarks = query.subjectId
    ? await prisma.studentMark.findMany({
        where: { examId, subjectId: query.subjectId, studentId: { in: students.map(s => s.id) } },
      })
    : []
  const marksMap = new Map(existingMarks.map(m => [m.studentId, m]))

  return {
    data: students.map(s => {
      const mark = marksMap.get(s.id)
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        enrollmentNumber: s.admissionNumber,
        marksObtained: mark?.marksObtained,
        isAbsent: mark?.isAbsent,
        remarks: mark?.remarks,
      }
    }),
  }
}

export async function getMarks(schoolId: string, examId: string, query: { subjectId?: string; classId?: string }) {
  const where: any = { examId, organizationId: schoolId }
  if (query.subjectId) where.subjectId = query.subjectId

  const marks = await prisma.studentMark.findMany({ where, orderBy: { createdAt: 'desc' } })

  // Enrich with student data
  const studentIds = [...new Set(marks.map(m => m.studentId))]
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: { class: true, section: true },
  })
  const studentMap = new Map(students.map(s => [s.id, s]))

  // Get subject info
  const subjectIds = [...new Set(marks.map(m => m.subjectId))]
  const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } } })
  const subjectMap = new Map(subjects.map(s => [s.id, s]))

  return {
    data: marks.map(m => {
      const student = studentMap.get(m.studentId)
      const subject = subjectMap.get(m.subjectId)
      return {
        id: m.id,
        examId: m.examId,
        studentId: m.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : '',
        studentClass: student?.class?.name || '',
        studentSection: student?.section?.name || '',
        admissionNumber: student?.admissionNumber || '',
        subjectId: m.subjectId,
        subjectName: subject?.name || '',
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade,
        isAbsent: m.isAbsent,
        remarks: m.remarks,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }
    }),
  }
}

export async function submitMarks(schoolId: string, examId: string, input: SubmitMarksInput) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  const subjects = exam.subjects as any[]
  const subjectDef = subjects.find((s: any) => s.id === input.subjectId)
  const maxMarks = subjectDef?.maxMarks || 100

  const gradeRanges = await getDefaultGradeRanges(schoolId)

  let count = 0
  for (const mark of input.marks) {
    const percentage = (mark.marksObtained / maxMarks) * 100
    const grade = mark.isAbsent ? null : computeGrade(percentage, gradeRanges)

    await prisma.studentMark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId,
          studentId: mark.studentId,
          subjectId: input.subjectId,
        },
      },
      create: {
        examId,
        studentId: mark.studentId,
        subjectId: input.subjectId,
        marksObtained: mark.marksObtained,
        maxMarks,
        grade,
        isAbsent: mark.isAbsent || false,
        remarks: mark.remarks,
      },
      update: {
        marksObtained: mark.marksObtained,
        maxMarks,
        grade,
        isAbsent: mark.isAbsent || false,
        remarks: mark.remarks,
      },
    })
    count++
  }

  return { success: true, marksSubmitted: count }
}

export async function getStudentMarks(schoolId: string, studentId: string, query: { academicYear?: string }) {
  const where: any = { studentId, organizationId: schoolId }
  if (query.academicYear) {
    const exams = await prisma.exam.findMany({
      where: { academicYear: query.academicYear, organizationId: schoolId },
      select: { id: true },
    })
    where.examId = { in: exams.map(e => e.id) }
  }

  const marks = await prisma.studentMark.findMany({ where })

  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
    include: { class: true, section: true },
  })

  const subjectIds = [...new Set(marks.map(m => m.subjectId))]
  const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } } })
  const subjectMap = new Map(subjects.map(s => [s.id, s]))

  return {
    data: marks.map(m => {
      const subject = subjectMap.get(m.subjectId)
      return {
        id: m.id,
        examId: m.examId,
        studentId: m.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : '',
        studentClass: student?.class?.name || '',
        studentSection: student?.section?.name || '',
        admissionNumber: student?.admissionNumber || '',
        subjectId: m.subjectId,
        subjectName: subject?.name || '',
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade,
        isAbsent: m.isAbsent,
        remarks: m.remarks,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }
    }),
  }
}

// ==================== Report Cards ====================

export async function getReportCards(schoolId: string, examId: string, query: { classId?: string }) {
  const where: any = { examId, organizationId: schoolId }
  if (query.classId) {
    const cls = await prisma.class.findFirst({ where: { id: query.classId, organizationId: schoolId } })
    if (cls) where.studentClass = cls.name
  }

  const cards = await prisma.reportCard.findMany({ where, orderBy: { rank: 'asc' } })
  return { data: cards }
}

export async function getStudentReportCard(schoolId: string, studentId: string, query: { examId?: string }) {
  const where: any = { studentId, organizationId: schoolId }
  if (query.examId) where.examId = query.examId

  const card = await prisma.reportCard.findFirst({ where, orderBy: { generatedAt: 'desc' } })
  if (!card) throw AppError.notFound('Report card not found')
  return card
}

export async function generateReportCards(schoolId: string, input: GenerateReportCardsInput) {
  const exam = await prisma.exam.findFirst({ where: { id: input.examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  const gradeRanges = await getDefaultGradeRanges(schoolId)
  const examSubjects = exam.subjects as any[]

  // Get marks for this exam
  const marksWhere: any = { examId: input.examId, organizationId: schoolId }
  const allMarks = await prisma.studentMark.findMany({ where: marksWhere })

  // Group marks by student
  const marksByStudent = new Map<string, typeof allMarks>()
  for (const m of allMarks) {
    if (!marksByStudent.has(m.studentId)) marksByStudent.set(m.studentId, [])
    marksByStudent.get(m.studentId)!.push(m)
  }

  // Filter by studentIds if provided
  let studentIds = [...marksByStudent.keys()]
  if (input.studentIds && input.studentIds.length > 0) {
    studentIds = studentIds.filter(id => input.studentIds!.includes(id))
  }

  // Get student details
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds }, organizationId: schoolId },
    include: { class: true, section: true },
  })

  // If classId filter, further filter
  if (input.classId) {
    const cls = await prisma.class.findFirst({ where: { id: input.classId, organizationId: schoolId } })
    if (cls) {
      const filtered = students.filter(s => s.classId === input.classId)
      studentIds = filtered.map(s => s.id)
    }
  }

  const studentMap = new Map(students.map(s => [s.id, s]))
  const subjectMap = new Map<string, any>()
  const dbSubjects = await prisma.subject.findMany()
  for (const s of dbSubjects) subjectMap.set(s.id, s)

  // Compute totals for ranking
  const totals: { studentId: string; totalObtained: number; totalMarks: number }[] = []
  for (const sid of studentIds) {
    const marks = marksByStudent.get(sid) || []
    const totalObtained = marks.reduce((sum, m) => sum + (m.isAbsent ? 0 : m.marksObtained), 0)
    const totalMarks = marks.reduce((sum, m) => sum + m.maxMarks, 0)
    totals.push({ studentId: sid, totalObtained, totalMarks })
  }
  totals.sort((a, b) => b.totalObtained - a.totalObtained)

  let generatedCount = 0
  for (let i = 0; i < totals.length; i++) {
    const { studentId, totalObtained, totalMarks } = totals[i]
    const student = studentMap.get(studentId)
    if (!student) continue

    const marks = marksByStudent.get(studentId) || []
    const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0
    const grade = computeGrade(percentage, gradeRanges)

    const subjects = marks.map(m => {
      const sub = subjectMap.get(m.subjectId)
      const examSub = examSubjects.find((es: any) => es.id === m.subjectId)
      return {
        name: sub?.name || examSub?.name || '',
        code: sub?.code || examSub?.code || '',
        marksObtained: m.isAbsent ? 0 : m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade || '',
        passingMarks: examSub?.passingMarks || Math.ceil(m.maxMarks * 0.33),
      }
    })

    await prisma.reportCard.upsert({
      where: { examId_studentId: { examId: input.examId, studentId } },
      create: {
        examId: input.examId,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentClass: student.class?.name || '',
        studentSection: student.section?.name || '',
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        academicYear: exam.academicYear,
        term: exam.term,
        examName: exam.name,
        subjects,
        totalMarks,
        totalObtained,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        rank: i + 1,
      },
      update: {
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentClass: student.class?.name || '',
        studentSection: student.section?.name || '',
        subjects,
        totalMarks,
        totalObtained,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        rank: i + 1,
      },
    })
    generatedCount++
  }

  return { success: true, generatedCount }
}

export async function deleteReportCard(schoolId: string, id: string) {
  const existing = await prisma.reportCard.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Report card not found')
  await prisma.reportCard.delete({ where: { id } })
  return { success: true }
}

// ==================== Grade Scales ====================

export async function listGradeScales(schoolId: string) {
  const scales = await prisma.gradeScale.findMany({ where: { organizationId: schoolId }, orderBy: { createdAt: 'desc' } })
  return { data: scales }
}

export async function getGradeScaleById(schoolId: string, id: string) {
  const scale = await prisma.gradeScale.findFirst({ where: { id, organizationId: schoolId } })
  if (!scale) throw AppError.notFound('Grade scale not found')
  return scale
}

export async function createGradeScale(schoolId: string, input: CreateGradeScaleInput) {
  if (input.isDefault) {
    await prisma.gradeScale.updateMany({ where: { isDefault: true, organizationId: schoolId }, data: { isDefault: false } })
  }
  const scale = await prisma.gradeScale.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      ranges: input.ranges,
      isDefault: input.isDefault || false,
    },
  })
  return scale
}

export async function updateGradeScale(schoolId: string, id: string, input: UpdateGradeScaleInput) {
  const existing = await prisma.gradeScale.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Grade scale not found')

  if (input.isDefault) {
    await prisma.gradeScale.updateMany({ where: { isDefault: true, organizationId: schoolId }, data: { isDefault: false } })
  }

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.ranges !== undefined) data.ranges = input.ranges
  if (input.isDefault !== undefined) data.isDefault = input.isDefault

  const scale = await prisma.gradeScale.update({ where: { id }, data })
  return scale
}

export async function deleteGradeScale(schoolId: string, id: string) {
  const existing = await prisma.gradeScale.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Grade scale not found')
  if (existing.isDefault) throw AppError.badRequest('Cannot delete the default grade scale')
  await prisma.gradeScale.delete({ where: { id } })
  return { success: true }
}

// ==================== Exam Timetable ====================

export async function getExamTimetable(schoolId: string, examId: string) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  const slots = await prisma.examSlot.findMany({
    where: { examId },
    orderBy: { date: 'asc' },
  })

  return {
    data: {
      examId: exam.id,
      examName: exam.name,
      slots: slots.map(s => ({
        id: s.id,
        examId: s.examId,
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
        invigilator: s.invigilator,
        applicableClasses: s.applicableClasses,
      })),
    },
  }
}

export async function createExamSlot(schoolId: string, examId: string, input: CreateExamSlotInput) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  // Try to resolve subject name/code from Subject table
  let subjectName = ''
  let subjectCode = ''
  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } })
  if (subject) {
    subjectName = subject.name
    subjectCode = subject.code
  } else {
    const examSubjects = exam.subjects as any[]
    const es = examSubjects.find((s: any) => s.id === input.subjectId)
    if (es) {
      subjectName = es.name
      subjectCode = es.code
    }
  }

  const slot = await prisma.examSlot.create({
    data: {
      examId,
      subjectId: input.subjectId,
      subjectName,
      subjectCode,
      date: new Date(input.date),
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      invigilator: input.invigilator,
      applicableClasses: input.applicableClasses || (exam.applicableClasses as any) || [],
    },
  })

  return {
    id: slot.id,
    examId: slot.examId,
    subjectId: slot.subjectId,
    subjectName: slot.subjectName,
    subjectCode: slot.subjectCode,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    invigilator: slot.invigilator,
    applicableClasses: slot.applicableClasses,
  }
}

// ==================== Analytics ====================

export async function getExamAnalytics(schoolId: string, examId: string, query: { class?: string; section?: string }) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, organizationId: schoolId } })
  if (!exam) throw AppError.notFound('Exam not found')

  const marks = await prisma.studentMark.findMany({ where: { examId, organizationId: schoolId } })
  const studentIds = [...new Set(marks.map(m => m.studentId))]
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: { class: true, section: true },
  })
  const studentMap = new Map(students.map(s => [s.id, s]))

  // Filter by class/section if provided
  let filteredMarks = marks
  if (query.class) {
    const matchStudents = students.filter(s => s.class?.name === query.class)
    if (query.section) {
      const sectionStudents = matchStudents.filter(s => s.section?.name === query.section)
      const sids = new Set(sectionStudents.map(s => s.id))
      filteredMarks = marks.filter(m => sids.has(m.studentId))
    } else {
      const sids = new Set(matchStudents.map(s => s.id))
      filteredMarks = marks.filter(m => sids.has(m.studentId))
    }
  }

  const examSubjects = exam.subjects as any[]
  const subjectIds = [...new Set(filteredMarks.map(m => m.subjectId))]

  // Subject-wise stats
  const subjectStats = subjectIds.map(sid => {
    const subMarks = filteredMarks.filter(m => m.subjectId === sid && !m.isAbsent)
    const esSub = examSubjects.find((s: any) => s.id === sid)
    const passingMarks = esSub?.passingMarks || 33
    const avg = subMarks.length > 0
      ? subMarks.reduce((sum, m) => sum + m.marksObtained, 0) / subMarks.length
      : 0
    const passed = subMarks.filter(m => m.marksObtained >= passingMarks).length

    return {
      subjectId: sid,
      subjectName: esSub?.name || '',
      average: Math.round(avg * 100) / 100,
      highest: subMarks.length > 0 ? Math.max(...subMarks.map(m => m.marksObtained)) : 0,
      lowest: subMarks.length > 0 ? Math.min(...subMarks.map(m => m.marksObtained)) : 0,
      passPercentage: subMarks.length > 0 ? Math.round((passed / subMarks.length) * 100) : 0,
    }
  })

  // Overall class stats
  const nonAbsent = filteredMarks.filter(m => !m.isAbsent)
  const classAvg = nonAbsent.length > 0
    ? nonAbsent.reduce((sum, m) => sum + m.marksObtained, 0) / nonAbsent.length
    : 0

  // Grade distribution
  const gradeRanges = await getDefaultGradeRanges(schoolId)
  const gradeDist: Record<string, number> = {}
  // Get per-student percentage
  const perStudent = new Map<string, { total: number; obtained: number }>()
  for (const m of filteredMarks) {
    if (!perStudent.has(m.studentId)) perStudent.set(m.studentId, { total: 0, obtained: 0 })
    const s = perStudent.get(m.studentId)!
    s.total += m.maxMarks
    s.obtained += m.isAbsent ? 0 : m.marksObtained
  }
  for (const [, val] of perStudent) {
    const pct = val.total > 0 ? (val.obtained / val.total) * 100 : 0
    const grade = computeGrade(pct, gradeRanges)
    gradeDist[grade] = (gradeDist[grade] || 0) + 1
  }

  // Toppers
  const sorted = [...perStudent.entries()]
    .map(([sid, v]) => ({
      studentId: sid,
      student: studentMap.get(sid),
      percentage: v.total > 0 ? (v.obtained / v.total) * 100 : 0,
      totalObtained: v.obtained,
      totalMarks: v.total,
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const toppers = sorted.slice(0, 10).map((t, idx) => ({
    rank: idx + 1,
    studentId: t.studentId,
    studentName: t.student ? `${t.student.firstName} ${t.student.lastName}`.trim() : '',
    percentage: Math.round(t.percentage * 100) / 100,
    totalObtained: t.totalObtained,
    totalMarks: t.totalMarks,
  }))

  const totalStudents = perStudent.size
  const passedStudents = sorted.filter(s => s.percentage >= 33).length

  return {
    data: {
      classAverage: Math.round(classAvg * 100) / 100,
      passPercentage: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
      totalStudents,
      gradeDistribution: gradeDist,
      subjectStats,
      toppers,
    },
  }
}

// ==================== Student Progress ====================

export async function getStudentProgress(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
    include: { class: true, section: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  const marks = await prisma.studentMark.findMany({
    where: { studentId, organizationId: schoolId },
    include: { exam: true },
  })

  // Group by exam
  const examMap = new Map<string, typeof marks>()
  for (const m of marks) {
    if (!examMap.has(m.examId)) examMap.set(m.examId, [])
    examMap.get(m.examId)!.push(m)
  }

  const terms = [...examMap.entries()].map(([examId, examMarks]) => {
    const exam = examMarks[0]?.exam
    const totalObtained = examMarks.reduce((sum, m) => sum + (m.isAbsent ? 0 : m.marksObtained), 0)
    const totalMarks = examMarks.reduce((sum, m) => sum + m.maxMarks, 0)
    const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0

    return {
      examId,
      examName: exam?.name || '',
      term: exam?.term || '',
      totalObtained,
      totalMarks,
      percentage: Math.round(percentage * 100) / 100,
    }
  })

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (terms.length >= 2) {
    const last = terms[terms.length - 1].percentage
    const prev = terms[terms.length - 2].percentage
    if (last > prev + 2) trend = 'improving'
    else if (last < prev - 2) trend = 'declining'
  }

  return {
    data: {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      studentClass: student.class?.name || '',
      studentSection: student.section?.name || '',
      terms,
      trend,
    },
  }
}

// ==================== Co-Scholastic ====================

export async function listCoScholastic(schoolId: string, query: ListCoScholasticInput) {
  const { page, limit, studentId, term, area } = query
  const where: any = { organizationId: schoolId }
  if (studentId) where.studentId = studentId
  if (term) where.term = term
  if (area && coAreaToDb[area]) where.area = coAreaToDb[area]

  const [total, records] = await Promise.all([
    prisma.coScholasticRecord.count({ where }),
    prisma.coScholasticRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  // Enrich with student data
  const studentIds = [...new Set(records.map(r => r.studentId))]
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: { class: true, section: true },
  })
  const studentMap = new Map(students.map(s => [s.id, s]))

  return {
    data: records.map(r => {
      const student = studentMap.get(r.studentId)
      return {
        id: r.id,
        studentId: r.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : '',
        studentClass: student?.class?.name || '',
        studentSection: student?.section?.name || '',
        academicYear: r.academicYear,
        term: r.term,
        area: coAreaFromDb[r.area] || r.area,
        grade: r.grade,
        remarks: r.remarks,
        assessedBy: r.assessedBy,
        assessedAt: r.assessedAt,
      }
    }),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function submitCoScholastic(schoolId: string, input: SubmitCoScholasticInput, assessedBy: string) {
  const student = await prisma.student.findFirst({
    where: { id: input.studentId, organizationId: schoolId },
    include: { class: true, section: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  // Get current academic year
  const currentAY = await prisma.academicYear.findFirst({ where: { isCurrent: true, organizationId: schoolId } })
  const academicYear = currentAY?.name || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`

  const results = []
  for (const record of input.records) {
    const area = coAreaToDb[record.area]
    if (!area) continue

    const created = await prisma.coScholasticRecord.upsert({
      where: {
        studentId_academicYear_term_area: {
          studentId: input.studentId,
          academicYear,
          term: input.term,
          area: area as any,
        },
      },
      create: {
        studentId: input.studentId,
        academicYear,
        term: input.term,
        area: area as any,
        grade: record.grade,
        remarks: record.remarks,
        assessedBy,
      },
      update: {
        grade: record.grade,
        remarks: record.remarks,
        assessedBy,
      },
    })

    results.push({
      id: created.id,
      studentId: created.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      studentClass: student.class?.name || '',
      studentSection: student.section?.name || '',
      academicYear: created.academicYear,
      term: created.term,
      area: coAreaFromDb[created.area] || created.area,
      grade: created.grade,
      remarks: created.remarks,
      assessedBy: created.assessedBy,
      assessedAt: created.assessedAt,
    })
  }

  return { data: results }
}

// ==================== Question Papers ====================

export async function listQuestionPapers(schoolId: string, query: { examId?: string; subjectId?: string; className?: string }) {
  const where: any = { organizationId: schoolId }
  if (query.examId) where.examId = query.examId
  if (query.subjectId) where.subjectId = query.subjectId
  if (query.className) where.className = query.className

  const papers = await prisma.questionPaper.findMany({
    where,
    include: { exam: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: papers.map(p => ({
      id: p.id,
      examId: p.examId,
      examName: (p as any).exam?.name || null,
      subjectId: p.subjectId,
      subjectName: p.subjectName,
      subjectCode: p.subjectCode,
      className: p.className,
      academicYear: p.academicYear,
      term: p.term,
      totalMarks: p.totalMarks,
      duration: p.duration,
      difficulty: paperDiffFromDb[p.difficulty] || p.difficulty,
      sections: p.sections,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  }
}

export async function getQuestionPaperById(schoolId: string, id: string) {
  const paper = await prisma.questionPaper.findFirst({
    where: { id },
    include: { exam: { select: { name: true } } },
  })
  if (!paper) throw AppError.notFound('Question paper not found')

  return {
    id: paper.id,
    examId: paper.examId,
    examName: (paper as any).exam?.name || null,
    subjectId: paper.subjectId,
    subjectName: paper.subjectName,
    subjectCode: paper.subjectCode,
    className: paper.className,
    academicYear: paper.academicYear,
    term: paper.term,
    totalMarks: paper.totalMarks,
    duration: paper.duration,
    difficulty: paperDiffFromDb[paper.difficulty] || paper.difficulty,
    sections: paper.sections,
    createdBy: paper.createdBy,
    createdAt: paper.createdAt,
    updatedAt: paper.updatedAt,
  }
}

export async function createQuestionPaper(schoolId: string, input: CreateQuestionPaperInput, createdBy: string) {
  const paper = await prisma.questionPaper.create({
    data: {
      examId: input.examId || null,
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      subjectCode: input.subjectCode,
      className: input.className,
      academicYear: input.academicYear,
      term: input.term,
      totalMarks: input.totalMarks,
      duration: input.duration,
      difficulty: (paperDiffToDb[input.difficulty || 'medium'] || 'pd_medium') as any,
      sections: input.sections,
      createdBy,
    },
    include: { exam: { select: { name: true } } },
  })

  return {
    id: paper.id,
    examId: paper.examId,
    examName: (paper as any).exam?.name || null,
    subjectId: paper.subjectId,
    subjectName: paper.subjectName,
    subjectCode: paper.subjectCode,
    className: paper.className,
    academicYear: paper.academicYear,
    term: paper.term,
    totalMarks: paper.totalMarks,
    duration: paper.duration,
    difficulty: paperDiffFromDb[paper.difficulty] || paper.difficulty,
    sections: paper.sections,
    createdBy: paper.createdBy,
    createdAt: paper.createdAt,
    updatedAt: paper.updatedAt,
  }
}

export async function deleteQuestionPaper(schoolId: string, id: string) {
  const existing = await prisma.questionPaper.findFirst({ where: { id } })
  if (!existing) throw AppError.notFound('Question paper not found')
  await prisma.questionPaper.delete({ where: { id } })
  return { success: true }
}

// ==================== User-Scoped ====================

export async function getMyMarks(schoolId: string, userId: string, query: { academicYear?: string }) {
  // Find user → studentId
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.studentId) throw AppError.forbidden('Not a student user')

  // Find student by user.studentId field (which might be the student record id or admission number)
  let student = await prisma.student.findFirst({ where: { id: user.studentId, organizationId: schoolId } })
  if (!student) {
    student = await prisma.student.findFirst({ where: { admissionNumber: user.studentId, organizationId: schoolId } })
  }
  if (!student) throw AppError.notFound('Student not found')

  const where: any = { studentId: student.id, organizationId: schoolId }
  if (query.academicYear) {
    const exams = await prisma.exam.findMany({
      where: { academicYear: query.academicYear, organizationId: schoolId },
      select: { id: true, name: true },
    })
    where.examId = { in: exams.map(e => e.id) }
  }

  const marks = await prisma.studentMark.findMany({ where, include: { exam: true } })

  // Group by exam
  const examGroups = new Map<string, { examName: string; marks: any[] }>()
  for (const m of marks) {
    if (!examGroups.has(m.examId)) {
      examGroups.set(m.examId, { examName: m.exam?.name || '', marks: [] })
    }
    const subjectIds = [...new Set(marks.map(mk => mk.subjectId))]
    const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } } })
    const subjectMap = new Map(subjects.map(s => [s.id, s]))
    const sub = subjectMap.get(m.subjectId)

    examGroups.get(m.examId)!.marks.push({
      id: m.id,
      examId: m.examId,
      studentId: m.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      studentClass: '',
      studentSection: '',
      admissionNumber: student.admissionNumber,
      subjectId: m.subjectId,
      subjectName: sub?.name || '',
      marksObtained: m.marksObtained,
      maxMarks: m.maxMarks,
      grade: m.grade,
      isAbsent: m.isAbsent,
      remarks: m.remarks,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })
  }

  return {
    data: [...examGroups.entries()].map(([examId, group]) => ({
      examId,
      examName: group.examName,
      marks: group.marks,
    })),
  }
}

export async function getMyChildrenMarks(schoolId: string, userId: string, query: { academicYear?: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.childIds) throw AppError.forbidden('Not a parent user')

  let childIdsArr: string[]
  try {
    childIdsArr = JSON.parse(user.childIds)
  } catch {
    throw AppError.notFound('No children found')
  }

  const children = await prisma.student.findMany({
    where: { id: { in: childIdsArr }, organizationId: schoolId },
    include: { class: true, section: true },
  })

  if (children.length === 0) throw AppError.notFound('No children found')

  const results = []
  for (const child of children) {
    const where: any = { studentId: child.id, organizationId: schoolId }
    if (query.academicYear) {
      const exams = await prisma.exam.findMany({
        where: { academicYear: query.academicYear, organizationId: schoolId },
        select: { id: true },
      })
      where.examId = { in: exams.map(e => e.id) }
    }

    const marks = await prisma.studentMark.findMany({ where, include: { exam: true } })
    const subjectIds = [...new Set(marks.map(m => m.subjectId))]
    const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } } })
    const subjectMap = new Map(subjects.map(s => [s.id, s]))

    const examGroups = new Map<string, { examName: string; marks: any[] }>()
    for (const m of marks) {
      if (!examGroups.has(m.examId)) {
        examGroups.set(m.examId, { examName: m.exam?.name || '', marks: [] })
      }
      const sub = subjectMap.get(m.subjectId)
      examGroups.get(m.examId)!.marks.push({
        id: m.id,
        examId: m.examId,
        studentId: m.studentId,
        subjectId: m.subjectId,
        subjectName: sub?.name || '',
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade,
        isAbsent: m.isAbsent,
      })
    }

    results.push({
      studentId: child.id,
      studentName: `${child.firstName} ${child.lastName}`.trim(),
      studentClass: child.class?.name || '',
      studentSection: child.section?.name || '',
      exams: [...examGroups.entries()].map(([examId, group]) => ({
        examId,
        examName: group.examName,
        marks: group.marks,
      })),
    })
  }

  return { data: results }
}

export async function getMyReportCard(schoolId: string, userId: string, query: { examId?: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.studentId) throw AppError.forbidden('Not a student user')

  let student = await prisma.student.findFirst({ where: { id: user.studentId, organizationId: schoolId } })
  if (!student) {
    student = await prisma.student.findFirst({ where: { admissionNumber: user.studentId, organizationId: schoolId } })
  }
  if (!student) throw AppError.notFound('Student not found')

  const where: any = { studentId: student.id, organizationId: schoolId }
  if (query.examId) where.examId = query.examId

  const card = await prisma.reportCard.findFirst({ where, orderBy: { generatedAt: 'desc' } })
  if (!card) throw AppError.notFound('Report card not found')
  return card
}
