import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateStudentInput, UpdateStudentInput, ListStudentsInput,
  CreateDocumentInput, UpsertHealthRecordInput,
  CreateSkillInput, UpdateSkillInput,
  CreatePortfolioItemInput, UpdatePortfolioItemInput,
  LinkSiblingInput, PromoteStudentsInput, BulkImportStudentsInput,
} from '../validators/student.validators.js'

// ==================== Helpers ====================

function formatStudent(student: any) {
  return {
    id: student.id,
    admissionNumber: student.admissionNumber,
    name: `${student.firstName} ${student.lastName}`.trim(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    bloodGroup: student.bloodGroup,
    class: student.class?.name || null,
    classId: student.classId,
    section: student.section?.name || null,
    sectionId: student.sectionId,
    rollNumber: student.rollNumber,
    admissionDate: student.admissionDate,
    photoUrl: student.photoUrl,
    status: student.status,
    address: student.address || null,
    parent: student.parent || null,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  }
}

const studentInclude = {
  class: true,
  section: true,
  address: true,
  parent: true,
}

async function generateAdmissionNumber(schoolId: string): Promise<string> {
  const year = new Date().getFullYear()
  const lastStudent = await prisma.student.findFirst({
    where: { organizationId: schoolId, admissionNumber: { startsWith: `ADM-${year}-` } },
    orderBy: { admissionNumber: 'desc' },
  })
  let seq = 1
  if (lastStudent) {
    const parts = lastStudent.admissionNumber.split('-')
    seq = parseInt(parts[2], 10) + 1
  }
  return `ADM-${year}-${String(seq).padStart(4, '0')}`
}

async function resolveClassAndSection(schoolId: string, className: string, sectionName: string) {
  const cls = await prisma.class.findFirst({ where: { organizationId: schoolId, name: className } })
  if (!cls) throw AppError.badRequest(`Class '${className}' not found`)

  const section = await prisma.section.findFirst({
    where: { classId: cls.id, name: sectionName },
  })
  if (!section) throw AppError.badRequest(`Section '${sectionName}' not found in ${className}`)

  return { classId: cls.id, sectionId: section.id }
}

// ==================== CRUD ====================

export async function listStudents(schoolId: string, query: ListStudentsInput) {
  const { page, limit, search, class: className, section, status, gender } = query
  const where: any = { organizationId: schoolId }

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { admissionNumber: { contains: search } },
    ]
  }
  if (className) {
    const cls = await prisma.class.findFirst({ where: { organizationId: schoolId, name: className } })
    if (cls) where.classId = cls.id
  }
  if (section) {
    // section filter needs classId to be meaningful, but we handle standalone too
    if (where.classId) {
      const sec = await prisma.section.findFirst({ where: { classId: where.classId, name: section } })
      if (sec) where.sectionId = sec.id
    }
  }
  if (status) where.status = status
  if (gender) where.gender = gender

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      include: studentInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: students.map(formatStudent),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getStudentByEmail(schoolId: string, email: string) {
  const student = await prisma.student.findFirst({
    where: { email, organizationId: schoolId },
    include: studentInclude,
  })
  if (!student) return null
  return formatStudent(student)
}

export async function getStudentById(schoolId: string, id: string) {
  const student = await prisma.student.findFirst({
    where: { id, organizationId: schoolId },
    include: studentInclude,
  })
  if (!student) throw AppError.notFound('Student not found')
  return formatStudent(student)
}

export async function createStudent(schoolId: string, input: CreateStudentInput) {
  // Check email uniqueness within school
  const existing = await prisma.student.findFirst({ where: { organizationId: schoolId, email: input.email } })
  if (existing) throw AppError.conflict('A student with this email already exists')

  const { classId, sectionId } = await resolveClassAndSection(schoolId, input.class, input.section)
  const admissionNumber = await generateAdmissionNumber(schoolId)

  const student = await prisma.student.create({
    data: {
      organizationId: schoolId,
      admissionNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      gender: input.gender || null,
      bloodGroup: input.bloodGroup || null,
      classId,
      sectionId,
      rollNumber: input.rollNumber || null,
      admissionDate: input.admissionDate ? new Date(input.admissionDate) : new Date(),
      photoUrl: input.photoUrl || null,
      status: input.status || 'active',
      ...(input.address ? {
        address: { create: input.address },
      } : {}),
      ...(input.parent ? {
        parent: { create: input.parent },
      } : {}),
      timelineEvents: {
        create: {
          type: 'admission',
          title: 'Admitted to school',
          description: `Admitted to ${input.class} - ${input.section}`,
        },
      },
    },
    include: studentInclude,
  })

  return formatStudent(student)
}

