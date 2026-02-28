import { faker } from '@faker-js/faker'
import type {
  Exam,
  StudentMark,
  ReportCard,
  GradeScale,
  Subject,
  ExamType,
  ExamStatus,
  ExamSlot,
  ExamTimetable,
  ClassAnalytics,
  SubjectAnalytics,
  StudentProgress,
  TermProgress,
  CoScholasticRecord,
  CoScholasticArea,
  CoScholasticGrade,
  QuestionPaper,
  PaperSection,
  PaperDifficulty,
} from '@/features/exams/types/exams.types'
import { DEFAULT_GRADE_SCALE } from '@/features/exams/types/exams.types'

// ==================== SUBJECTS ====================

export const subjects: Subject[] = [
  { id: 'subj_001', name: 'English', code: 'ENG', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_002', name: 'Hindi', code: 'HIN', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_003', name: 'Mathematics', code: 'MATH', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_004', name: 'Science', code: 'SCI', type: 'both', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_005', name: 'Social Studies', code: 'SST', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_006', name: 'Computer Science', code: 'CS', type: 'both', maxMarks: 100, passingMarks: 35 },
  { id: 'subj_007', name: 'Physical Education', code: 'PE', type: 'practical', maxMarks: 100, passingMarks: 35 },
]

// ==================== EXAMS ====================

const examTypes: ExamType[] = ['unit_test', 'mid_term', 'quarterly', 'half_yearly', 'annual']
const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']

export const exams: Exam[] = [
  {
    id: 'exam_001',
    name: 'First Unit Test',
    type: 'unit_test',
    academicYear: '2024-25',
    term: 'Term 1',
    applicableClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    subjects: subjects.slice(0, 5),
    startDate: '2024-07-15',
    endDate: '2024-07-20',
    status: 'results_published',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  },
  {
    id: 'exam_002',
    name: 'Mid Term Examination',
    type: 'mid_term',
    academicYear: '2024-25',
    term: 'Term 1',
    applicableClasses: classes,
    subjects: subjects,
    startDate: '2024-09-10',
    endDate: '2024-09-20',
    status: 'results_published',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 14 }).toISOString(),
  },
  {
    id: 'exam_003',
    name: 'Second Unit Test',
    type: 'unit_test',
    academicYear: '2024-25',
    term: 'Term 2',
    applicableClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    subjects: subjects.slice(0, 5),
    startDate: '2024-11-05',
    endDate: '2024-11-10',
    status: 'completed',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
  {
    id: 'exam_004',
    name: 'Half Yearly Examination',
    type: 'half_yearly',
    academicYear: '2024-25',
    term: 'Term 2',
    applicableClasses: classes,
    subjects: subjects,
    startDate: '2024-12-10',
    endDate: '2024-12-22',
    status: 'scheduled',
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
  {
    id: 'exam_005',
    name: 'Third Unit Test',
    type: 'unit_test',
    academicYear: '2024-25',
    term: 'Term 3',
    applicableClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    subjects: subjects.slice(0, 5),
    startDate: '2025-02-01',
    endDate: '2025-02-06',
    status: 'scheduled',
    createdAt: faker.date.recent({ days: 14 }).toISOString(),
    updatedAt: faker.date.recent({ days: 3 }).toISOString(),
  },
  {
    id: 'exam_006',
    name: 'Annual Examination',
    type: 'annual',
    academicYear: '2024-25',
    term: 'Term 3',
    applicableClasses: classes,
    subjects: subjects,
    startDate: '2025-03-10',
    endDate: '2025-03-25',
    status: 'scheduled',
    createdAt: faker.date.recent({ days: 7 }).toISOString(),
    updatedAt: faker.date.recent({ days: 1 }).toISOString(),
  },
]

// ==================== GRADE SCALES ====================

export const gradeScales: GradeScale[] = [
  {
    id: 'gs_001',
    name: 'CBSE 10-Point Scale',
    isDefault: true,
    ranges: DEFAULT_GRADE_SCALE,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 60 }).toISOString(),
  },
  {
    id: 'gs_002',
    name: 'ICSE Scale',
    isDefault: false,
    ranges: [
      { minPercentage: 90, maxPercentage: 100, grade: 'A1', gradePoint: 10, description: 'Outstanding' },
      { minPercentage: 80, maxPercentage: 89.99, grade: 'A2', gradePoint: 9, description: 'Excellent' },
      { minPercentage: 70, maxPercentage: 79.99, grade: 'B1', gradePoint: 8, description: 'Very Good' },
      { minPercentage: 60, maxPercentage: 69.99, grade: 'B2', gradePoint: 7, description: 'Good' },
      { minPercentage: 50, maxPercentage: 59.99, grade: 'C1', gradePoint: 6, description: 'Above Average' },
      { minPercentage: 40, maxPercentage: 49.99, grade: 'C2', gradePoint: 5, description: 'Average' },
      { minPercentage: 35, maxPercentage: 39.99, grade: 'D', gradePoint: 4, description: 'Pass' },
      { minPercentage: 0, maxPercentage: 34.99, grade: 'E', gradePoint: 0, description: 'Fail' },
    ],
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 90 }).toISOString(),
  },
]

