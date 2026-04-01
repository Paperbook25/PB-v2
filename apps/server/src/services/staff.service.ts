import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateStaffInput, UpdateStaffInput, ListStaffInput,
  CreatePDInput, UpdatePDInput, CreateReviewInput,
  CreateStaffSkillInput, UpdateStaffSkillInput,
  CreateCertificationInput, UpdateCertificationInput,
  CreateOnboardingInput, UpdateOnboardingTaskInput,
  CreateExitInterviewInput, UpdateExitInterviewInput,
  UpdateClearanceInput, BulkImportStaffInput,
} from '../validators/staff.validators.js'

// ==================== Helpers ====================

const staffInclude = {
  department: true,
  designation: true,
  user: { select: { id: true, email: true, name: true, role: true } },
  address: true,
  qualifications: true,
  bankDetails: true,
}

function formatStaff(staff: any) {
  return {
    id: staff.id,
    employeeId: staff.employeeId,
    name: `${staff.firstName} ${staff.lastName}`.trim(),
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone,
    dateOfBirth: staff.dateOfBirth,
    gender: staff.gender,
    department: staff.department?.name || null,
    departmentId: staff.departmentId,
    designation: staff.designation?.name || null,
    designationId: staff.designationId,
    joiningDate: staff.joiningDate,
    photoUrl: staff.photoUrl,
    specialization: staff.specialization,
    salary: staff.salary,
    status: staff.status,
    userId: staff.userId,
    user: staff.user || null,
    qualification: staff.qualifications?.map((q: any) => q.qualification) || [],
    address: staff.address || null,
    bankDetails: staff.bankDetails || null,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  }
}

async function generateEmployeeId(schoolId: string): Promise<string> {
  const lastStaff = await prisma.staff.findFirst({
    where: { organizationId: schoolId, employeeId: { startsWith: 'EMP-' } },
    orderBy: { employeeId: 'desc' },
  })
  let seq = 1
  if (lastStaff) {
    const parts = lastStaff.employeeId.split('-')
    seq = parseInt(parts[1], 10) + 1
  }
  return `EMP-${String(seq).padStart(4, '0')}`
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

async function findOrCreateDepartment(schoolId: string, name: string): Promise<string> {
  let dept = await prisma.department.findFirst({ where: { organizationId: schoolId, name } })
  if (!dept) {
    dept = await prisma.department.create({ data: { organizationId: schoolId, name } })
  }
  return dept.id
}

async function findOrCreateDesignation(schoolId: string, name: string): Promise<string> {
  let desig = await prisma.designation.findFirst({ where: { organizationId: schoolId, name } })
  if (!desig) {
    desig = await prisma.designation.create({ data: { organizationId: schoolId, name } })
  }
  return desig.id
}

// ==================== CRUD ====================

export async function listStaff(schoolId: string, query: ListStaffInput) {
  const { page, limit, search, department, designation, status, gender } = query
  const where: any = { organizationId: schoolId }

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { employeeId: { contains: search } },
    ]
  }
  if (department) {
    const dept = await prisma.department.findFirst({ where: { organizationId: schoolId, name: department } })
    if (dept) where.departmentId = dept.id
  }
  if (designation) {
    const desig = await prisma.designation.findFirst({ where: { organizationId: schoolId, name: designation } })
    if (desig) where.designationId = desig.id
  }
  if (status) where.status = status
  if (gender) where.gender = gender

  const [total, staffList] = await Promise.all([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      include: staffInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: staffList.map(formatStaff),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getStaffById(schoolId: string, id: string) {
  const staff = await prisma.staff.findFirst({
    where: { id, organizationId: schoolId },
    include: staffInclude,
  })
  if (!staff) throw AppError.notFound('Staff member not found')
  return formatStaff(staff)
}

export async function createStaff(schoolId: string, input: CreateStaffInput) {
  // Check email uniqueness within school
  const existing = await prisma.staff.findFirst({ where: { organizationId: schoolId, email: input.email } })
  if (existing) throw AppError.conflict('A staff member with this email already exists')

  const { firstName, lastName } = splitName(input.name)
  const employeeId = await generateEmployeeId(schoolId)
  const departmentId = await findOrCreateDepartment(schoolId, input.department)
  const designationId = await findOrCreateDesignation(schoolId, input.designation)

  // Validate userId if provided
  if (input.userId) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } })
    if (!user) throw AppError.badRequest('User not found for the given userId')
    const existingStaffLink = await prisma.staff.findUnique({ where: { userId: input.userId } })
    if (existingStaffLink) throw AppError.conflict('This user is already linked to another staff member')
  }

  const staff = await prisma.staff.create({
    data: {
      organizationId: schoolId,
      employeeId,
      firstName,
      lastName,
      email: input.email,
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      gender: input.gender || null,
      departmentId,
      designationId,
      joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
      photoUrl: input.photoUrl || null,
      specialization: input.specialization || null,
      salary: input.salary || null,
      status: input.status || 'active',
      userId: input.userId || null,
      ...(input.address ? { address: { create: input.address } } : {}),
      ...(input.bankDetails ? { bankDetails: { create: input.bankDetails } } : {}),
      ...(input.qualification?.length ? {
        qualifications: {
          create: input.qualification.map((q) => ({ qualification: q })),
        },
      } : {}),
    },
    include: staffInclude,
  })

  return formatStaff(staff)
}

