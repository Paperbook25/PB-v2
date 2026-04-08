import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { hashPassword as betterAuthHash } from 'better-auth/crypto'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'
import { sendEmail, staffInvitationEmail } from './email.service.js'

export interface SendInvitationInput {
  email: string
  role: string
  name?: string
}

export interface AcceptInvitationInput {
  token: string
  name: string
  password: string
}

/**
 * Send a staff invitation
 */
export async function sendInvitation(
  schoolId: string,
  inviterId: string,
  input: SendInvitationInput
) {
  // Check if user already exists in this org
  const existingMember = await prisma.betterAuthUser.findUnique({
    where: { email: input.email },
    include: {
      members: { where: { organizationId: schoolId } },
    },
  })

  if (existingMember && existingMember.members.length > 0) {
    throw AppError.conflict('This user is already a member of your school')
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.orgInvitation.findFirst({
    where: {
      organizationId: schoolId,
      email: input.email,
      status: 'pending',
    },
  })

  if (existingInvite) {
    throw AppError.conflict('An invitation has already been sent to this email')
  }

  // Create invitation with secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7-day expiry

  const invitation = await prisma.orgInvitation.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: schoolId,
      email: input.email,
      role: input.role || 'member',
      status: 'pending',
      expiresAt,
      inviterId,
    },
  })

  // Get school name for email
  const school = await prisma.organization.findUnique({
    where: { id: schoolId },
    select: { name: true, slug: true },
  })

  // Send invite email (non-blocking)
  sendInviteEmail(
    input.name || input.email,
    input.email,
    school?.name || 'School',
    school?.slug || '',
    input.role,
    token,
    invitation.id
  ).catch((err) => console.error('[Invitation] Failed to send email:', err))

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  }
}

/**
 * List invitations for a school
 */
export async function listInvitations(schoolId: string) {
  const invitations = await prisma.orgInvitation.findMany({
    where: { organizationId: schoolId },
    orderBy: { createdAt: 'desc' },
    include: {
      inviter: { select: { name: true, email: true } },
    },
  })

  return invitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    invitedBy: inv.inviter.name || inv.inviter.email,
    expired: inv.status === 'pending' && inv.expiresAt < new Date(),
  }))
}

/**
 * Resend an invitation
 */
export async function resendInvitation(schoolId: string, invitationId: string) {
  const invitation = await prisma.orgInvitation.findFirst({
    where: { id: invitationId, organizationId: schoolId, status: 'pending' },
  })

  if (!invitation) {
    throw AppError.notFound('Invitation not found')
  }

  // Extend expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.orgInvitation.update({
    where: { id: invitationId },
    data: { expiresAt },
  })

  const school = await prisma.organization.findUnique({
    where: { id: schoolId },
    select: { name: true, slug: true },
  })

  const token = crypto.randomBytes(32).toString('hex')

  sendInviteEmail(
    invitation.email,
    invitation.email,
    school?.name || 'School',
    school?.slug || '',
    invitation.role || 'member',
    token,
    invitation.id
  ).catch((err) => console.error('[Invitation] Failed to resend email:', err))

  return { success: true }
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(schoolId: string, invitationId: string) {
  const invitation = await prisma.orgInvitation.findFirst({
    where: { id: invitationId, organizationId: schoolId },
  })

  if (!invitation) {
    throw AppError.notFound('Invitation not found')
  }

  await prisma.orgInvitation.update({
    where: { id: invitationId },
    data: { status: 'canceled' },
  })

  return { success: true }
}

/**
 * Accept an invitation — public endpoint
 */