// ==================== MOCK STUDENTS (for marks entry) ====================

export interface MockStudent {
  id: string
  name: string
  admissionNumber: string
  class: string
  section: string
  rollNumber: number
}

export function generateMockStudents(className: string, section: string, count: number = 30): MockStudent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    admissionNumber: `ADM2024${faker.string.numeric(4)}`,
    class: className,
    section,
    rollNumber: i + 1,
  }))
}

// ==================== STUDENT MARKS ====================

export const studentMarks: StudentMark[] = []

// Generate marks for published exams
function generateMarksForExam(exam: Exam) {
  if (exam.status !== 'results_published' && exam.status !== 'completed') return

  exam.applicableClasses.forEach((cls) => {
    ['A', 'B'].forEach((section) => {
      const students = generateMockStudents(cls, section, 25)
      students.forEach((student) => {
        exam.subjects.forEach((subject) => {
          const isAbsent = Math.random() < 0.02 // 2% absent rate
          const marksObtained = isAbsent ? 0 : Math.floor(Math.random() * 60) + 40 // 40-100 marks

          studentMarks.push({
            id: faker.string.uuid(),
            examId: exam.id,
            studentId: student.id,
            studentName: student.name,
            studentClass: cls,
            studentSection: section,
            admissionNumber: student.admissionNumber,
            subjectId: subject.id,
            subjectName: subject.name,
            marksObtained,
            maxMarks: subject.maxMarks,
            grade: calculateGrade(marksObtained, subject.maxMarks),
            isAbsent,
            createdAt: faker.date.recent({ days: 30 }).toISOString(),
            updatedAt: faker.date.recent({ days: 7 }).toISOString(),
          })
        })
      })
    })
  })
}

function calculateGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100
  const scale = gradeScales[0] // Use default scale
  for (const range of scale.ranges) {
    if (percentage >= range.minPercentage && percentage <= range.maxPercentage) {
      return range.grade
    }
  }
  return 'F'
}

// Generate marks for published exams
exams
  .filter((e) => e.status === 'results_published' || e.status === 'completed')
  .forEach(generateMarksForExam)

// ==================== HELPER FUNCTIONS ====================

export function generateId(prefix: string): string {
  return `${prefix}_${faker.string.alphanumeric(6)}`
}

export function getMarksByExamAndSubject(examId: string, subjectId: string): StudentMark[] {
  return studentMarks.filter((m) => m.examId === examId && m.subjectId === subjectId)
}

export function getMarksByStudent(studentId: string): StudentMark[] {
  return studentMarks.filter((m) => m.studentId === studentId)
}

