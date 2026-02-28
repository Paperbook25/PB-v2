import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  clubs,
  memberships,
  activities,
  achievements,
  credits,
  competitions,
  registrations,
  getClubStats,
  getAvailableStudents,
  getAvailableAdvisors,
} from '../data/clubs.data'
import type {
  Club,
  ClubMembership,
  Activity,
  Achievement,
  ExtracurricularCredit,
  Competition,
  CompetitionRegistration,
  CreateClubRequest,
  UpdateClubRequest,
  CreateMembershipRequest,
  UpdateMembershipRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  CreateCreditRequest,
  UpdateCreditRequest,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
  CreditSummary,
} from '@/features/clubs/types/clubs.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const clubsHandlers = [
  // ==================== CLUB HANDLERS ====================

  // Get all clubs with pagination and filters
  http.get('/api/clubs', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const advisorId = url.searchParams.get('advisorId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filtered = [...clubs]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.advisorName.toLowerCase().includes(search)
      )
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category === category)
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status)
    }

    // Advisor filter
    if (advisorId) {
      filtered = filtered.filter((c) => c.advisorId === advisorId)
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedClubs = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedClubs,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single club
  http.get('/api/clubs/:id', async ({ params }) => {
    await mockDelay('read')
    const club = clubs.find((c) => c.id === params.id)

    if (!club) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: club })
  }),

  // Create new club
  http.post('/api/clubs', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateClubRequest

    const advisor = getAvailableAdvisors().find((a) => a.id === body.advisorId)
    if (!advisor) {
      return HttpResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    const newClub: Club = {
      id: `club-${generateId()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      status: 'pending_approval',
      advisorId: body.advisorId,
      advisorName: advisor.name,
      foundedDate: new Date().toISOString().split('T')[0],
      meetingSchedule: body.meetingSchedule,
      meetingLocation: body.meetingLocation,
      maxMembers: body.maxMembers,
      currentMembers: 0,
      logoUrl: body.logoUrl,
      website: body.website,
      email: body.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    clubs.unshift(newClub)

    return HttpResponse.json({ data: newClub }, { status: 201 })
  }),

  // Update club
  http.put('/api/clubs/:id', async ({ params, request }) => {
    await mockDelay('write')
    const clubIndex = clubs.findIndex((c) => c.id === params.id)

    if (clubIndex === -1) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateClubRequest
    const existingClub = clubs[clubIndex]

    // Handle advisor change
    let advisorName = existingClub.advisorName
    if (body.advisorId && body.advisorId !== existingClub.advisorId) {
      const advisor = getAvailableAdvisors().find((a) => a.id === body.advisorId)
      if (!advisor) {
        return HttpResponse.json({ error: 'Advisor not found' }, { status: 404 })
      }
      advisorName = advisor.name
    }

    // Handle president/VP/secretary changes
    let presidentName = existingClub.presidentName
    let vicePresidentName = existingClub.vicePresidentName
    let secretaryName = existingClub.secretaryName

    if (body.presidentId !== undefined) {
      if (body.presidentId) {
        const student = getAvailableStudents().find((s) => s.id === body.presidentId)
        presidentName = student?.name
      } else {
        presidentName = undefined
      }
    }

    if (body.vicePresidentId !== undefined) {
      if (body.vicePresidentId) {
        const student = getAvailableStudents().find((s) => s.id === body.vicePresidentId)
        vicePresidentName = student?.name
      } else {
        vicePresidentName = undefined
      }
    }

    if (body.secretaryId !== undefined) {
      if (body.secretaryId) {
        const student = getAvailableStudents().find((s) => s.id === body.secretaryId)
        secretaryName = student?.name
      } else {
        secretaryName = undefined
      }
    }

    const updatedClub: Club = {
      ...existingClub,
      ...body,
      advisorName,
      presidentName,
      vicePresidentName,
      secretaryName,
      updatedAt: new Date().toISOString(),
    }

    clubs[clubIndex] = updatedClub

    return HttpResponse.json({ data: updatedClub })
  }),

  // Delete club
  http.delete('/api/clubs/:id', async ({ params }) => {
    await mockDelay('write')
    const clubIndex = clubs.findIndex((c) => c.id === params.id)

    if (clubIndex === -1) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    // Check for active memberships
    const hasActiveMembers = memberships.some(
      (m) => m.clubId === params.id && m.status === 'active'
    )

    if (hasActiveMembers) {
      return HttpResponse.json(
        { error: 'Cannot delete club with active members' },
        { status: 400 }
      )
    }

    clubs.splice(clubIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== MEMBERSHIP HANDLERS ====================

  // Get all memberships with filters
  http.get('/api/clubs/memberships', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const clubId = url.searchParams.get('clubId')
    const studentId = url.searchParams.get('studentId')
    const role = url.searchParams.get('role')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...memberships]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.studentName.toLowerCase().includes(search) ||
          m.clubName.toLowerCase().includes(search)
      )
    }

    // Club filter
    if (clubId) {
      filtered = filtered.filter((m) => m.clubId === clubId)
    }

    // Student filter
    if (studentId) {
      filtered = filtered.filter((m) => m.studentId === studentId)
    }

    // Role filter
    if (role && role !== 'all') {
      filtered = filtered.filter((m) => m.role === role)
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((m) => m.status === status)
    }

    // Sort by joined date descending
    filtered.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedMemberships = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedMemberships,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single membership
  http.get('/api/clubs/memberships/:id', async ({ params }) => {
    await mockDelay('read')
    const membership = memberships.find((m) => m.id === params.id)

    if (!membership) {
      return HttpResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: membership })
  }),

  // Create membership (join club / apply)
  http.post('/api/clubs/memberships', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateMembershipRequest

    const club = clubs.find((c) => c.id === body.clubId)
    if (!club) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const student = getAvailableStudents().find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if already a member
    const existingMembership = memberships.find(
      (m) => m.clubId === body.clubId && m.studentId === body.studentId && m.status !== 'rejected'
    )
    if (existingMembership) {
      return HttpResponse.json(
        { error: 'Student already has an active or pending membership' },
        { status: 400 }
      )
    }

    // Check max members
    if (club.maxMembers) {
      const currentCount = memberships.filter(
        (m) => m.clubId === body.clubId && m.status === 'active'
      ).length
      if (currentCount >= club.maxMembers) {
        return HttpResponse.json({ error: 'Club has reached maximum members' }, { status: 400 })
      }
    }

    const newMembership: ClubMembership = {
      id: `mem-${generateId()}`,
      clubId: body.clubId,
      clubName: club.name,
      studentId: body.studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      role: body.role || 'member',
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      applicationReason: body.applicationReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    memberships.unshift(newMembership)

    return HttpResponse.json({ data: newMembership }, { status: 201 })
  }),

  // Update membership (approve, reject, change role, etc.)
  http.patch('/api/clubs/memberships/:id', async ({ params, request }) => {
    await mockDelay('write')
    const membershipIndex = memberships.findIndex((m) => m.id === params.id)

    if (membershipIndex === -1) {
      return HttpResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateMembershipRequest
    const existingMembership = memberships[membershipIndex]

    const updatedMembership: ClubMembership = {
      ...existingMembership,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // If rejecting, set rejection reason
    if (body.status === 'rejected' && body.rejectionReason) {
      updatedMembership.rejectionReason = body.rejectionReason
    }

    // If activating, update club member count
    if (body.status === 'active' && existingMembership.status !== 'active') {
      const clubIndex = clubs.findIndex((c) => c.id === existingMembership.clubId)
      if (clubIndex !== -1) {
        clubs[clubIndex].currentMembers++
      }
    }

    // If deactivating, update club member count
    if (body.status === 'inactive' && existingMembership.status === 'active') {
      const clubIndex = clubs.findIndex((c) => c.id === existingMembership.clubId)
      if (clubIndex !== -1) {
        clubs[clubIndex].currentMembers = Math.max(0, clubs[clubIndex].currentMembers - 1)
      }
    }

    memberships[membershipIndex] = updatedMembership

    return HttpResponse.json({ data: updatedMembership })
  }),

  // Delete membership
  http.delete('/api/clubs/memberships/:id', async ({ params }) => {
    await mockDelay('write')
    const membershipIndex = memberships.findIndex((m) => m.id === params.id)

    if (membershipIndex === -1) {
      return HttpResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    const membership = memberships[membershipIndex]

    // Update club member count if was active
    if (membership.status === 'active') {
      const clubIndex = clubs.findIndex((c) => c.id === membership.clubId)
      if (clubIndex !== -1) {
        clubs[clubIndex].currentMembers = Math.max(0, clubs[clubIndex].currentMembers - 1)
      }
    }

    memberships.splice(membershipIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== ACTIVITY HANDLERS ====================

  // Get all activities with filters
  http.get('/api/clubs/activities', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const clubId = url.searchParams.get('clubId')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...activities]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.clubName.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search)
      )
    }

    // Club filter
    if (clubId) {
      filtered = filtered.filter((a) => a.clubId === clubId)
    }

    // Type filter
    if (type && type !== 'all') {
      filtered = filtered.filter((a) => a.type === type)
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((a) => a.date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((a) => a.date <= endDate)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedActivities = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedActivities,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single activity
  http.get('/api/clubs/activities/:id', async ({ params }) => {
    await mockDelay('read')
    const activity = activities.find((a) => a.id === params.id)

    if (!activity) {
      return HttpResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: activity })
  }),

  // Create activity
  http.post('/api/clubs/activities', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateActivityRequest

    const club = clubs.find((c) => c.id === body.clubId)
    if (!club) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const newActivity: Activity = {
      id: `act-${generateId()}`,
      clubId: body.clubId,
      clubName: club.name,
      title: body.title,
      description: body.description,
      type: body.type,
      status: 'scheduled',
      schedule: body.schedule,
      date: body.date,
      endDate: body.endDate,
      organizerId: club.advisorId,
      organizerName: club.advisorName,
      expectedParticipants: body.expectedParticipants,
      budget: body.budget,
      resources: body.resources,
      creditsAwarded: body.creditsAwarded,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    activities.unshift(newActivity)

    return HttpResponse.json({ data: newActivity }, { status: 201 })
  }),

  // Update activity
  http.put('/api/clubs/activities/:id', async ({ params, request }) => {
    await mockDelay('write')
    const activityIndex = activities.findIndex((a) => a.id === params.id)

    if (activityIndex === -1) {
      return HttpResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateActivityRequest
    const existingActivity = activities[activityIndex]

    const updatedActivity: Activity = {
      ...existingActivity,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    activities[activityIndex] = updatedActivity

    return HttpResponse.json({ data: updatedActivity })
  }),

  // Delete activity
  http.delete('/api/clubs/activities/:id', async ({ params }) => {
    await mockDelay('write')
    const activityIndex = activities.findIndex((a) => a.id === params.id)

    if (activityIndex === -1) {
      return HttpResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    activities.splice(activityIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== ACHIEVEMENT HANDLERS ====================

  // Get all achievements with filters
  http.get('/api/clubs/achievements', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const clubId = url.searchParams.get('clubId')
    const studentId = url.searchParams.get('studentId')
    const type = url.searchParams.get('type')
    const level = url.searchParams.get('level')
    const isVerified = url.searchParams.get('isVerified')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...achievements]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.studentName.toLowerCase().includes(search) ||
          a.clubName.toLowerCase().includes(search)
      )
    }

    // Club filter
    if (clubId) {
      filtered = filtered.filter((a) => a.clubId === clubId)
    }

    // Student filter
    if (studentId) {
      filtered = filtered.filter((a) => a.studentId === studentId)
    }

    // Type filter
    if (type && type !== 'all') {
      filtered = filtered.filter((a) => a.type === type)
    }

    // Level filter
    if (level && level !== 'all') {
      filtered = filtered.filter((a) => a.level === level)
    }

    // Verified filter
    if (isVerified !== null && isVerified !== undefined) {
      filtered = filtered.filter((a) => a.isVerified === (isVerified === 'true'))
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((a) => a.date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((a) => a.date <= endDate)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedAchievements = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedAchievements,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single achievement
  http.get('/api/clubs/achievements/:id', async ({ params }) => {
    await mockDelay('read')
    const achievement = achievements.find((a) => a.id === params.id)

    if (!achievement) {
      return HttpResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: achievement })
  }),

  // Create achievement
  http.post('/api/clubs/achievements', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateAchievementRequest

    const club = clubs.find((c) => c.id === body.clubId)
    if (!club) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const student = getAvailableStudents().find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const newAchievement: Achievement = {
      id: `ach-${generateId()}`,
      clubId: body.clubId,
      clubName: club.name,
      studentId: body.studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      title: body.title,
      description: body.description,
      type: body.type,
      level: body.level,
      date: body.date,
      position: body.position,
      competitionName: body.competitionName,
      venue: body.venue,
      certificateUrl: body.certificateUrl,
      mediaUrls: body.mediaUrls,
      isVerified: false,
      creditsAwarded: body.creditsAwarded,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    achievements.unshift(newAchievement)

    return HttpResponse.json({ data: newAchievement }, { status: 201 })
  }),

  // Update achievement
  http.put('/api/clubs/achievements/:id', async ({ params, request }) => {
    await mockDelay('write')
    const achievementIndex = achievements.findIndex((a) => a.id === params.id)

    if (achievementIndex === -1) {
      return HttpResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateAchievementRequest
    const existingAchievement = achievements[achievementIndex]

    const updatedAchievement: Achievement = {
      ...existingAchievement,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // If verifying, set verified timestamp
    if (body.isVerified && !existingAchievement.isVerified) {
      updatedAchievement.verifiedAt = new Date().toISOString()
    }

    achievements[achievementIndex] = updatedAchievement

    return HttpResponse.json({ data: updatedAchievement })
  }),

  // Delete achievement
  http.delete('/api/clubs/achievements/:id', async ({ params }) => {
    await mockDelay('write')
    const achievementIndex = achievements.findIndex((a) => a.id === params.id)

    if (achievementIndex === -1) {
      return HttpResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    achievements.splice(achievementIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== CREDIT HANDLERS ====================

  // Get all credits with filters
  http.get('/api/clubs/credits', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const clubId = url.searchParams.get('clubId')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const academicYear = url.searchParams.get('academicYear')
    const semester = url.searchParams.get('semester')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...credits]

    // Student filter
    if (studentId) {
      filtered = filtered.filter((c) => c.studentId === studentId)
    }

    // Club filter
    if (clubId) {
      filtered = filtered.filter((c) => c.clubId === clubId)
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category === category)
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status)
    }

    // Academic year filter
    if (academicYear) {
      filtered = filtered.filter((c) => c.academicYear === academicYear)
    }

    // Semester filter
    if (semester) {
      filtered = filtered.filter((c) => c.semester === semester)
    }

    // Sort by awarded date descending
    filtered.sort((a, b) => new Date(b.awardedDate).getTime() - new Date(a.awardedDate).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedCredits = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedCredits,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get credit summary for a student
  http.get('/api/clubs/credits/summary/:studentId', async ({ params }) => {
    await mockDelay('read')
    const studentId = params.studentId as string

    const student = getAvailableStudents().find((s) => s.id === studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const studentCredits = credits.filter((c) => c.studentId === studentId)

    const approvedCredits = studentCredits
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.credits, 0)

    const pendingCredits = studentCredits
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.credits, 0)

    const totalCredits = approvedCredits + pendingCredits

    // Category breakdown
    const categoryMap = new Map<string, number>()
    studentCredits
      .filter((c) => c.status === 'approved')
      .forEach((c) => {
        categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + c.credits)
      })
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, creds]) => ({
      category: category as any,
      credits: creds,
    }))

    // Club breakdown
    const clubMap = new Map<string, { clubName: string; credits: number }>()
    studentCredits
      .filter((c) => c.status === 'approved' && c.clubId)
      .forEach((c) => {
        const existing = clubMap.get(c.clubId!) || { clubName: c.clubName!, credits: 0 }
        clubMap.set(c.clubId!, { ...existing, credits: existing.credits + c.credits })
      })
    const clubBreakdown = Array.from(clubMap.entries()).map(([clubId, data]) => ({
      clubId,
      clubName: data.clubName,
      credits: data.credits,
    }))

    const summary: CreditSummary = {
      studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      totalCredits,
      approvedCredits,
      pendingCredits,
      categoryBreakdown,
      clubBreakdown,
    }

    return HttpResponse.json({ data: summary })
  }),

  // Create credit
  http.post('/api/clubs/credits', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateCreditRequest

    const student = getAvailableStudents().find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    let club = null
    if (body.clubId) {
      club = clubs.find((c) => c.id === body.clubId)
      if (!club) {
        return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
      }
    }

    const newCredit: ExtracurricularCredit = {
      id: `cred-${generateId()}`,
      studentId: body.studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      clubId: body.clubId,
      clubName: club?.name,
      activityId: body.activityId,
      achievementId: body.achievementId,
      category: body.category,
      credits: body.credits,
      description: body.description,
      academicYear: body.academicYear,
      semester: body.semester,
      awardedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    credits.unshift(newCredit)

    return HttpResponse.json({ data: newCredit }, { status: 201 })
  }),

  // Update credit (approve, reject, etc.)
  http.patch('/api/clubs/credits/:id', async ({ params, request }) => {
    await mockDelay('write')
    const creditIndex = credits.findIndex((c) => c.id === params.id)

    if (creditIndex === -1) {
      return HttpResponse.json({ error: 'Credit not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateCreditRequest
    const existingCredit = credits[creditIndex]

    const updatedCredit: ExtracurricularCredit = {
      ...existingCredit,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // If approving, set approved timestamp
    if (body.status === 'approved' && existingCredit.status !== 'approved') {
      updatedCredit.approvedAt = new Date().toISOString()
      updatedCredit.approvedBy = 'Admin' // In real app, get from auth context
    }

    credits[creditIndex] = updatedCredit

    return HttpResponse.json({ data: updatedCredit })
  }),

  // Delete credit
  http.delete('/api/clubs/credits/:id', async ({ params }) => {
    await mockDelay('write')
    const creditIndex = credits.findIndex((c) => c.id === params.id)

    if (creditIndex === -1) {
      return HttpResponse.json({ error: 'Credit not found' }, { status: 404 })
    }

    credits.splice(creditIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== COMPETITION HANDLERS ====================

  // Get all competitions with filters
  http.get('/api/clubs/competitions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const clubId = url.searchParams.get('clubId')
    const category = url.searchParams.get('category')
    const level = url.searchParams.get('level')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...competitions]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.clubName.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      )
    }

    // Club filter
    if (clubId) {
      filtered = filtered.filter((c) => c.clubId === clubId)
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category === category)
    }

    // Level filter
    if (level && level !== 'all') {
      filtered = filtered.filter((c) => c.level === level)
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((c) => c.competitionDate >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((c) => c.competitionDate <= endDate)
    }

    // Sort by competition date descending
    filtered.sort((a, b) => new Date(b.competitionDate).getTime() - new Date(a.competitionDate).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedCompetitions = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedCompetitions,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single competition
  http.get('/api/clubs/competitions/:id', async ({ params }) => {
    await mockDelay('read')
    const competition = competitions.find((c) => c.id === params.id)

    if (!competition) {
      return HttpResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: competition })
  }),

  // Create competition
  http.post('/api/clubs/competitions', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateCompetitionRequest

    const club = clubs.find((c) => c.id === body.clubId)
    if (!club) {
      return HttpResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const newCompetition: Competition = {
      id: `comp-${generateId()}`,
      clubId: body.clubId,
      clubName: club.name,
      title: body.title,
      description: body.description,
      category: body.category,
      level: body.level,
      status: 'upcoming',
      participationType: body.participationType,
      registrationStartDate: body.registrationStartDate,
      registrationEndDate: body.registrationEndDate,
      competitionDate: body.competitionDate,
      endDate: body.endDate,
      venue: body.venue,
      externalVenue: body.externalVenue,
      organizerName: body.organizerName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      maxParticipants: body.maxParticipants,
      currentParticipants: 0,
      entryFee: body.entryFee,
      prizes: body.prizes,
      rules: body.rules,
      requirements: body.requirements,
      winnerAnnounced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    competitions.unshift(newCompetition)

    return HttpResponse.json({ data: newCompetition }, { status: 201 })
  }),

  // Update competition
  http.put('/api/clubs/competitions/:id', async ({ params, request }) => {
    await mockDelay('write')
    const competitionIndex = competitions.findIndex((c) => c.id === params.id)

    if (competitionIndex === -1) {
      return HttpResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateCompetitionRequest
    const existingCompetition = competitions[competitionIndex]

    const updatedCompetition: Competition = {
      ...existingCompetition,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    competitions[competitionIndex] = updatedCompetition

    return HttpResponse.json({ data: updatedCompetition })
  }),

  // Delete competition
  http.delete('/api/clubs/competitions/:id', async ({ params }) => {
    await mockDelay('write')
    const competitionIndex = competitions.findIndex((c) => c.id === params.id)

    if (competitionIndex === -1) {
      return HttpResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Check for registrations
    const hasRegistrations = registrations.some((r) => r.competitionId === params.id)
    if (hasRegistrations) {
      return HttpResponse.json(
        { error: 'Cannot delete competition with existing registrations' },
        { status: 400 }
      )
    }

    competitions.splice(competitionIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== COMPETITION REGISTRATION HANDLERS ====================

  // Get registrations for a competition
  http.get('/api/clubs/competitions/:competitionId/registrations', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = registrations.filter((r) => r.competitionId === params.competitionId)

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status)
    }

    // Sort by registration date descending
    filtered.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedRegistrations = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedRegistrations,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Register for a competition
  http.post('/api/clubs/competitions/:competitionId/register', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as {
      studentId: string
      teamName?: string
      teamMembers?: { studentId: string; studentName: string }[]
    }

    const competition = competitions.find((c) => c.id === params.competitionId)
    if (!competition) {
      return HttpResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Check registration status
    if (competition.status !== 'registration_open' && competition.status !== 'upcoming') {
      return HttpResponse.json({ error: 'Registration is not open' }, { status: 400 })
    }

    const student = getAvailableStudents().find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if already registered
    const alreadyRegistered = registrations.some(
      (r) =>
        r.competitionId === params.competitionId &&
        r.studentId === body.studentId &&
        r.status !== 'withdrawn'
    )
    if (alreadyRegistered) {
      return HttpResponse.json({ error: 'Student already registered' }, { status: 400 })
    }

    // Check max participants
    if (competition.maxParticipants) {
      if (competition.currentParticipants >= competition.maxParticipants) {
        return HttpResponse.json({ error: 'Competition is full' }, { status: 400 })
      }
    }

    const newRegistration: CompetitionRegistration = {
      id: `reg-${generateId()}`,
      competitionId: params.competitionId as string,
      competitionTitle: competition.title,
      studentId: body.studentId,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      teamName: body.teamName,
      teamMembers: body.teamMembers,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'registered',
      paymentStatus: competition.entryFee ? 'pending' : undefined,
      createdAt: new Date().toISOString(),
    }

    registrations.unshift(newRegistration)

    // Update participant count
    const compIndex = competitions.findIndex((c) => c.id === params.competitionId)
    if (compIndex !== -1) {
      competitions[compIndex].currentParticipants++
    }

    return HttpResponse.json({ data: newRegistration }, { status: 201 })
  }),

  // Update registration status (confirm, withdraw, etc.)
  http.patch('/api/clubs/registrations/:id', async ({ params, request }) => {
    await mockDelay('write')
    const regIndex = registrations.findIndex((r) => r.id === params.id)

    if (regIndex === -1) {
      return HttpResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      status?: 'registered' | 'confirmed' | 'withdrawn' | 'disqualified'
      paymentStatus?: 'pending' | 'paid' | 'waived'
    }
    const existingReg = registrations[regIndex]

    // Handle withdrawal
    if (body.status === 'withdrawn' && existingReg.status !== 'withdrawn') {
      const compIndex = competitions.findIndex((c) => c.id === existingReg.competitionId)
      if (compIndex !== -1) {
        competitions[compIndex].currentParticipants = Math.max(
          0,
          competitions[compIndex].currentParticipants - 1
        )
      }
    }

    registrations[regIndex] = {
      ...existingReg,
      ...body,
    }

    return HttpResponse.json({ data: registrations[regIndex] })
  }),

  // ==================== STATS & UTILITY HANDLERS ====================

  // Get club statistics
  http.get('/api/clubs/stats', async () => {
    await mockDelay('read')
    const stats = getClubStats()
    return HttpResponse.json({ data: stats })
  }),

  // Get available students for dropdowns
  http.get('/api/clubs/students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    let students = getAvailableStudents()

    if (search) {
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.id.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: students.slice(0, 50) })
  }),

  // Get available advisors for dropdowns
  http.get('/api/clubs/advisors', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    let advisors = getAvailableAdvisors()

    if (search) {
      advisors = advisors.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.id.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: advisors })
  }),
]