export async function acceptInvitation(input: AcceptInvitationInput) {
  // Find invitation by ID (token is passed as the invitation ID in the invite link)
  const invitation = await prisma.orgInvitation.findFirst({
    where: {
      id: input.token,
      status: 'pending',
    },
    include: {
      organization: { select: { name: true, slug: true } },
    },
  })

  if (!invitation) {
    throw AppError.notFound('Invitation not found or has expired')
  }

  if (invitation.expiresAt < new Date()) {
    throw AppError.badRequest('This invitation has expired')
  }

  // Check if user already exists
  const existingUser = await prisma.betterAuthUser.findUnique({
    where: { email: invitation.email },
  })

  if (existingUser) {
    // User exists — just add them to the org
    const existingMember = await prisma.orgMember.findFirst({
      where: { organizationId: invitation.organizationId, userId: existingUser.id },
    })

    if (!existingMember) {
      await prisma.orgMember.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: invitation.organizationId,
          userId: existingUser.id,
          role: invitation.role || 'member',
        },
      })
    }

    await prisma.orgInvitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    })

    return {
      success: true,
      schoolName: invitation.organization.name,
      slug: invitation.organization.slug,
    }
  }

  // Create new user
  const userId = crypto.randomUUID()
  const accountId = crypto.randomUUID()
  const memberId = crypto.randomUUID()
  const betterAuthPasswordHash = await betterAuthHash(input.password)
  const legacyPasswordHash = await bcrypt.hash(input.password, 12)

  // Map org role to school role
  const schoolRole = mapOrgRoleToSchoolRole(invitation.role || 'member')

  await prisma.$transaction(async (tx) => {
    // BetterAuthUser
    await tx.betterAuthUser.create({
      data: {
        id: userId,
        name: input.name,
        email: invitation.email,
        emailVerified: true, // verified via invitation
        role: 'user',
      },
    })

    // BetterAuthAccount — uses better-auth's scrypt hash
    await tx.betterAuthAccount.create({
      data: {
        id: accountId,
        accountId: userId,
        providerId: 'credential',
        userId,
        password: betterAuthPasswordHash,
      },
    })

    // OrgMember
    await tx.orgMember.create({
      data: {
        id: memberId,
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role || 'member',
      },
    })

    // Legacy User — uses bcrypt hash
    await tx.user.create({
      data: {
        id: userId,
        email: invitation.email,
        passwordHash: legacyPasswordHash,
        name: input.name,
        role: schoolRole,
        isActive: true,
      },
    })

    // Mark invitation as accepted
    await tx.orgInvitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    })
  })

  // Send welcome email
  sendEmail({
    to: invitation.email,
    subject: `Welcome to ${invitation.organization.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">You're in! 🎉</h2>
        <p>Hi ${input.name},</p>
        <p>You've been added to <strong>${invitation.organization.name}</strong> as <strong>${schoolRole}</strong>.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${env.isProd ? `https://${invitation.organization.slug}.paperbook.app` : `http://${invitation.organization.slug}.paperbook.local:5173`}/login"
             style="background-color: #4f46e5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Log in now
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook — School Management Platform</p>
      </div>
    `,
    text: `Welcome ${input.name}! You've been added to ${invitation.organization.name}. Log in to get started.`,
  }).catch((err) => console.error('[Invitation] Welcome email failed:', err))

  return {
    success: true,
    schoolName: invitation.organization.name,
    slug: invitation.organization.slug,
  }
}

/**
 * Get invitation details by ID (for accept-invite page)
 */
export async function getInvitationDetails(invitationId: string) {
  const invitation = await prisma.orgInvitation.findFirst({
    where: { id: invitationId },
    include: {
      organization: { select: { name: true, logo: true } },
    },
  })

  if (!invitation) {
    throw AppError.notFound('Invitation not found')
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    expired: invitation.status === 'pending' && invitation.expiresAt < new Date(),
    schoolName: invitation.organization.name,
    schoolLogo: invitation.organization.logo,
  }
}

// --- Helpers ---

function mapOrgRoleToSchoolRole(orgRole: string): 'admin' | 'principal' | 'teacher' | 'accountant' | 'librarian' | 'transport_manager' {
  switch (orgRole) {
    case 'owner':
    case 'admin':
      return 'admin'
    case 'principal':
      return 'principal'
    case 'accountant':
      return 'accountant'
    case 'librarian':
      return 'librarian'
    case 'transport_manager':
      return 'transport_manager'
    default:
      return 'teacher'
  }
}

async function sendInviteEmail(
  name: string,
  email: string,
  schoolName: string,
  slug: string,
  role: string,
  _token: string,
  invitationId: string
) {
  const acceptUrl = env.isProd
    ? `https://${slug}.paperbook.app/accept-invite?token=${invitationId}`
    : `http://${slug || 'localhost'}.paperbook.local:5173/accept-invite?token=${invitationId}`

  const template = staffInvitationEmail(name, 'PaperBook', schoolName, role, acceptUrl)
  await sendEmail({ ...template, to: email })
}