export function generateReportCard(studentId: string, exam: Exam): ReportCard {
  const marks = studentMarks.filter((m) => m.examId === exam.id && m.studentId === studentId)

  if (marks.length === 0) {
    // Generate random marks if not found
    const student = {
      name: faker.person.fullName(),
      class: exam.applicableClasses[0],
      section: 'A',
      admissionNumber: `ADM2024${faker.string.numeric(4)}`,
      rollNumber: Math.floor(Math.random() * 30) + 1,
    }

    const subjectResults = exam.subjects.map((subject) => {
      const marksObtained = Math.floor(Math.random() * 60) + 40
      return {
        subjectName: subject.name,
        subjectCode: subject.code,
        maxMarks: subject.maxMarks,
        marksObtained,
        grade: calculateGrade(marksObtained, subject.maxMarks),
      }
    })

    const totalMarks = subjectResults.reduce((sum, s) => sum + s.maxMarks, 0)
    const totalObtained = subjectResults.reduce((sum, s) => sum + s.marksObtained, 0)
    const percentage = (totalObtained / totalMarks) * 100

    return {
      id: faker.string.uuid(),
      studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      academicYear: exam.academicYear,
      term: exam.term,
      examName: exam.name,
      subjects: subjectResults,
      totalMarks,
      totalObtained,
      percentage: Math.round(percentage * 100) / 100,
      grade: calculateGrade(totalObtained, totalMarks),
      rank: Math.floor(Math.random() * 30) + 1,
      attendance: {
        totalDays: 200,
        presentDays: Math.floor(Math.random() * 20) + 180,
        percentage: Math.floor(Math.random() * 10) + 90,
      },
      generatedAt: new Date().toISOString(),
    }
  }

  const firstMark = marks[0]
  const subjectResults = marks.map((mark) => ({
    subjectName: mark.subjectName,
    subjectCode: exam.subjects.find((s) => s.id === mark.subjectId)?.code || '',
    maxMarks: mark.maxMarks,
    marksObtained: mark.marksObtained,
    grade: mark.grade || calculateGrade(mark.marksObtained, mark.maxMarks),
  }))

  const totalMarks = subjectResults.reduce((sum, s) => sum + s.maxMarks, 0)
  const totalObtained = subjectResults.reduce((sum, s) => sum + s.marksObtained, 0)
  const percentage = (totalObtained / totalMarks) * 100

  return {
    id: faker.string.uuid(),
    studentId,
    studentName: firstMark.studentName,
    studentClass: firstMark.studentClass,
    studentSection: firstMark.studentSection,
    admissionNumber: firstMark.admissionNumber,
    rollNumber: Math.floor(Math.random() * 30) + 1,
    academicYear: exam.academicYear,
    term: exam.term,
    examName: exam.name,
    subjects: subjectResults,
    totalMarks,
    totalObtained,
    percentage: Math.round(percentage * 100) / 100,
    grade: calculateGrade(totalObtained, totalMarks),
    rank: Math.floor(Math.random() * 30) + 1,
    attendance: {
      totalDays: 200,
      presentDays: Math.floor(Math.random() * 20) + 180,
      percentage: Math.floor(Math.random() * 10) + 90,
    },
    generatedAt: new Date().toISOString(),
  }
}

// ==================== EXAM TIMETABLE ====================

const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 301', 'Hall A', 'Hall B', 'Lab 1', 'Lab 2']
const INVIGILATORS = ['Mr. Sharma', 'Ms. Gupta', 'Mr. Patel', 'Ms. Singh', 'Mr. Kumar', 'Ms. Reddy', 'Mr. Das', 'Ms. Joshi']

export const examTimetables: Record<string, ExamSlot[]> = {}

exams.forEach(exam => {
  const slots: ExamSlot[] = []
  const startDate = new Date(exam.startDate)

  exam.subjects.forEach((subject, idx) => {
    const slotDate = new Date(startDate)
    slotDate.setDate(slotDate.getDate() + idx)

    slots.push({
      id: `slot_${exam.id}_${subject.id}`,
      examId: exam.id,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      date: slotDate.toISOString().slice(0, 10),
      startTime: subject.type === 'practical' ? '14:00' : '09:00',
      endTime: subject.type === 'practical' ? '16:00' : '12:00',
      room: faker.helpers.arrayElement(ROOMS),
      invigilator: faker.helpers.arrayElement(INVIGILATORS),
      applicableClasses: exam.applicableClasses,
    })
  })

  examTimetables[exam.id] = slots
})

// ==================== CLASS ANALYTICS GENERATOR ====================

