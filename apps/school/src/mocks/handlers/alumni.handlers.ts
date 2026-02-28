import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import { alumni, achievements, contributions, events, eventRegistrations } from '../data/alumni.data'
import { students } from '../data/students.data'
import type {
  Alumni,
  AlumniAchievement,
  AlumniContribution,
  AlumniEvent,
  EventRegistration,
  AlumniStats,
  BatchStats,
} from '@/features/alumni/types/alumni.types'

// Mutable copies
let alumniData = [...alumni]
let achievementsData = [...achievements]
let contributionsData = [...contributions]
let eventsData = [...events]
let registrationsData = [...eventRegistrations]

export const alumniHandlers = [
  // ==================== GRADUATION ENDPOINTS ====================

  // Graduate a single student to alumni
  http.post('/api/alumni/graduate', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as {
      studentId: string
      batchYear: string
      occupation?: string
      company?: string
      currentCity?: string
      currentCountry?: string
    }

    const student = students.find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.status === 'graduated') {
      return HttpResponse.json({ error: 'Student already graduated' }, { status: 400 })
    }

    // Check if alumni record already exists
    const existingAlumni = alumniData.find((a) => a.studentId === body.studentId)
    if (existingAlumni) {
      return HttpResponse.json({ error: 'Alumni record already exists' }, { status: 400 })
    }

    // Update student status to graduated
    student.status = 'graduated'

    // Create alumni record
    const newAlumni: Alumni = {
      id: faker.string.uuid(),
      studentId: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      batch: body.batchYear,
      class: '12',
      section: student.section,
      rollNumber: String(student.rollNumber),
      photo: student.photoUrl,
      currentCity: body.currentCity,
      currentCountry: body.currentCountry || 'India',
      occupation: body.occupation,
      company: body.company,
      isVerified: true, // Auto-verified since graduated through system
      registeredAt: new Date().toISOString(),
    }

    alumniData.push(newAlumni)

    return HttpResponse.json({
      data: {
        alumni: newAlumni,
        student: { id: student.id, name: student.name, status: student.status },
      },
    }, { status: 201 })
  }),

  // Batch graduation - graduate multiple students
  http.post('/api/alumni/graduate-batch', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      studentIds: string[]
      batchYear: string
    }

    const results: {
      studentId: string
      studentName: string
      success: boolean
      alumniId?: string
      error?: string
    }[] = []

    for (const studentId of body.studentIds) {
      const student = students.find((s) => s.id === studentId)

      if (!student) {
        results.push({ studentId, studentName: 'Unknown', success: false, error: 'Student not found' })
        continue
      }

      if (student.status === 'graduated') {
        results.push({ studentId, studentName: student.name, success: false, error: 'Already graduated' })
        continue
      }

      const existingAlumni = alumniData.find((a) => a.studentId === studentId)
      if (existingAlumni) {
        results.push({ studentId, studentName: student.name, success: false, error: 'Alumni record exists' })
        continue
      }

      // Graduate the student
      student.status = 'graduated'

      const newAlumni: Alumni = {
        id: faker.string.uuid(),
        studentId: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        batch: body.batchYear,
        class: '12',
        section: student.section,
        rollNumber: String(student.rollNumber),
        photo: student.photoUrl,
        currentCountry: 'India',
        isVerified: true,
        registeredAt: new Date().toISOString(),
      }

      alumniData.push(newAlumni)

      results.push({
        studentId,
        studentName: student.name,
        success: true,
        alumniId: newAlumni.id,
      })
    }

    return HttpResponse.json({
      data: {
        total: body.studentIds.length,
        graduated: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      },
    })
  }),

  // Get students eligible for graduation (Class 12, active)
  http.get('/api/alumni/eligible-for-graduation', async () => {
    await mockDelay('read')

    const eligibleStudents = students
      .filter((s) => s.status === 'active' && s.class === 'Class 12')
      .map((s) => ({
        id: s.id,
        name: s.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        photoUrl: s.photoUrl,
      }))

    return HttpResponse.json({ data: eligibleStudents })
  }),

  // Get alumni stats
  http.get('/api/alumni/stats', async () => {
    await mockDelay('read')

    const batches = [...new Set(alumniData.map((a) => a.batch))]
    const stats: AlumniStats = {
      totalAlumni: alumniData.length,
      verifiedAlumni: alumniData.filter((a) => a.isVerified).length,
      totalContributions: contributionsData.length,
      contributionAmount: contributionsData
        .filter((c) => c.amount && c.status !== 'pledged')
        .reduce((sum, c) => sum + (c.amount || 0), 0),
      totalAchievements: achievementsData.filter((a) => a.isPublished).length,
      upcomingEvents: eventsData.filter((e) => e.status === 'upcoming').length,
      batchCount: batches.length,
    }

    return HttpResponse.json({ data: stats })
  }),

  // Get batch stats
  http.get('/api/alumni/batches/stats', async () => {
    await mockDelay('read')

    const batches = [...new Set(alumniData.map((a) => a.batch))].sort().reverse()
    const stats: BatchStats[] = batches.map((batch) => {
      const batchAlumni = alumniData.filter((a) => a.batch === batch)
      return {
        batch,
        totalAlumni: batchAlumni.length,
        verifiedAlumni: batchAlumni.filter((a) => a.isVerified).length,
        contributions: contributionsData.filter((c) =>
          batchAlumni.some((a) => a.id === c.alumniId)
        ).length,
        achievements: achievementsData.filter((ac) =>
          batchAlumni.some((a) => a.id === ac.alumniId)
        ).length,
      }
    })

    return HttpResponse.json({ data: stats })
  }),

  // --- Achievements (MUST come before /api/alumni/:id) ---

  // List achievements
  http.get('/api/alumni/achievements', async ({ request }) => {
    await mockDelay('read')

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const isPublished = url.searchParams.get('isPublished')
    const alumniId = url.searchParams.get('alumniId')

    let filtered = [...achievementsData]

    if (category) {
      filtered = filtered.filter((a) => a.category === category)
    }
    if (isPublished !== null && isPublished !== '') {
      filtered = filtered.filter((a) => a.isPublished === (isPublished === 'true'))
    }
    if (alumniId) {
      filtered = filtered.filter((a) => a.alumniId === alumniId)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create achievement
  http.post('/api/alumni/achievements', async ({ request }) => {
    await mockDelay('read')

    const body = await request.json() as Partial<AlumniAchievement>
    const alumnus = alumniData.find((a) => a.id === body.alumniId)

    const newAchievement: AlumniAchievement = {
      id: faker.string.uuid(),
      alumniId: body.alumniId || '',
      alumniName: alumnus?.name || '',
      title: body.title || '',
      description: body.description || '',
      category: body.category || 'other',
      date: body.date || new Date().toISOString().split('T')[0],
      isPublished: body.isPublished ?? false,
      addedBy: 'admin',
    }

    achievementsData.push(newAchievement)
    return HttpResponse.json({ data: newAchievement }, { status: 201 })
  }),

  // Update achievement
  http.put('/api/alumni/achievements/:id', async ({ params, request }) => {
    await mockDelay('read')

    const index = achievementsData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as Partial<AlumniAchievement>
    achievementsData[index] = { ...achievementsData[index], ...body }

    return HttpResponse.json({ data: achievementsData[index] })
  }),

  // Publish/unpublish achievement
  http.patch('/api/alumni/achievements/:id/publish', async ({ params, request }) => {
    await mockDelay('read')

    const index = achievementsData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as { isPublished: boolean }
    achievementsData[index].isPublished = body.isPublished

    return HttpResponse.json({ data: achievementsData[index] })
  }),

  // Delete achievement
  http.delete('/api/alumni/achievements/:id', async ({ params }) => {
    await mockDelay('read')

    const index = achievementsData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    achievementsData.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Contributions (MUST come before /api/alumni/:id) ---

  // List contributions
  http.get('/api/alumni/contributions', async ({ request }) => {
    await mockDelay('read')

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const alumniId = url.searchParams.get('alumniId')

    let filtered = [...contributionsData]

    if (type) {
      filtered = filtered.filter((c) => c.type === type)
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }
    if (alumniId) {
      filtered = filtered.filter((c) => c.alumniId === alumniId)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create contribution
  http.post('/api/alumni/contributions', async ({ request }) => {
    await mockDelay('read')

    const body = await request.json() as Partial<AlumniContribution>
    const alumnus = alumniData.find((a) => a.id === body.alumniId)

    const newContribution: AlumniContribution = {
      id: faker.string.uuid(),
      alumniId: body.alumniId || '',
      alumniName: alumnus?.name || '',
      type: body.type || 'other',
      description: body.description || '',
      amount: body.amount,
      date: body.date || new Date().toISOString().split('T')[0],
      status: 'pledged',
      acknowledgement: body.acknowledgement,
    }

    contributionsData.push(newContribution)
    return HttpResponse.json({ data: newContribution }, { status: 201 })
  }),

  // Update contribution status
  http.patch('/api/alumni/contributions/:id/status', async ({ params, request }) => {
    await mockDelay('read')

    const index = contributionsData.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as { status: string; acknowledgement?: string }
    contributionsData[index].status = body.status as AlumniContribution['status']
    if (body.acknowledgement) {
      contributionsData[index].acknowledgement = body.acknowledgement
    }

    return HttpResponse.json({ data: contributionsData[index] })
  }),

  // Delete contribution
  http.delete('/api/alumni/contributions/:id', async ({ params }) => {
    await mockDelay('read')

    const index = contributionsData.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    contributionsData.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Events (MUST come before /api/alumni/:id) ---

  // List events
  http.get('/api/alumni/events', async ({ request }) => {
    await mockDelay('read')

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const batch = url.searchParams.get('batch')

    let filtered = [...eventsData]

    if (type) {
      filtered = filtered.filter((e) => e.type === type)
    }
    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }
    if (batch) {
      filtered = filtered.filter((e) => e.targetBatches.includes(batch))
    }

    // Sort by date (upcoming first, then by date)
    filtered.sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return HttpResponse.json({ data: filtered })
  }),

  // Get single event
  http.get('/api/alumni/events/:id', async ({ params }) => {
    await mockDelay('read')

    const event = eventsData.find((e) => e.id === params.id)
    if (!event) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: event })
  }),

  // Create event
  http.post('/api/alumni/events', async ({ request }) => {
    await mockDelay('read')

    const body = await request.json() as Partial<AlumniEvent>

    const newEvent: AlumniEvent = {
      id: faker.string.uuid(),
      title: body.title || '',
      description: body.description || '',
      type: body.type || 'other',
      date: body.date || new Date().toISOString().split('T')[0],
      venue: body.venue,
      isVirtual: body.isVirtual ?? false,
      meetingLink: body.meetingLink,
      targetBatches: body.targetBatches || [],
      registeredCount: 0,
      maxCapacity: body.maxCapacity,
      status: 'upcoming',
    }

    eventsData.push(newEvent)
    return HttpResponse.json({ data: newEvent }, { status: 201 })
  }),

  // Update event
  http.put('/api/alumni/events/:id', async ({ params, request }) => {
    await mockDelay('read')

    const index = eventsData.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as Partial<AlumniEvent>
    eventsData[index] = { ...eventsData[index], ...body }

    return HttpResponse.json({ data: eventsData[index] })
  }),

  // Update event status
  http.patch('/api/alumni/events/:id/status', async ({ params, request }) => {
    await mockDelay('read')

    const index = eventsData.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as { status: string }
    eventsData[index].status = body.status as AlumniEvent['status']

    return HttpResponse.json({ data: eventsData[index] })
  }),

  // Delete event
  http.delete('/api/alumni/events/:id', async ({ params }) => {
    await mockDelay('read')

    const index = eventsData.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    eventsData.splice(index, 1)
    // Also delete registrations
    registrationsData = registrationsData.filter((r) => r.eventId !== params.id)

    return new HttpResponse(null, { status: 204 })
  }),

  // --- Event Registrations ---

  // Get event registrations
  http.get('/api/alumni/events/:eventId/registrations', async ({ params }) => {
    await mockDelay('read')

    const regs = registrationsData.filter((r) => r.eventId === params.eventId)
    return HttpResponse.json({ data: regs })
  }),

  // Register for event
  http.post('/api/alumni/events/:eventId/register', async ({ params, request }) => {
    await mockDelay('read')

    const body = await request.json() as { alumniId: string }
    const event = eventsData.find((e) => e.id === params.eventId)
    const alumnus = alumniData.find((a) => a.id === body.alumniId)

    if (!event || !alumnus) {
      return new HttpResponse(null, { status: 404 })
    }

    // Check if already registered
    const existing = registrationsData.find(
      (r) => r.eventId === params.eventId && r.alumniId === body.alumniId
    )
    if (existing) {
      return HttpResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    const registration: EventRegistration = {
      id: faker.string.uuid(),
      eventId: params.eventId as string,
      alumniId: body.alumniId,
      alumniName: alumnus.name,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    }

    registrationsData.push(registration)

    // Update event count
    const eventIndex = eventsData.findIndex((e) => e.id === params.eventId)
    if (eventIndex !== -1) {
      eventsData[eventIndex].registeredCount++
    }

    return HttpResponse.json({ data: registration }, { status: 201 })
  }),

  // Cancel registration
  http.delete('/api/alumni/events/:eventId/register/:alumniId', async ({ params }) => {
    await mockDelay('read')

    const index = registrationsData.findIndex(
      (r) => r.eventId === params.eventId && r.alumniId === params.alumniId
    )
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    registrationsData.splice(index, 1)

    // Update event count
    const eventIndex = eventsData.findIndex((e) => e.id === params.eventId)
    if (eventIndex !== -1 && eventsData[eventIndex].registeredCount > 0) {
      eventsData[eventIndex].registeredCount--
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // --- Alumni CRUD (dynamic :id routes MUST come AFTER specific paths) ---

  // List alumni with filters
  http.get('/api/alumni', async ({ request }) => {
    await mockDelay('read')

    const url = new URL(request.url)
    const batch = url.searchParams.get('batch')
    const isVerified = url.searchParams.get('isVerified')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...alumniData]

    if (batch) {
      filtered = filtered.filter((a) => a.batch === batch)
    }
    if (isVerified !== null && isVerified !== '') {
      filtered = filtered.filter((a) => a.isVerified === (isVerified === 'true'))
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          a.occupation?.toLowerCase().includes(s) ||
          a.company?.toLowerCase().includes(s)
      )
    }

    // Sort by batch (most recent first), then by name
    filtered.sort((a, b) => {
      if (a.batch !== b.batch) return parseInt(b.batch) - parseInt(a.batch)
      return a.name.localeCompare(b.name)
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single alumni
  http.get('/api/alumni/:id', async ({ params }) => {
    await mockDelay('read')

    const alumnus = alumniData.find((a) => a.id === params.id)
    if (!alumnus) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ data: alumnus })
  }),

  // Create alumni (self-registration)
  http.post('/api/alumni', async ({ request }) => {
    await mockDelay('read')

    const body = await request.json() as Partial<Alumni>
    const newAlumni: Alumni = {
      id: faker.string.uuid(),
      name: body.name || '',
      email: body.email || '',
      phone: body.phone,
      batch: body.batch || '',
      class: body.class || '12',
      section: body.section || 'A',
      rollNumber: body.rollNumber || '',
      photo: body.photo,
      currentCity: body.currentCity,
      currentCountry: body.currentCountry,
      occupation: body.occupation,
      company: body.company,
      linkedIn: body.linkedIn,
      isVerified: false, // New registrations need verification
      registeredAt: new Date().toISOString(),
    }

    alumniData.push(newAlumni)
    return HttpResponse.json({ data: newAlumni }, { status: 201 })
  }),

  // Update alumni
  http.put('/api/alumni/:id', async ({ params, request }) => {
    await mockDelay('read')

    const index = alumniData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const body = await request.json() as Partial<Alumni>
    alumniData[index] = { ...alumniData[index], ...body }

    return HttpResponse.json({ data: alumniData[index] })
  }),

  // Verify alumni
  http.patch('/api/alumni/:id/verify', async ({ params }) => {
    await mockDelay('read')

    const index = alumniData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    alumniData[index].isVerified = true
    return HttpResponse.json({ data: alumniData[index] })
  }),

  // Delete alumni
  http.delete('/api/alumni/:id', async ({ params }) => {
    await mockDelay('read')

    const index = alumniData.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    alumniData.splice(index, 1)
    // Also delete related achievements and contributions
    achievementsData = achievementsData.filter((a) => a.alumniId !== params.id)
    contributionsData = contributionsData.filter((c) => c.alumniId !== params.id)

    return new HttpResponse(null, { status: 204 })
  }),
]