export async function updateStaff(schoolId: string, id: string, input: UpdateStaffInput) {
  const existing = await prisma.staff.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Staff member not found')

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.staff.findFirst({ where: { organizationId: schoolId, email: input.email } })
    if (emailTaken) throw AppError.conflict('A staff member with this email already exists')
  }

  const data: any = {}
  if (input.name !== undefined) {
    const { firstName, lastName } = splitName(input.name)
    data.firstName = firstName
    data.lastName = lastName
  }
  if (input.email !== undefined) data.email = input.email
  if (input.phone !== undefined) data.phone = input.phone
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null
  if (input.gender !== undefined) data.gender = input.gender
  if (input.joiningDate !== undefined) data.joiningDate = input.joiningDate ? new Date(input.joiningDate) : null
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl || null
  if (input.specialization !== undefined) data.specialization = input.specialization
  if (input.salary !== undefined) data.salary = input.salary
  if (input.status !== undefined) data.status = input.status
  if (input.userId !== undefined) data.userId = input.userId

  if (input.department) {
    data.departmentId = await findOrCreateDepartment(schoolId, input.department)
  }
  if (input.designation) {
    data.designationId = await findOrCreateDesignation(schoolId, input.designation)
  }

  // Upsert address
  if (input.address) {
    await prisma.staffAddress.upsert({
      where: { staffId: id },
      update: input.address,
      create: { staffId: id, ...input.address },
    })
  }

  // Upsert bank details
  if (input.bankDetails) {
    await prisma.staffBankDetails.upsert({
      where: { staffId: id },
      update: input.bankDetails,
      create: { staffId: id, ...input.bankDetails },
    })
  }

  // Replace qualifications if provided
  if (input.qualification !== undefined) {
    await prisma.staffQualification.deleteMany({ where: { staffId: id } })
    if (input.qualification.length > 0) {
      await prisma.staffQualification.createMany({
        data: input.qualification.map((q) => ({ staffId: id, qualification: q })),
      })
    }
  }

  const staff = await prisma.staff.update({
    where: { id },
    data,
    include: staffInclude,
  })

  return formatStaff(staff)
}

export async function deleteStaff(schoolId: string, id: string) {
  const existing = await prisma.staff.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Staff member not found')

  await prisma.staff.delete({ where: { id } })
  return { success: true }
}

// ==================== Professional Development ====================