export function generateClassAnalytics(examId: string, className: string, section: string): ClassAnalytics {
  const examMarks = studentMarks.filter(
    m => m.examId === examId && m.studentClass === className && m.studentSection === section
  )

  const studentIds = [...new Set(examMarks.map(m => m.studentId))]
  const exam = exams.find(e => e.id === examId)

  // Per-student totals
  const studentTotals = studentIds.map(sid => {
    const marks = examMarks.filter(m => m.studentId === sid)
    const total = marks.reduce((s, m) => s + m.marksObtained, 0)
    const max = marks.reduce((s, m) => s + m.maxMarks, 0)
    const pct = max > 0 ? (total / max) * 100 : 0
    return { studentId: sid, studentName: marks[0]?.studentName || '', total, max, percentage: pct, grade: calculateGrade(total, max) }
  }).sort((a, b) => b.percentage - a.percentage)

  // Grade distribution
  const gradeMap = new Map<string, number>()
  studentTotals.forEach(st => {
    gradeMap.set(st.grade, (gradeMap.get(st.grade) || 0) + 1)
  })

  // Subject-wise analytics
  const subjectWise: SubjectAnalytics[] = (exam?.subjects || []).map(subj => {
    const subjMarks = examMarks.filter(m => m.subjectId === subj.id)
    const appeared = subjMarks.filter(m => !m.isAbsent)
    const marksArr = appeared.map(m => m.marksObtained).sort((a, b) => a - b)
    const passed = appeared.filter(m => m.marksObtained >= subj.passingMarks)

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      totalStudents: subjMarks.length,
      appeared: appeared.length,
      absent: subjMarks.filter(m => m.isAbsent).length,
      passed: passed.length,
      failed: appeared.length - passed.length,
      passPercentage: appeared.length > 0 ? Math.round((passed.length / appeared.length) * 100) : 0,
      average: marksArr.length > 0 ? Math.round(marksArr.reduce((s, m) => s + m, 0) / marksArr.length) : 0,
      highest: marksArr.length > 0 ? marksArr[marksArr.length - 1] : 0,
      lowest: marksArr.length > 0 ? marksArr[0] : 0,
      median: marksArr.length > 0 ? marksArr[Math.floor(marksArr.length / 2)] : 0,
      toppers: appeared.sort((a, b) => b.marksObtained - a.marksObtained).slice(0, 3).map(m => ({
        studentId: m.studentId, studentName: m.studentName, marks: m.marksObtained,
      })),
    }
  })

  return {
    className,
    section,
    totalStudents: studentIds.length,
    classAverage: studentTotals.length > 0 ? Math.round(studentTotals.reduce((s, st) => s + st.percentage, 0) / studentTotals.length * 10) / 10 : 0,
    passPercentage: studentTotals.length > 0 ? Math.round((studentTotals.filter(st => st.grade !== 'F').length / studentTotals.length) * 100) : 0,
    gradeDistribution: Array.from(gradeMap.entries()).map(([grade, count]) => ({ grade, count })),
    subjectWise,
    toppers: studentTotals.slice(0, 10).map((st, i) => ({
      rank: i + 1,
      studentId: st.studentId,
      studentName: st.studentName,
      percentage: Math.round(st.percentage * 10) / 10,
      grade: st.grade,
    })),
  }
}

// ==================== PROGRESS TRACKING GENERATOR ====================

export function generateStudentProgress(studentId: string): StudentProgress | null {
  const marks = studentMarks.filter(m => m.studentId === studentId)
  if (marks.length === 0) return null

  const first = marks[0]
  const examIds = [...new Set(marks.map(m => m.examId))]

  const terms: TermProgress[] = examIds.map(eid => {
    const exam = exams.find(e => e.id === eid)
    if (!exam) return null
    const examMarks = marks.filter(m => m.examId === eid)
    const total = examMarks.reduce((s, m) => s + m.marksObtained, 0)
    const max = examMarks.reduce((s, m) => s + m.maxMarks, 0)
    const pct = max > 0 ? (total / max) * 100 : 0

    return {
      term: exam.term,
      examName: exam.name,
      examId: exam.id,
      percentage: Math.round(pct * 10) / 10,
      grade: calculateGrade(total, max),
      rank: faker.number.int({ min: 1, max: 30 }),
      subjectWise: examMarks.map(m => ({
        subjectName: m.subjectName,
        marks: m.marksObtained,
        maxMarks: m.maxMarks,
        percentage: Math.round((m.marksObtained / m.maxMarks) * 100 * 10) / 10,
      })),
    }
  }).filter(Boolean) as TermProgress[]

  const pcts = terms.map(t => t.percentage)
  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (pcts.length >= 2) {
    const diff = pcts[pcts.length - 1] - pcts[0]
    if (diff > 3) overallTrend = 'improving'
    else if (diff < -3) overallTrend = 'declining'
  }

  return {
    studentId,
    studentName: first.studentName,
    studentClass: first.studentClass,
    studentSection: first.studentSection,
    terms,
    overallTrend,
    improvementPercentage: pcts.length >= 2 ? Math.round((pcts[pcts.length - 1] - pcts[0]) * 10) / 10 : 0,
  }
}

// ==================== CO-SCHOLASTIC RECORDS ====================

const CO_SCHOLASTIC_AREAS: CoScholasticArea[] = ['art', 'music', 'dance', 'sports', 'yoga', 'discipline', 'work_education', 'health_education']
const CO_SCHOLASTIC_GRADES: CoScholasticGrade[] = ['A', 'B', 'C']

export const coScholasticRecords: CoScholasticRecord[] = []