export async function updateStudent(schoolId: string, id: string, input: UpdateStudentInput) {
  const existing = await prisma.student.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Student not found')

  // Check email uniqueness within school
  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.student.findFirst({ where: { organizationId: schoolId, email: input.email } })
    if (emailTaken) throw AppError.conflict('A student with this email already exists')
  }

  const data: any = {}
  if (input.firstName !== undefined) data.firstName = input.firstName
  if (input.lastName !== undefined) data.lastName = input.lastName
  if (input.email !== undefined) data.email = input.email
  if (input.phone !== undefined) data.phone = input.phone
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null
  if (input.gender !== undefined) data.gender = input.gender
  if (input.bloodGroup !== undefined) data.bloodGroup = input.bloodGroup
  if (input.rollNumber !== undefined) data.rollNumber = input.rollNumber
  if (input.admissionDate !== undefined) data.admissionDate = input.admissionDate ? new Date(input.admissionDate) : null
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl || null
  if (input.status !== undefined) data.status = input.status

  // Resolve class/section if changed
  if (input.class || input.section) {
    const className = input.class || (await prisma.class.findUnique({ where: { id: existing.classId } }))?.name
    const sectionName = input.section || (await prisma.section.findUnique({ where: { id: existing.sectionId } }))?.name
    if (className && sectionName) {
      const resolved = await resolveClassAndSection(schoolId, className, sectionName)
      data.classId = resolved.classId
      data.sectionId = resolved.sectionId
    }
  }

  // Upsert address
  if (input.address) {
    await prisma.studentAddress.upsert({
      where: { studentId: id },
      update: input.address,
      create: { studentId: id, ...input.address },
    })
  }

  // Upsert parent
  if (input.parent) {
    await prisma.studentParent.upsert({
      where: { studentId: id },
      update: input.parent,
      create: { studentId: id, ...input.parent },
    })
  }

  const student = await prisma.student.update({
    where: { id },
    data,
    include: studentInclude,
  })

  return formatStudent(student)
}

export async function deleteStudent(schoolId: string, id: string) {
  const existing = await prisma.student.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Student not found')

  await prisma.student.delete({ where: { id } })
  return { success: true }
}

// ==================== Documents ====================

export async function listDocuments(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const documents = await prisma.studentDocument.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  })
  return documents
}

export async function createDocument(schoolId: string, studentId: string, input: CreateDocumentInput, uploadedBy?: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const doc = await prisma.studentDocument.create({
    data: {
      studentId,
      type: input.type,
      name: input.name,
      fileName: input.fileName,
      fileSize: input.fileSize || null,
      mimeType: input.mimeType || null,
      url: input.url,
      uploadedBy: uploadedBy || null,
    },
  })

  // Add timeline event
  await prisma.studentTimelineEvent.create({
    data: {
      studentId,
      type: 'document_uploaded',
      title: `Document uploaded: ${input.name}`,
      description: `${input.type} document uploaded`,
    },
  })

  return doc
}

export async function deleteDocument(schoolId: string, studentId: string, docId: string) {
  const doc = await prisma.studentDocument.findFirst({
    where: { id: docId, studentId },
  })
  if (!doc) throw AppError.notFound('Document not found')

  await prisma.studentDocument.delete({ where: { id: docId } })
  return { success: true }
}

export async function verifyDocument(schoolId: string, studentId: string, docId: string, verifiedBy: string) {
  const doc = await prisma.studentDocument.findFirst({
    where: { id: docId, studentId },
  })
  if (!doc) throw AppError.notFound('Document not found')

  const updated = await prisma.studentDocument.update({
    where: { id: docId },
    data: { verified: true, verifiedBy, verifiedAt: new Date() },
  })
  return updated
}

// ==================== Health Records ====================

export async function getHealthRecord(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const record = await prisma.studentHealthRecord.findUnique({ where: { studentId } })
  return record || null
}

export async function upsertHealthRecord(schoolId: string, studentId: string, input: UpsertHealthRecordInput) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const data: any = {
    allergies: input.allergies || [],
    medicalConditions: input.medicalConditions || [],
    medications: input.medications || [],
    emergencyContact: input.emergencyContact || null,
    bloodGroup: input.bloodGroup || null,
    height: input.height || null,
    weight: input.weight || null,
    visionLeft: input.visionLeft || null,
    visionRight: input.visionRight || null,
    lastCheckupDate: input.lastCheckupDate ? new Date(input.lastCheckupDate) : null,
    insuranceProvider: input.insuranceProvider || null,
    notes: input.notes || null,
  }

  const record = await prisma.studentHealthRecord.upsert({
    where: { studentId },
    update: data,
    create: { studentId, ...data },
  })

  return record
}

