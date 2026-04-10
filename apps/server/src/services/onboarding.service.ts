import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { hashPassword as betterAuthHash } from 'better-auth/crypto'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'
import { sendEmail, welcomeEmail } from './email.service.js'
import { provisionAddonsForPlan } from './addon.service.js'
import type { PlanTier } from '../config/plan-tiers.js'

export interface RegisterSchoolInput {
  schoolName: string
  adminName: string
  adminEmail: string
  adminPassword: string
  phone?: string
  city?: string
  state?: string
  affiliationBoard?: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'Other'
  institutionType?: string
  activationToken?: string
}

export interface OnboardingStatus {
  onboardingCompleted: boolean
  onboardingStep: number
  schoolProfile: {
    name: string
    logo: string | null
    city: string | null
    state: string | null
    phone: string | null
    email: string | null
    affiliationBoard: string | null
  }
}

/**
 * Self-service school registration.
 * Creates: Organization → SchoolProfile → BetterAuthUser → BetterAuthAccount → OrgMember → User
 */
export async function registerSchool(input: RegisterSchoolInput) {
  // Check if email already exists
  const existingUser = await prisma.betterAuthUser.findUnique({
    where: { email: input.adminEmail },
  })
  if (existingUser) {
    throw AppError.conflict('An account with this email already exists')
  }

  // Generate IDs and slug
  const orgId = crypto.randomUUID()
  const userId = crypto.randomUUID()
  const accountId = crypto.randomUUID()
  const memberId = crypto.randomUUID()
  const slug = generateSlug(input.schoolName)

  // Check slug uniqueness
  const existingOrg = await prisma.organization.findUnique({ where: { slug } })
  if (existingOrg) {
    throw AppError.conflict('A school with a similar name already exists. Please choose a different name.')
  }

  // Hash password — better-auth uses scrypt internally, legacy User uses bcrypt
  const betterAuthPasswordHash = await betterAuthHash(input.adminPassword)
  const legacyPasswordHash = await bcrypt.hash(input.adminPassword, 12)

  // 15-day trial
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 15)

  // Create everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Organization
    const org = await tx.organization.create({
      data: {
        id: orgId,
        name: input.schoolName,
        slug,
      },
    })

    // 2. SchoolProfile
    await tx.schoolProfile.create({
      data: {
        id: orgId,
        name: input.schoolName,
        city: input.city || null,
        state: input.state || null,
        phone: input.phone || null,
        email: input.adminEmail,
        affiliationBoard: input.affiliationBoard || null,
        status: 'trial',
        planTier: 'free',
        maxUsers: 100,
        maxStudents: 500,
        trialEndsAt,
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    })

    // 3. BetterAuthUser
    await tx.betterAuthUser.create({
      data: {
        id: userId,
        name: input.adminName,
        email: input.adminEmail,
        emailVerified: false,
        role: 'user',
      },
    })

    // 4. BetterAuthAccount (credential) — uses better-auth's scrypt hash
    await tx.betterAuthAccount.create({
      data: {
        id: accountId,
        accountId: userId,
        providerId: 'credential',
        userId,
        password: betterAuthPasswordHash,
      },
    })

    // 5. OrgMember (owner)
    await tx.orgMember.create({
      data: {
        id: memberId,
        organizationId: orgId,
        userId,
        role: 'owner',
      },
    })

    // 6. Legacy User record (for backward compat with existing modules)
    await tx.user.create({
      data: {
        id: userId,
        email: input.adminEmail,
        passwordHash: legacyPasswordHash,
        name: input.adminName,
        role: 'admin',
        phone: input.phone || null,
        isActive: true,
      },
    })

    // 7. Auto-enable all addons included in the plan tier
    await provisionAddonsForPlan(orgId, 'free' as PlanTier, userId, tx)

    // 8. Auto-create platform subscription (trial)
    await tx.platformSubscription.create({
      data: {
        schoolId: orgId,
        planTier: 'free',
        status: 'sub_trial',
        billingCycle: 'monthly',
        amount: 0,
        trialStartedAt: new Date(),
        trialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
        nextBillingDate: trialEndsAt,
      },
    })

    return { org, slug, userId }
  })

  // Auto-create default policies (non-blocking, non-critical)
  autoCreateDefaults(orgId).catch(
    (err) => console.error('[Onboarding] Failed to create default policies:', err)
  )

  // Send welcome or activated email (non-blocking)
  if (input.activationToken) {
    ;(async () => {
      try {
        const { isEmailEventEnabled, sendEmail: _sendEmail, schoolActivatedEmail } = await import('./email.service.js')
        if (await isEmailEventEnabled('school_activated')) {
          const loginUrl = `https://${slug}.${env.APP_DOMAIN}`
          const opts = { ...schoolActivatedEmail(input.adminName, input.schoolName, loginUrl), to: input.adminEmail }
          _sendEmail(opts, 'school_activated').catch(() => {})
        }
      } catch (err) {
        console.error('[Onboarding] Failed to send school activated email:', err)
      }
    })()
  } else {
    sendWelcomeEmail(input.adminName, input.adminEmail, input.schoolName, slug).catch(
      (err) => console.error('[Onboarding] Failed to send welcome email:', err)
    )
  }

  // Mark lead as won — prefer leadId from activationToken JWT, fall back to email match
  ;(async () => {
    if (input.activationToken) {
      try {
        const jwt = await import('jsonwebtoken')
        const payload = jwt.default.verify(input.activationToken, env.JWT_SECRET) as any
        if (payload?.leadId) {
          await prisma.lead.updateMany({
            where: { id: payload.leadId, status: { not: 'lead_won' } },
            data: { status: 'lead_won', convertedSchoolId: result.org.id },
          })
          return
        }
      } catch { /* token expired or invalid — fall through to email match */ }
    }
    const existingLead = await prisma.lead.findFirst({ where: { contactEmail: input.adminEmail } })
    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: { status: 'lead_won', convertedSchoolId: result.org.id },
      })
    } else {
      await prisma.lead.create({
        data: {
          schoolName: input.schoolName,
          contactName: input.adminName,
          contactEmail: input.adminEmail,
          contactPhone: input.phone || null,
          city: input.city || null,
          state: input.state || null,
          source: 'website',
          status: 'lead_won',
          convertedSchoolId: result.org.id,
        },
      })
    }
  })().catch((err) => console.error('[Onboarding] Lead sync failed:', err))

  return {
    slug: result.slug,
    schoolName: input.schoolName,
    adminEmail: input.adminEmail,
  }
}

