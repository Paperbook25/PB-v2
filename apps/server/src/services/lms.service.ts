import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Courses: List ====================

export async function listCourses(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    status?: string
    classId?: string
    teacherId?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.classId) where.classId = query.classId
  if (query.teacherId) where.teacherId = query.teacherId
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { teacherName: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      include: { _count: { select: { lessons: true, assignments: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Courses: Get by ID ====================

export async function getCourseById(schoolId: string, id: string) {
  const course = await prisma.course.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      lessons: { orderBy: { sortOrder: 'asc' } },
      assignments: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!course) throw AppError.notFound('Course not found')
  return course
}

// ==================== Courses: Create ====================

export async function createCourse(
  schoolId: string,
  input: {
    title: string
    description?: string
    subjectId?: string
    classId?: string
    teacherId?: string
    teacherName?: string
    coverImage?: string
    status?: string
  }
) {
  return prisma.course.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description ?? null,
      subjectId: input.subjectId ?? null,
      classId: input.classId ?? null,
      teacherId: input.teacherId ?? null,
      teacherName: input.teacherName ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status ?? 'draft',
    },
  })
}

// ==================== Courses: Update ====================

export async function updateCourse(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.course.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Course not found')

  return prisma.course.update({ where: { id }, data: input })
}

// ==================== Courses: Delete ====================

export async function deleteCourse(schoolId: string, id: string) {
  const existing = await prisma.course.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Course not found')

  await prisma.$transaction([
    prisma.courseLesson.deleteMany({ where: { courseId: id } }),
    prisma.assignmentSubmission.deleteMany({
      where: { assignment: { courseId: id } },
    }),
    prisma.assignment.deleteMany({ where: { courseId: id } }),
    prisma.course.delete({ where: { id } }),
  ])
  return { success: true }
}

// ==================== Lessons: Create ====================

export async function createLesson(
  schoolId: string,
  courseId: string,
  input: {
    title: string
    content?: string
    videoUrl?: string
    fileUrl?: string
    sortOrder?: number
    duration?: number
  }
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, organizationId: schoolId },
  })
  if (!course) throw AppError.notFound('Course not found')

  return prisma.courseLesson.create({
    data: {
      courseId,
      title: input.title,
      content: input.content ?? null,
      videoUrl: input.videoUrl ?? null,
      fileUrl: input.fileUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
      duration: input.duration ?? null,
    },
  })
}

// ==================== Lessons: Update ====================

export async function updateLesson(
  schoolId: string,
  lessonId: string,
  input: Record<string, unknown>
) {
  const lesson = await prisma.courseLesson.findFirst({
    where: { id: lessonId, course: { organizationId: schoolId } },
  })
  if (!lesson) throw AppError.notFound('Lesson not found')

  return prisma.courseLesson.update({ where: { id: lessonId }, data: input })
}

// ==================== Lessons: Delete ====================

export async function deleteLesson(schoolId: string, lessonId: string) {
  const lesson = await prisma.courseLesson.findFirst({
    where: { id: lessonId, course: { organizationId: schoolId } },
  })
  if (!lesson) throw AppError.notFound('Lesson not found')

  await prisma.courseLesson.delete({ where: { id: lessonId } })
  return { success: true }
}

// ==================== Assignments: List ====================

export async function listAssignments(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    courseId?: string
    classId?: string
    status?: string
    teacherId?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.courseId) where.courseId = query.courseId
  if (query.classId) where.classId = query.classId
  if (query.status) where.status = query.status
  if (query.teacherId) where.teacherId = query.teacherId

  const [data, total] = await prisma.$transaction([
    prisma.assignment.findMany({
      where,
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.assignment.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Assignments: Get by ID ====================

export async function getAssignmentById(schoolId: string, id: string) {
  const assignment = await prisma.assignment.findFirst({
    where: { id, organizationId: schoolId },
    include: { submissions: { orderBy: { submittedAt: 'desc' } } },
  })
  if (!assignment) throw AppError.notFound('Assignment not found')
  return assignment
}

// ==================== Assignments: Create ====================

export async function createAssignment(
  schoolId: string,
  input: {
    title: string
    description?: string
    courseId?: string
    dueDate?: string
    totalMarks?: number
    classId?: string
    subjectId?: string
    teacherId?: string
    status?: string
  }
) {
  return prisma.assignment.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description ?? null,
      courseId: input.courseId ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      totalMarks: input.totalMarks ?? 100,
      classId: input.classId ?? null,
      subjectId: input.subjectId ?? null,
      teacherId: input.teacherId ?? null,
      status: input.status ?? 'draft',
    },
  })
}

// ==================== Assignments: Update ====================

export async function updateAssignment(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.assignment.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Assignment not found')

  if (typeof input.dueDate === 'string') {
    input.dueDate = new Date(input.dueDate)
  }

  return prisma.assignment.update({ where: { id }, data: input })
}

// ==================== Assignments: Delete ====================

export async function deleteAssignment(schoolId: string, id: string) {
  const existing = await prisma.assignment.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Assignment not found')

  await prisma.$transaction([
    prisma.assignmentSubmission.deleteMany({ where: { assignmentId: id } }),
    prisma.assignment.delete({ where: { id } }),
  ])
  return { success: true }
}

// ==================== Submissions: Submit ====================

export async function submitAssignment(
  schoolId: string,
  assignmentId: string,
  input: {
    studentId: string
    studentName: string
    content?: string
    fileUrl?: string
  }
) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, organizationId: schoolId },
  })
  if (!assignment) throw AppError.notFound('Assignment not found')
  if (assignment.status === 'closed') {
    throw AppError.badRequest('Assignment is closed for submissions')
  }

  // Check for existing submission
  const existing = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, studentId: input.studentId },
  })
  if (existing) {
    throw AppError.conflict('Student has already submitted this assignment')
  }

  return prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId: input.studentId,
      studentName: input.studentName,
      content: input.content ?? null,
      fileUrl: input.fileUrl ?? null,
    },
  })
}

// ==================== Submissions: Grade ====================

export async function gradeSubmission(
  schoolId: string,
  submissionId: string,
  input: {
    marks: number
    feedback?: string
    gradedBy: string
  }
) {
  const submission = await prisma.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      assignment: { organizationId: schoolId },
    },
  })
  if (!submission) throw AppError.notFound('Submission not found')

  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      marks: input.marks,
      feedback: input.feedback ?? null,
      gradedBy: input.gradedBy,
      gradedAt: new Date(),
      status: 'graded',
    },
  })
}

// ==================== LMS Stats ====================

export async function getLmsStats(schoolId: string) {
  const [totalCourses, publishedCourses, totalAssignments, totalSubmissions, pendingGrading] =
    await Promise.all([
      prisma.course.count({ where: { organizationId: schoolId } }),
      prisma.course.count({ where: { organizationId: schoolId, status: 'published' } }),
      prisma.assignment.count({ where: { organizationId: schoolId } }),
      prisma.assignmentSubmission.count({
        where: { assignment: { organizationId: schoolId } },
      }),
      prisma.assignmentSubmission.count({
        where: {
          assignment: { organizationId: schoolId },
          status: 'submitted',
        },
      }),
    ])

  return {
    totalCourses,
    publishedCourses,
    totalAssignments,
    totalSubmissions,
    pendingGrading,
  }
}