// Generate records for a sample of students
const sampleStudentIds = [...new Set(studentMarks.slice(0, 200).map(m => m.studentId))]
sampleStudentIds.slice(0, 30).forEach(sid => {
  const marks = studentMarks.find(m => m.studentId === sid)
  if (!marks) return

  CO_SCHOLASTIC_AREAS.forEach(area => {
    coScholasticRecords.push({
      id: faker.string.uuid(),
      studentId: sid,
      studentName: marks.studentName,
      studentClass: marks.studentClass,
      studentSection: marks.studentSection,
      academicYear: '2024-25',
      term: 'Term 1',
      area,
      grade: faker.helpers.weightedArrayElement([
        { value: 'A' as const, weight: 40 },
        { value: 'B' as const, weight: 40 },
        { value: 'C' as const, weight: 20 },
      ]),
      remarks: faker.helpers.arrayElement(['Excellent performance', 'Good progress', 'Shows potential', 'Needs improvement', 'Active participation', 'Consistent effort']),
      assessedBy: faker.helpers.arrayElement(INVIGILATORS),
      assessedAt: faker.date.recent({ days: 60 }).toISOString(),
    })
  })
})

// ==================== QUESTION PAPERS ====================

export const questionPapers: QuestionPaper[] = [
  {
    id: 'qp_001',
    examId: 'exam_002',
    examName: 'Mid Term Examination',
    subjectId: 'subj_003',
    subjectName: 'Mathematics',
    subjectCode: 'MATH',
    className: 'Class 10',
    academicYear: '2024-25',
    term: 'Term 1',
    totalMarks: 100,
    duration: '3 hours',
    difficulty: 'medium',
    sections: [
      { name: 'Section A - MCQ', instructions: 'Choose the correct answer', questionCount: 20, marksPerQuestion: 1, totalMarks: 20 },
      { name: 'Section B - Short Answer', instructions: 'Answer in 2-3 lines', questionCount: 10, marksPerQuestion: 2, totalMarks: 20 },
      { name: 'Section C - Long Answer', instructions: 'Solve with full working', questionCount: 8, marksPerQuestion: 5, totalMarks: 40 },
      { name: 'Section D - HOTS', instructions: 'Higher Order Thinking Skills', questionCount: 4, marksPerQuestion: 5, totalMarks: 20 },
    ],
    createdBy: 'Mr. Sharma',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  },
  {
    id: 'qp_002',
    examId: 'exam_002',
    examName: 'Mid Term Examination',
    subjectId: 'subj_004',
    subjectName: 'Science',
    subjectCode: 'SCI',
    className: 'Class 10',
    academicYear: '2024-25',
    term: 'Term 1',
    totalMarks: 100,
    duration: '3 hours',
    difficulty: 'medium',
    sections: [
      { name: 'Section A - Objective', instructions: 'MCQ and Fill in the blanks', questionCount: 15, marksPerQuestion: 1, totalMarks: 15 },
      { name: 'Section B - Short Answer', instructions: 'Answer briefly', questionCount: 10, marksPerQuestion: 3, totalMarks: 30 },
      { name: 'Section C - Long Answer', instructions: 'Answer in detail with diagrams', questionCount: 5, marksPerQuestion: 5, totalMarks: 25 },
      { name: 'Section D - Numerical', instructions: 'Solve the following problems', questionCount: 6, marksPerQuestion: 5, totalMarks: 30 },
    ],
    createdBy: 'Ms. Gupta',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 14 }).toISOString(),
  },
  {
    id: 'qp_003',
    examId: 'exam_001',
    examName: 'First Unit Test',
    subjectId: 'subj_001',
    subjectName: 'English',
    subjectCode: 'ENG',
    className: 'Class 9',
    academicYear: '2024-25',
    term: 'Term 1',
    totalMarks: 50,
    duration: '1.5 hours',
    difficulty: 'easy',
    sections: [
      { name: 'Section A - Reading', instructions: 'Read the passage and answer', questionCount: 5, marksPerQuestion: 2, totalMarks: 10 },
      { name: 'Section B - Grammar', instructions: 'Correct the sentences', questionCount: 10, marksPerQuestion: 1, totalMarks: 10 },
      { name: 'Section C - Writing', instructions: 'Write as instructed', questionCount: 3, marksPerQuestion: 5, totalMarks: 15 },
      { name: 'Section D - Literature', instructions: 'Answer from the prescribed text', questionCount: 3, marksPerQuestion: 5, totalMarks: 15 },
    ],
    createdBy: 'Ms. Joshi',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
]