/**
 * Get onboarding status for a school
 */
export async function getOnboardingStatus(schoolId: string): Promise<OnboardingStatus> {
  const profile = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    select: {
      name: true,
      logo: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      affiliationBoard: true,
      onboardingCompleted: true,
      onboardingStep: true,
    },
  })

  if (!profile) {
    throw AppError.notFound('School profile not found')
  }

  return {
    onboardingCompleted: profile.onboardingCompleted,
    onboardingStep: profile.onboardingStep,
    schoolProfile: {
      name: profile.name,
      logo: profile.logo,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      email: profile.email,
      affiliationBoard: profile.affiliationBoard,
    },
  }
}

/**
 * Complete an onboarding step
 */
export async function completeOnboardingStep(schoolId: string, step: number) {
  const profile = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    select: { onboardingStep: true, onboardingCompleted: true },
  })

  if (!profile) {
    throw AppError.notFound('School profile not found')
  }

  // Only advance if this is the next step or current step
  const newStep = Math.max(profile.onboardingStep, step + 1)
  const isComplete = newStep >= 7 // 7 total steps (0-6)

  await prisma.schoolProfile.update({
    where: { id: schoolId },
    data: {
      onboardingStep: newStep,
      onboardingCompleted: isComplete,
      ...(isComplete ? { onboardedAt: new Date() } : {}),
    },
  })

  return { onboardingStep: newStep, onboardingCompleted: isComplete }
}

/**
 * Skip onboarding entirely
 */
export async function skipOnboarding(schoolId: string) {
  await prisma.schoolProfile.update({
    where: { id: schoolId },
    data: {
      onboardingCompleted: true,
      onboardedAt: new Date(),
    },
  })

  return { onboardingCompleted: true }
}

/**
 * Get setup checklist data — counts real data to determine completion
 */