// ==================== Timeline ====================

export async function listTimelineEvents(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const events = await prisma.studentTimelineEvent.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  })
  return events
}

// ==================== Siblings ====================

export async function getSiblings(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const siblingLinks = await prisma.studentSibling.findMany({
    where: { studentId },
    include: {
      sibling: { include: { class: true, section: true } },
    },
  })

  return siblingLinks.map((link) => ({
    id: link.sibling.id,
    name: `${link.sibling.firstName} ${link.sibling.lastName}`.trim(),
    admissionNumber: link.sibling.admissionNumber,
    class: link.sibling.class?.name || null,
    section: link.sibling.section?.name || null,
    rollNumber: link.sibling.rollNumber || null,
    photoUrl: link.sibling.photoUrl || null,
  }))
}

export async function linkSibling(schoolId: string, studentId: string, input: LinkSiblingInput) {
  if (studentId === input.siblingId) {
    throw AppError.badRequest('Cannot link a student as their own sibling')
  }

  const [student, sibling] = await Promise.all([
    prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } }),
    prisma.student.findFirst({ where: { id: input.siblingId, organizationId: schoolId } }),
  ])
  if (!student) throw AppError.notFound('Student not found')
  if (!sibling) throw AppError.notFound('Sibling student not found')

  // Check if already linked
  const existing = await prisma.studentSibling.findUnique({
    where: { studentId_siblingId: { studentId, siblingId: input.siblingId } },
  })
  if (existing) throw AppError.conflict('Students are already linked as siblings')

  // Create both directions in a transaction
  await prisma.$transaction([
    prisma.studentSibling.create({ data: { studentId, siblingId: input.siblingId } }),
    prisma.studentSibling.create({ data: { studentId: input.siblingId, siblingId: studentId } }),
  ])

  return { success: true }
}

export async function unlinkSibling(schoolId: string, studentId: string, siblingId: string) {
  const link = await prisma.studentSibling.findUnique({
    where: { studentId_siblingId: { studentId, siblingId } },
  })
  if (!link) throw AppError.notFound('Sibling link not found')

  // Delete both directions
  await prisma.$transaction([
    prisma.studentSibling.delete({ where: { studentId_siblingId: { studentId, siblingId } } }),
    prisma.studentSibling.delete({ where: { studentId_siblingId: { studentId: siblingId, siblingId: studentId } } }),
  ])

  return { success: true }
}

// ==================== ID Card ====================

export async function getIdCardData(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
    include: { class: true, section: true, parent: true, address: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  const school = await prisma.schoolProfile.findFirst({ where: { id: schoolId } })

  return {
    student: {
      name: `${student.firstName} ${student.lastName}`.trim(),
      admissionNumber: student.admissionNumber,
      class: student.class?.name || null,
      section: student.section?.name || null,
      rollNumber: student.rollNumber,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup,
      photoUrl: student.photoUrl,
      address: student.address ? `${student.address.street || ''}, ${student.address.city || ''}`.replace(/^, |, $/g, '') : null,
      parentName: student.parent?.fatherName || student.parent?.motherName || null,
      parentPhone: student.parent?.guardianPhone || null,
    },
    school: school ? {
      name: school.name,
      address: `${school.address}, ${school.city}`,
      phone: school.phone,
      logo: school.logo,
    } : null,
  }
}

// ==================== Skills ====================

export async function addSkill(schoolId: string, studentId: string, input: CreateSkillInput) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const skill = await prisma.studentSkill.create({
    data: {
      studentId,
      name: input.name,
      category: input.category,
      proficiencyLevel: input.proficiencyLevel || 1,
      certifications: input.certifications || [],
      endorsedBy: input.endorsedBy || [],
      acquiredDate: input.acquiredDate ? new Date(input.acquiredDate) : null,
      notes: input.notes || null,
    },
  })
  return skill
}