export async function listAllPD(schoolId: string) {
  const records = await prisma.staffProfessionalDevelopment.findMany({
    where: { staff: { organizationId: schoolId } },
    include: { staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return records.map((r) => ({
    ...r,
    staffName: `${r.staff.firstName} ${r.staff.lastName}`.trim(),
    staffEmployeeId: r.staff.employeeId,
  }))
}

export async function listStaffPD(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffProfessionalDevelopment.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createPD(schoolId: string, staffId: string, input: CreatePDInput) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffProfessionalDevelopment.create({
    data: {
      staffId,
      type: input.type,
      title: input.title,
      provider: input.provider || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      status: input.status || 'upcoming',
      certificateUrl: input.certificateUrl || null,
      hours: input.hours || null,
      cost: input.cost || null,
    },
  })
}

export async function updatePD(schoolId: string, pdId: string, input: UpdatePDInput) {
  const pd = await prisma.staffProfessionalDevelopment.findUnique({ where: { id: pdId } })
  if (!pd) throw AppError.notFound('Professional development record not found')

  const data: any = {}
  if (input.type !== undefined) data.type = input.type
  if (input.title !== undefined) data.title = input.title
  if (input.provider !== undefined) data.provider = input.provider
  if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null
  if (input.status !== undefined) data.status = input.status
  if (input.certificateUrl !== undefined) data.certificateUrl = input.certificateUrl || null
  if (input.hours !== undefined) data.hours = input.hours
  if (input.cost !== undefined) data.cost = input.cost

  return prisma.staffProfessionalDevelopment.update({ where: { id: pdId }, data })
}

export async function deletePD(schoolId: string, pdId: string) {
  const pd = await prisma.staffProfessionalDevelopment.findUnique({ where: { id: pdId } })
  if (!pd) throw AppError.notFound('Professional development record not found')

  await prisma.staffProfessionalDevelopment.delete({ where: { id: pdId } })
  return { success: true }
}

// ==================== Performance Reviews ====================

export async function listAllReviews(schoolId: string) {
  const reviews = await prisma.staffPerformanceReview.findMany({
    where: { staff: { organizationId: schoolId } },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return reviews.map((r) => ({
    ...r,
    staffName: `${r.staff.firstName} ${r.staff.lastName}`.trim(),
    reviewerName: `${r.reviewer.firstName} ${r.reviewer.lastName}`.trim(),
  }))
}

export async function listStaffReviews(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffPerformanceReview.findMany({
    where: { staffId },
    include: {
      reviewer: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createReview(schoolId: string, input: CreateReviewInput) {
  const [staff, reviewer] = await Promise.all([
    prisma.staff.findFirst({ where: { id: input.staffId, organizationId: schoolId } }),
    prisma.staff.findFirst({ where: { id: input.reviewerId, organizationId: schoolId } }),
  ])
  if (!staff) throw AppError.notFound('Staff member not found')
  if (!reviewer) throw AppError.notFound('Reviewer not found')

  return prisma.staffPerformanceReview.create({
    data: {
      staffId: input.staffId,
      reviewerId: input.reviewerId,
      period: input.period,
      year: input.year,
      ratings: input.ratings || undefined,
      overallRating: input.overallRating || null,
      strengths: input.strengths || null,
      areasOfImprovement: input.areasOfImprovement || null,
      goals: input.goals || null,
      status: input.status || 'draft',
    },
  })
}

export async function acknowledgeReview(schoolId: string, reviewId: string) {
  const review = await prisma.staffPerformanceReview.findUnique({ where: { id: reviewId } })
  if (!review) throw AppError.notFound('Review not found')

  return prisma.staffPerformanceReview.update({
    where: { id: reviewId },
    data: { status: 'acknowledged' },
  })
}

// ==================== Skills ====================

export async function listStaffSkills(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffSkillRecord.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addStaffSkill(schoolId: string, staffId: string, input: CreateStaffSkillInput) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffSkillRecord.create({
    data: {
      staffId,
      skillName: input.skillName,
      category: input.category,
      proficiency: input.proficiency || 'beginner',
      yearsOfExperience: input.yearsOfExperience || null,
      selfAssessed: input.selfAssessed !== undefined ? input.selfAssessed : true,
    },
  })
}

export async function updateStaffSkill(schoolId: string, staffId: string, skillId: string, input: UpdateStaffSkillInput) {
  const skill = await prisma.staffSkillRecord.findFirst({ where: { id: skillId, staffId } })
  if (!skill) throw AppError.notFound('Skill record not found')

  const data: any = {}
  if (input.skillName !== undefined) data.skillName = input.skillName
  if (input.category !== undefined) data.category = input.category
  if (input.proficiency !== undefined) data.proficiency = input.proficiency
  if (input.yearsOfExperience !== undefined) data.yearsOfExperience = input.yearsOfExperience
  if (input.selfAssessed !== undefined) data.selfAssessed = input.selfAssessed
  if (input.verifiedBy !== undefined) data.verifiedBy = input.verifiedBy

  return prisma.staffSkillRecord.update({ where: { id: skillId }, data })
}

export async function deleteStaffSkill(schoolId: string, staffId: string, skillId: string) {
  const skill = await prisma.staffSkillRecord.findFirst({ where: { id: skillId, staffId } })
  if (!skill) throw AppError.notFound('Skill record not found')

  await prisma.staffSkillRecord.delete({ where: { id: skillId } })
  return { success: true }
}

export async function getSkillGaps(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: schoolId },
    include: { skillRecords: true, designation: true },
  })
  if (!staff) throw AppError.notFound('Staff member not found')

  // Basic skill gap analysis: find skills at beginner level or missing categories
  const allCategories = ['technical', 'soft', 'domain', 'tool', 'language'] as const
  const existingCategories = new Set(staff.skillRecords.map((s) => s.category))
  const missingCategories = allCategories.filter((c) => !existingCategories.has(c))
  const beginnerSkills = staff.skillRecords.filter((s) => s.proficiency === 'beginner')

  return {
    missingCategories,
    beginnerSkills: beginnerSkills.map((s) => ({ id: s.id, skillName: s.skillName, category: s.category })),
    totalSkills: staff.skillRecords.length,
    recommendations: missingCategories.map((c) => `Consider developing ${c} skills`),
  }
}

export async function getSkillsMatrix(schoolId: string) {
  const allStaff = await prisma.staff.findMany({
    where: { organizationId: schoolId, status: 'active' },
    include: {
      skillRecords: true,
      department: true,
    },
  })

  const matrix = allStaff.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`.trim(),
    employeeId: s.employeeId,
    department: s.department?.name || null,
    skills: s.skillRecords.map((sk) => ({
      name: sk.skillName,
      category: sk.category,
      proficiency: sk.proficiency,
    })),
  }))

  return matrix
}

// ==================== Certifications ====================

export async function listStaffCertifications(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffCertification.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addCertification(schoolId: string, staffId: string, input: CreateCertificationInput) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffCertification.create({
    data: {
      staffId,
      name: input.name,
      issuingOrganization: input.issuingOrganization || null,
      credentialId: input.credentialId || null,
      issueDate: input.issueDate ? new Date(input.issueDate) : null,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      doesNotExpire: input.doesNotExpire || false,
      status: input.status || 'active_cert',
      category: input.category || 'professional',
    },
  })
}

export async function updateCertification(schoolId: string, staffId: string, certId: string, input: UpdateCertificationInput) {
  const cert = await prisma.staffCertification.findFirst({ where: { id: certId, staffId } })
  if (!cert) throw AppError.notFound('Certification not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.issuingOrganization !== undefined) data.issuingOrganization = input.issuingOrganization
  if (input.credentialId !== undefined) data.credentialId = input.credentialId
  if (input.issueDate !== undefined) data.issueDate = input.issueDate ? new Date(input.issueDate) : null
  if (input.expiryDate !== undefined) data.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null
  if (input.doesNotExpire !== undefined) data.doesNotExpire = input.doesNotExpire
  if (input.status !== undefined) data.status = input.status
  if (input.category !== undefined) data.category = input.category

  return prisma.staffCertification.update({ where: { id: certId }, data })
}

export async function deleteCertification(schoolId: string, staffId: string, certId: string) {
  const cert = await prisma.staffCertification.findFirst({ where: { id: certId, staffId } })
  if (!cert) throw AppError.notFound('Certification not found')

  await prisma.staffCertification.delete({ where: { id: certId } })
  return { success: true }
}

export async function getExpiryAlerts(schoolId: string) {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const expiring = await prisma.staffCertification.findMany({
    where: {
      staff: { organizationId: schoolId },
      doesNotExpire: false,
      expiryDate: { lte: thirtyDaysFromNow },
      status: 'active_cert',
    },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { expiryDate: 'asc' },
  })

  return expiring.map((c) => ({
    ...c,
    staffName: `${c.staff.firstName} ${c.staff.lastName}`.trim(),
    staffEmployeeId: c.staff.employeeId,
    daysUntilExpiry: c.expiryDate
      ? Math.ceil((c.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  }))
}

// ==================== Onboarding ====================

export async function listOnboardingTasks(schoolId: string) {
  return prisma.staffOnboardingTask.findMany({ orderBy: { order: 'asc' } })
}

export async function listOnboardingChecklists(schoolId: string) {
  const checklists = await prisma.staffOnboardingChecklist.findMany({
    where: { staff: { organizationId: schoolId } },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return checklists.map((c) => ({
    ...c,
    staffName: `${c.staff.firstName} ${c.staff.lastName}`.trim(),
  }))
}

export async function getStaffOnboarding(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  const checklist = await prisma.staffOnboardingChecklist.findUnique({ where: { staffId } })
  return checklist
}

export async function createOnboarding(schoolId: string, staffId: string, input: CreateOnboardingInput) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  const existing = await prisma.staffOnboardingChecklist.findUnique({ where: { staffId } })
  if (existing) throw AppError.conflict('Onboarding checklist already exists for this staff member')

  // Load template tasks
  const templateTasks = await prisma.staffOnboardingTask.findMany({ orderBy: { order: 'asc' } })

  const joiningDate = staff.joiningDate || new Date()
  const tasks = templateTasks.map((t) => {
    const dueDate = new Date(joiningDate)
    dueDate.setDate(dueDate.getDate() + t.dueInDays)
    return {
      taskId: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      assignedTo: t.assignedTo,
      isMandatory: t.isMandatory,
      dueDate: dueDate.toISOString().split('T')[0],
      completed: false,
      completedDate: null,
      notes: null,
    }
  })

  // Target completion = max due date + 7 days buffer
  const targetDate = new Date(joiningDate)
  const maxDueInDays = templateTasks.reduce((max, t) => Math.max(max, t.dueInDays), 0)
  targetDate.setDate(targetDate.getDate() + maxDueInDays + 7)

  return prisma.staffOnboardingChecklist.create({
    data: {
      staffId,
      status: 'onboarding_in_progress',
      assignedHR: input.assignedHR || null,
      assignedManager: input.assignedManager || null,
      tasks,
      progress: 0,
      startDate: joiningDate,
      targetCompletionDate: targetDate,
    },
  })
}

export async function updateOnboardingTask(schoolId: string, staffId: string, taskId: string, input: UpdateOnboardingTaskInput) {
  const checklist = await prisma.staffOnboardingChecklist.findUnique({ where: { staffId } })
  if (!checklist) throw AppError.notFound('Onboarding checklist not found')

  const tasks = (checklist.tasks as any[]) || []
  const taskIndex = tasks.findIndex((t) => t.taskId === taskId)
  if (taskIndex === -1) throw AppError.notFound('Task not found in checklist')

  tasks[taskIndex].completed = input.completed
  tasks[taskIndex].completedDate = input.completed ? (input.completedDate || new Date().toISOString().split('T')[0]) : null
  if (input.notes !== undefined) tasks[taskIndex].notes = input.notes

  const completedCount = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
  const allDone = completedCount === tasks.length

  return prisma.staffOnboardingChecklist.update({
    where: { staffId },
    data: {
      tasks,
      progress,
      status: allDone ? 'onboarding_completed' : 'onboarding_in_progress',
    },
  })
}

// ==================== Exit Interviews ====================

export async function listExitInterviews(schoolId: string) {
  const interviews = await prisma.staffExitInterview.findMany({
    where: { staff: { organizationId: schoolId } },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return interviews.map((i) => ({
    ...i,
    staffName: `${i.staff.firstName} ${i.staff.lastName}`.trim(),
  }))
}

export async function getExitInterview(schoolId: string, staffId: string) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  return prisma.staffExitInterview.findUnique({ where: { staffId } })
}

export async function createExitInterview(schoolId: string, staffId: string, input: CreateExitInterviewInput) {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, organizationId: schoolId } })
  if (!staff) throw AppError.notFound('Staff member not found')

  const existing = await prisma.staffExitInterview.findUnique({ where: { staffId } })
  if (existing) throw AppError.conflict('Exit interview already exists for this staff member')

  return prisma.staffExitInterview.create({
    data: {
      staffId,
      lastWorkingDate: input.lastWorkingDate ? new Date(input.lastWorkingDate) : null,
      separationType: input.separationType || null,
      interviewDate: input.interviewDate ? new Date(input.interviewDate) : null,
      clearanceStatus: {
        hr: { status: 'pending' },
        finance: { status: 'pending' },
        it: { status: 'pending' },
        admin: { status: 'pending' },
      },
    },
  })
}

export async function updateExitInterview(schoolId: string, staffId: string, input: UpdateExitInterviewInput) {
  const interview = await prisma.staffExitInterview.findUnique({ where: { staffId } })
  if (!interview) throw AppError.notFound('Exit interview not found')

  const data: any = {}
  if (input.lastWorkingDate !== undefined) data.lastWorkingDate = input.lastWorkingDate ? new Date(input.lastWorkingDate) : null
  if (input.separationType !== undefined) data.separationType = input.separationType
  if (input.interviewDate !== undefined) data.interviewDate = input.interviewDate ? new Date(input.interviewDate) : null
  if (input.ratings !== undefined) data.ratings = input.ratings
  if (input.reasonForLeaving !== undefined) data.reasonForLeaving = input.reasonForLeaving
  if (input.handoverStatus !== undefined) data.handoverStatus = input.handoverStatus
  if (input.fnfStatus !== undefined) data.fnfStatus = input.fnfStatus
  if (input.status !== undefined) data.status = input.status

  return prisma.staffExitInterview.update({ where: { staffId }, data })
}

export async function updateClearance(schoolId: string, staffId: string, department: string, input: UpdateClearanceInput) {
  const interview = await prisma.staffExitInterview.findUnique({ where: { staffId } })
  if (!interview) throw AppError.notFound('Exit interview not found')

  const clearanceStatus = (interview.clearanceStatus as Record<string, any>) || {}
  clearanceStatus[department] = {
    status: input.status,
    clearedBy: input.clearedBy || null,
    clearedDate: input.clearedDate || null,
    remarks: input.remarks || null,
  }

  return prisma.staffExitInterview.update({
    where: { staffId },
    data: { clearanceStatus },
  })
}

// ==================== Bulk ====================

export async function bulkImportStaff(schoolId: string, input: BulkImportStaffInput) {
  const result = {
    total: input.staff.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ row: number; field: string; message: string }>,
  }

  for (let i = 0; i < input.staff.length; i++) {
    try {
      await createStaff(schoolId, input.staff[i])
      result.successful++
    } catch (err: any) {
      result.failed++
      result.errors.push({ row: i + 1, field: 'general', message: err.message })
    }
  }

  return result
}

export async function exportStaff(schoolId: string) {
  const staffList = await prisma.staff.findMany({
    where: { organizationId: schoolId },
    include: staffInclude,
    orderBy: { employeeId: 'asc' },
  })
  return staffList.map(formatStaff)
}