export async function getSetupChecklist(schoolId: string) {
  const [
    profile,
    academicYearCount,
    classCount,
    subjectCount,
    staffCount,
    studentCount,
    feeTypeCount,
    websitePageCount,
    attendancePolicyCount,
    leavePolicyCount,
    periodCount,
  ] = await Promise.all([
    prisma.schoolProfile.findUnique({
      where: { id: schoolId },
      select: {
        name: true, address: true, phone: true, email: true, logo: true,
        onboardingCompleted: true,
      },
    }),
    prisma.academicYear.count({ where: { organizationId: schoolId } }),
    prisma.class.count({ where: { organizationId: schoolId } }),
    prisma.subject.count({ where: { organizationId: schoolId } }),
    prisma.staff.count({ where: { organizationId: schoolId } }),
    prisma.student.count({ where: { organizationId: schoolId } }),
    prisma.feeType.count({ where: { organizationId: schoolId } }),
    prisma.websitePage.count({ where: { organizationId: schoolId } }),
    prisma.attendancePolicy.count({ where: { organizationId: schoolId } }),
    prisma.staffLeavePolicy.count({ where: { organizationId: schoolId } }),
    prisma.periodDefinition.count({ where: { organizationId: schoolId } }),
  ])

  const profileComplete = !!(profile?.name && profile?.address && profile?.phone && profile?.email)

  const items = [
    { key: 'school_profile', label: 'Complete school profile', done: profileComplete, link: '/settings' },
    { key: 'academic_year', label: 'Add academic year', done: academicYearCount > 0, link: '/settings?tab=general&subtab=academic' },
    { key: 'classes', label: 'Create classes & sections', done: classCount > 0, link: '/settings?tab=general&subtab=classes' },
    { key: 'subjects', label: 'Add subjects', done: subjectCount > 0, link: '/settings?tab=general&subtab=classes' },
    { key: 'attendance_policy', label: 'Configure attendance policy', done: attendancePolicyCount > 0, link: '/settings?tab=general&subtab=attendance-policy' },
    { key: 'leave_policy', label: 'Set up leave policy', done: leavePolicyCount > 0, link: '/settings?tab=general&subtab=leave-policy' },
    { key: 'periods', label: 'Define school timings', done: periodCount > 0, link: '/settings?tab=general&subtab=attendance-policy' },
    { key: 'staff', label: 'Invite teachers', done: staffCount > 0, link: '/settings?tab=general&subtab=users' },
    { key: 'students', label: 'Add students', done: studentCount > 0, link: '/people?tab=students' },
    { key: 'fees', label: 'Set up fee structure', done: feeTypeCount > 0, link: '/finance' },
    { key: 'website', label: 'Create your website', done: websitePageCount > 0, link: '/school-website' },
  ]

  const completed = items.filter((i) => i.done).length

  return {
    items,
    completed,
    total: items.length,
    dismissed: profile?.onboardingCompleted ?? false,
  }
}

/**
 * Quick-setup: batch create academic year + classes + sections
 */
export async function quickSetupAcademics(
  schoolId: string,
  input: { academicYear: string; classes: string[]; sections: string[] }
) {
  const { academicYear, classes, sections } = input

  if (!academicYear || !classes.length || !sections.length) {
    throw AppError.badRequest('Academic year, classes, and sections are required')
  }

  // Parse academic year (e.g., "2024-25" → Apr 2024 - Mar 2025)
  const yearMatch = academicYear.match(/^(\d{4})-(\d{2,4})$/)
  const startYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()

  const result = await prisma.$transaction(async (tx) => {
    // Create academic year if not exists
    const existingYear = await tx.academicYear.findFirst({
      where: { organizationId: schoolId, name: academicYear },
    })

    const year = existingYear || await tx.academicYear.create({
      data: {
        organizationId: schoolId,
        name: academicYear,
        startDate: new Date(`${startYear}-04-01`),
        endDate: new Date(`${startYear + 1}-03-31`),
        isCurrent: true,
        status: 'active',
      },
    })

    // Create classes with sections
    let sortOrder = 0
    const createdClasses = []

    for (const className of classes) {
      const existingClass = await tx.class.findFirst({
        where: { organizationId: schoolId, name: className },
      })

      if (existingClass) {
        createdClasses.push(existingClass)
        continue
      }

      const cls = await tx.class.create({
        data: {
          organizationId: schoolId,
          name: className,
          sortOrder: sortOrder++,
          sections: {
            create: sections.map((s) => ({ name: s })),
          },
        },
        include: { sections: true },
      })
      createdClasses.push(cls)
    }

    return { academicYear: year, classesCreated: createdClasses.length }
  })

  return result
}

/**
 * Quick-setup: batch create fee types
 */
export async function quickSetupFees(
  schoolId: string,
  input: { feeTypes: { name: string; amount: number }[] }
) {
  if (!input.feeTypes?.length) {
    throw AppError.badRequest('At least one fee type is required')
  }

  const created = await prisma.$transaction(async (tx) => {
    const results = []
    for (const ft of input.feeTypes) {
      const existing = await tx.feeType.findFirst({
        where: { organizationId: schoolId, name: ft.name },
      })

      if (existing) {
        results.push(existing)
        continue
      }

      const created = await tx.feeType.create({
        data: {
          organizationId: schoolId,
          name: ft.name,
          category: 'fee_tuition',
          description: `${ft.name} - ₹${ft.amount}/month`,
          isActive: true,
        },
      })
      results.push(created)
    }
    return results
  })

  return { created: created.length }
}