export async function updateSkill(schoolId: string, studentId: string, skillId: string, input: UpdateSkillInput) {
  const skill = await prisma.studentSkill.findFirst({ where: { id: skillId, studentId } })
  if (!skill) throw AppError.notFound('Skill not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.category !== undefined) data.category = input.category
  if (input.proficiencyLevel !== undefined) data.proficiencyLevel = input.proficiencyLevel
  if (input.certifications !== undefined) data.certifications = input.certifications
  if (input.endorsedBy !== undefined) data.endorsedBy = input.endorsedBy
  if (input.acquiredDate !== undefined) data.acquiredDate = input.acquiredDate ? new Date(input.acquiredDate) : null
  if (input.notes !== undefined) data.notes = input.notes

  const updated = await prisma.studentSkill.update({ where: { id: skillId }, data })
  return updated
}

export async function deleteSkill(schoolId: string, studentId: string, skillId: string) {
  const skill = await prisma.studentSkill.findFirst({ where: { id: skillId, studentId } })
  if (!skill) throw AppError.notFound('Skill not found')

  await prisma.studentSkill.delete({ where: { id: skillId } })
  return { success: true }
}

// ==================== Portfolio ====================

export async function getPortfolio(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const [skills, items] = await Promise.all([
    prisma.studentSkill.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
    prisma.studentPortfolioItem.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
  ])

  return { skills, items }
}

export async function addPortfolioItem(schoolId: string, studentId: string, input: CreatePortfolioItemInput) {
  const student = await prisma.student.findFirst({ where: { id: studentId, organizationId: schoolId } })
  if (!student) throw AppError.notFound('Student not found')

  const item = await prisma.studentPortfolioItem.create({
    data: {
      studentId,
      title: input.title,
      type: input.type,
      description: input.description || null,
      date: input.date ? new Date(input.date) : null,
      attachments: input.attachments || [],
      tags: input.tags || [],
      visibility: input.visibility || 'school',
      featured: input.featured || false,
    },
  })
  return item
}

export async function updatePortfolioItem(schoolId: string, studentId: string, itemId: string, input: UpdatePortfolioItemInput) {
  const item = await prisma.studentPortfolioItem.findFirst({ where: { id: itemId, studentId } })
  if (!item) throw AppError.notFound('Portfolio item not found')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title
  if (input.type !== undefined) data.type = input.type
  if (input.description !== undefined) data.description = input.description
  if (input.date !== undefined) data.date = input.date ? new Date(input.date) : null
  if (input.attachments !== undefined) data.attachments = input.attachments
  if (input.tags !== undefined) data.tags = input.tags
  if (input.visibility !== undefined) data.visibility = input.visibility
  if (input.featured !== undefined) data.featured = input.featured

  const updated = await prisma.studentPortfolioItem.update({ where: { id: itemId }, data })
  return updated
}

export async function deletePortfolioItem(schoolId: string, studentId: string, itemId: string) {
  const item = await prisma.studentPortfolioItem.findFirst({ where: { id: itemId, studentId } })
  if (!item) throw AppError.notFound('Portfolio item not found')

  await prisma.studentPortfolioItem.delete({ where: { id: itemId } })
  return { success: true }
}

// ==================== Promotion ====================

export async function promoteStudents(schoolId: string, input: PromoteStudentsInput) {
  const { classId, sectionId } = await resolveClassAndSection(schoolId, input.toClass, input.toSection)

  const students = await prisma.student.findMany({
    where: { id: { in: input.studentIds }, organizationId: schoolId },
    include: { class: true, section: true },
  })

  if (students.length !== input.studentIds.length) {
    throw AppError.badRequest('Some student IDs are invalid')
  }

  const results = []
  for (const student of students) {
    const fromClass = student.class?.name || 'Unknown'
    const fromSection = student.section?.name || 'Unknown'

    await prisma.$transaction([
      prisma.student.update({
        where: { id: student.id },
        data: { classId, sectionId, rollNumber: null },
      }),
      prisma.studentTimelineEvent.create({
        data: {
          studentId: student.id,
          type: 'promotion',
          title: `Promoted to ${input.toClass} - ${input.toSection}`,
          description: `Promoted from ${fromClass} - ${fromSection} to ${input.toClass} - ${input.toSection}`,
        },
      }),
    ])

    results.push({ studentId: student.id, id: student.id, studentName: `${student.firstName} ${student.lastName}`.trim(), name: `${student.firstName} ${student.lastName}`.trim(), promoted: true, fromClass, fromSection, toClass: input.toClass, toSection: input.toSection })
  }

  return results
}

// ==================== Bulk ====================

export async function bulkImportStudents(schoolId: string, input: BulkImportStudentsInput) {
  const results = []
  for (const studentInput of input.students) {
    try {
      const student = await createStudent(schoolId, studentInput)
      results.push({ admissionNumber: student.admissionNumber, name: student.name, status: 'created' })
    } catch (err: any) {
      console.error(`[BulkImport] Failed for ${studentInput.email}:`, err.message)
      results.push({ email: studentInput.email, status: 'failed', error: err.message })
    }
  }
  return results
}

export async function exportStudents(schoolId: string) {
  const students = await prisma.student.findMany({
    where: { organizationId: schoolId },
    include: { class: true, section: true, address: true, parent: true },
    orderBy: { admissionNumber: 'asc' },
  })
  return students.map(formatStudent)
}
