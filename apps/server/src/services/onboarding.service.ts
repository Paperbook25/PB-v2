import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { hashPassword as betterAuthHash } from 'better-auth/crypto'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'
import { sendEmail } from './email.service.js'
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

  // 14-day trial
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

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

  // Send welcome email (non-blocking)
  sendWelcomeEmail(input.adminName, input.adminEmail, input.schoolName, slug).catch(
    (err) => console.error('[Onboarding] Failed to send welcome email:', err)
  )

  // Auto-create or update lead in Gravity CRM as "won"
  ;(async () => {
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
  const isComplete = newStep >= 6 // 6 total steps (0-5)

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
  ])

  const profileComplete = !!(profile?.name && profile?.address && profile?.phone && profile?.email)

  const items = [
    { key: 'school_profile', label: 'Complete school profile', done: profileComplete, link: '/settings' },
    { key: 'academic_year', label: 'Add academic year', done: academicYearCount > 0, link: '/settings?tab=academic' },
    { key: 'classes', label: 'Create classes & sections', done: classCount > 0, link: '/settings?tab=classes' },
    { key: 'subjects', label: 'Add subjects', done: subjectCount > 0, link: '/settings?tab=subjects' },
    { key: 'staff', label: 'Invite teachers', done: staffCount > 0, link: '/settings?tab=users' },
    { key: 'students', label: 'Add students', done: studentCount > 0, link: '/students/new' },
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
  await sendEmail({
    to: email,
    subject: `Welcome to PaperBook — ${schoolName} is ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Welcome to PaperBook! 🎉</h2>
        <p>Hi ${name},</p>
        <p>Your school <strong>${schoolName}</strong> has been created successfully. Here's what you can do next:</p>
        <ol style="line-height: 2;">
          <li>Complete your school profile</li>
          <li>Set up academic structure (classes, sections)</li>
          <li>Invite your team (teachers, accountant, principal)</li>
          <li>Add students</li>
          <li>Set up fee collection</li>
        </ol>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${env.isProd ? `https://${slug}.paperbook.app` : `http://${slug}.paperbook.local:5173`}/login"
             style="background-color: #4f46e5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Log in to your school
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Your school URL: <strong>${slug}.paperbook.app</strong></p>
        <p style="color: #6b7280; font-size: 14px;">You have a 14-day free trial. Explore all features!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook — School Management Platform</p>
      </div>
    `,
    text: `Welcome ${name}! Your school "${schoolName}" is ready at ${slug}.paperbook.app. Log in to get started.`,
  })
}