/**
 * Auto-create default policies when a school registers.
 * Ensures the school is operational even if the wizard is skipped.
 */
async function autoCreateDefaults(schoolId: string) {
  // 1. Attendance Policy
  const existingAttPolicy = await prisma.attendancePolicy.findUnique({ where: { organizationId: schoolId } })
  if (!existingAttPolicy) {
    await prisma.attendancePolicy.create({ data: { organizationId: schoolId } })
  }

  // 2. Staff Leave Policy
  const existingLeavePolicy = await prisma.staffLeavePolicy.findUnique({ where: { organizationId: schoolId } })
  if (!existingLeavePolicy) {
    await prisma.staffLeavePolicy.create({ data: { organizationId: schoolId } })
  }

  // 3. Default Work Schedule
  const existingSchedule = await prisma.workSchedule.findFirst({ where: { organizationId: schoolId } })
  if (!existingSchedule) {
    await prisma.workSchedule.create({
      data: {
        organizationId: schoolId,
        name: 'Default Schedule',
        startTime: '09:00',
        endTime: '15:30',
        breakStartTime: '12:30',
        breakEndTime: '13:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        graceMinutes: 15,
        isDefault: true,
      },
    })
  }

  // 4. Default Period Definitions (8 periods + lunch + assembly)
  const existingPeriods = await prisma.periodDefinition.count({ where: { organizationId: schoolId } })
  if (existingPeriods === 0) {
    const defaultPeriods = [
      { name: 'Assembly', periodNumber: 0, startTime: '08:45', endTime: '09:00', type: 'period_assembly' },
      { name: 'Period 1', periodNumber: 1, startTime: '09:00', endTime: '09:40', type: 'period_class' },
      { name: 'Period 2', periodNumber: 2, startTime: '09:40', endTime: '10:20', type: 'period_class' },
      { name: 'Period 3', periodNumber: 3, startTime: '10:20', endTime: '11:00', type: 'period_class' },
      { name: 'Break', periodNumber: 4, startTime: '11:00', endTime: '11:15', type: 'period_break' },
      { name: 'Period 4', periodNumber: 5, startTime: '11:15', endTime: '11:55', type: 'period_class' },
      { name: 'Period 5', periodNumber: 6, startTime: '11:55', endTime: '12:35', type: 'period_class' },
      { name: 'Lunch', periodNumber: 7, startTime: '12:35', endTime: '13:05', type: 'period_lunch' },
      { name: 'Period 6', periodNumber: 8, startTime: '13:05', endTime: '13:45', type: 'period_class' },
      { name: 'Period 7', periodNumber: 9, startTime: '13:45', endTime: '14:25', type: 'period_class' },
      { name: 'Period 8', periodNumber: 10, startTime: '14:25', endTime: '15:05', type: 'period_class' },
    ]

    for (const p of defaultPeriods) {
      await prisma.periodDefinition.create({
        data: { organizationId: schoolId, ...p, type: p.type as any },
      })
    }
  }
}

/**
 * Quick-setup: batch create subjects for selected classes
 */
export async function quickSetupSubjects(
  schoolId: string,
  input: { subjects: string[]; classIds?: string[] }
) {
  if (!input.subjects?.length) {
    throw AppError.badRequest('At least one subject is required')
  }

  const created: string[] = []
  for (const subjectName of input.subjects) {
    const existing = await prisma.subject.findFirst({
      where: { organizationId: schoolId, name: subjectName },
    })
    if (existing) continue

    const code = subjectName.substring(0, 3).toUpperCase().replace(/\s/g, '')
    await prisma.subject.create({
      data: { organizationId: schoolId, name: subjectName, code },
    })
    created.push(subjectName)
  }

  return { created: created.length, subjects: created }
}

/**
 * Quick-setup: create/update attendance + leave + period policies in one call
 */
export async function quickSetupPolicies(
  schoolId: string,
  input: {
    schoolStartTime?: string
    schoolEndTime?: string
    minimumAttendance?: number
    lateAfterMinutes?: number
    enableAlerts?: boolean
    defaultEL?: number
    defaultCL?: number
    defaultSL?: number
    defaultPL?: number
  }
) {
  // 1. Update or create attendance policy
  const existingAtt = await prisma.attendancePolicy.findUnique({ where: { organizationId: schoolId } })
  if (existingAtt) {
    await prisma.attendancePolicy.update({
      where: { organizationId: schoolId },
      data: {
        minimumPercentage: input.minimumAttendance ?? existingAtt.minimumPercentage,
        lateAfterMinutes: input.lateAfterMinutes ?? existingAtt.lateAfterMinutes,
        schoolStartTime: input.schoolStartTime ?? existingAtt.schoolStartTime,
        enabled: input.enableAlerts ?? existingAtt.enabled,
      },
    })
  } else {
    await prisma.attendancePolicy.create({
      data: {
        organizationId: schoolId,
        minimumPercentage: input.minimumAttendance ?? 75,
        lateAfterMinutes: input.lateAfterMinutes ?? 15,
        schoolStartTime: input.schoolStartTime ?? '09:00',
        enabled: input.enableAlerts ?? true,
      },
    })
  }

  // 2. Update or create leave policy
  const existingLeave = await prisma.staffLeavePolicy.findUnique({ where: { organizationId: schoolId } })
  if (existingLeave) {
    await prisma.staffLeavePolicy.update({
      where: { organizationId: schoolId },
      data: {
        defaultEL: input.defaultEL ?? existingLeave.defaultEL,
        defaultCL: input.defaultCL ?? existingLeave.defaultCL,
        defaultSL: input.defaultSL ?? existingLeave.defaultSL,
        defaultPL: input.defaultPL ?? existingLeave.defaultPL,
      },
    })
  } else {
    await prisma.staffLeavePolicy.create({
      data: {
        organizationId: schoolId,
        defaultEL: input.defaultEL ?? 15,
        defaultCL: input.defaultCL ?? 12,
        defaultSL: input.defaultSL ?? 12,
        defaultPL: input.defaultPL ?? 7,
      },
    })
  }

  // 3. Regenerate period definitions if school times provided
  if (input.schoolStartTime && input.schoolEndTime) {
    // Delete existing periods and recreate based on new timings
    await prisma.periodDefinition.deleteMany({ where: { organizationId: schoolId } })

    const startMinutes = timeToMinutes(input.schoolStartTime)
    const endMinutes = timeToMinutes(input.schoolEndTime)
    const totalMinutes = endMinutes - startMinutes
    const periodDuration = 40 // minutes per period
    const breakDuration = 15
    const lunchDuration = 30
    const assemblyDuration = 15

    let currentTime = startMinutes - assemblyDuration
    let periodNum = 0

    // Assembly
    await prisma.periodDefinition.create({
      data: { organizationId: schoolId, name: 'Assembly', periodNumber: periodNum++, startTime: minutesToTime(currentTime), endTime: minutesToTime(currentTime + assemblyDuration), type: 'period_assembly' as any },
    })
    currentTime += assemblyDuration

    // Generate periods with break after 3rd and lunch after 5th
    let classNum = 1
    while (currentTime + periodDuration <= endMinutes && classNum <= 8) {
      if (classNum === 4) {
        // Break
        await prisma.periodDefinition.create({
          data: { organizationId: schoolId, name: 'Break', periodNumber: periodNum++, startTime: minutesToTime(currentTime), endTime: minutesToTime(currentTime + breakDuration), type: 'period_break' as any },
        })
        currentTime += breakDuration
      }
      if (classNum === 6) {
        // Lunch
        await prisma.periodDefinition.create({
          data: { organizationId: schoolId, name: 'Lunch', periodNumber: periodNum++, startTime: minutesToTime(currentTime), endTime: minutesToTime(currentTime + lunchDuration), type: 'period_lunch' as any },
        })
        currentTime += lunchDuration
      }

      await prisma.periodDefinition.create({
        data: { organizationId: schoolId, name: `Period ${classNum}`, periodNumber: periodNum++, startTime: minutesToTime(currentTime), endTime: minutesToTime(currentTime + periodDuration), type: 'period_class' as any },
      })
      currentTime += periodDuration
      classNum++
    }
  }

  return { success: true }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// --- Helpers ---

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

  // Add random suffix to ensure uniqueness
  const suffix = crypto.randomBytes(3).toString('hex')
  return `${base}-${suffix}`
}

async function sendWelcomeEmail(name: string, email: string, schoolName: string, slug: string) {
  const loginLink = env.isProd
    ? `https://${slug}.paperbook.app/login`
    : `http://${slug}.paperbook.local:5173/login`

  const template = welcomeEmail(name, schoolName, loginLink)
  await sendEmail({ ...template, to: email })
}
