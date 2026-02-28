import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  students,
  studentDocuments,
  getStudentTimeline,
  getNextClass,
  CLASSES,
  SECTIONS,
  getStudentPortfolio,
  getLearningStyleAssessments,
  getLearningPreferences,
  getStudentRiskProfile,
  getAtRiskStudents,
  getGraduationProgress,
  getPromotionHistory,
  getGraduationDashboard,
  getStudentTeacherRelationships,
  getTeacherFeedback,
  getMentorship,
} from '../data/students.data'
import { roomAllocations } from '../data/hostel.data'
import { getAlumniByStudentId } from '../data/alumni.data'
import type { StudentDocument } from '@/features/students/types/student.types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const studentsHandlers = [
  // ==================== HOSTEL ALLOCATION LOOKUP ====================

  http.get('/api/students/:id/hostel', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Find active hostel allocation for this student
    const allocation = roomAllocations.find(
      (a) => a.studentId === params.id && a.status === 'active'
    )

    return HttpResponse.json({ data: allocation || null })
  }),

  // ==================== ALUMNI RECORD LOOKUP ====================

  http.get('/api/students/:id/alumni', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Find alumni record linked to this student
    const alumniRecord = getAlumniByStudentId(params.id as string)

    return HttpResponse.json({ data: alumniRecord || null })
  }),

  // ==================== TIMELINE ====================

  http.get('/api/students/:id/timeline', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    const timeline = getStudentTimeline(params.id as string)
    return HttpResponse.json({ data: timeline })
  }),

  // ==================== DOCUMENTS ====================

  http.get('/api/students/:id/documents', async ({ params }) => {
    await mockDelay('read')
    const docs = studentDocuments.filter((d) => d.studentId === params.id)
    return HttpResponse.json({ data: docs })
  }),

  http.post('/api/students/:id/documents', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as {
      type: string
      name: string
      fileName: string
      fileSize: number
      mimeType: string
    }

    const newDoc: StudentDocument = {
      id: generateId(),
      studentId: params.id as string,
      type: body.type as StudentDocument['type'],
      name: body.name,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      url: `/uploads/documents/${params.id}/${body.fileName}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      verified: false,
    }

    studentDocuments.push(newDoc)
    return HttpResponse.json({ data: newDoc }, { status: 201 })
  }),

  http.delete('/api/students/:studentId/documents/:docId', async ({ params }) => {
    await mockDelay('read')
    const index = studentDocuments.findIndex((d) => d.id === params.docId && d.studentId === params.studentId)
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    studentDocuments.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/students/:studentId/documents/:docId/verify', async ({ params }) => {
    await mockDelay('read')
    const doc = studentDocuments.find((d) => d.id === params.docId && d.studentId === params.studentId)
    if (!doc) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    doc.verified = true
    doc.verifiedAt = new Date().toISOString()
    doc.verifiedBy = 'Current User'
    return HttpResponse.json({ data: doc })
  }),

  // ==================== PROMOTION ====================

  http.post('/api/students/promote', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      studentIds: string[]
      fromClass: string
      toClass: string
      academicYear: string
      newSection?: string
      autoAssignRollNumbers: boolean
    }

    const details: {
      studentId: string
      studentName: string
      fromClass: string
      toClass: string
      newSection: string
      newRollNumber: number
      success: boolean
      error?: string
    }[] = []

    let rollCounter = 1

    for (const studentId of body.studentIds) {
      const student = students.find((s) => s.id === studentId)
      if (!student) {
        details.push({
          studentId,
          studentName: 'Unknown',
          fromClass: body.fromClass,
          toClass: body.toClass,
          newSection: body.newSection || 'A',
          newRollNumber: 0,
          success: false,
          error: 'Student not found',
        })
        continue
      }

      if (student.class !== body.fromClass) {
        details.push({
          studentId,
          studentName: student.name,
          fromClass: body.fromClass,
          toClass: body.toClass,
          newSection: body.newSection || student.section,
          newRollNumber: 0,
          success: false,
          error: `Student is in ${student.class}, not ${body.fromClass}`,
        })
        continue
      }

      const newSection = body.newSection || student.section
      const newRoll = body.autoAssignRollNumbers ? rollCounter++ : student.rollNumber

      student.class = body.toClass
      student.section = newSection
      student.rollNumber = newRoll

      details.push({
        studentId,
        studentName: student.name,
        fromClass: body.fromClass,
        toClass: body.toClass,
        newSection,
        newRollNumber: newRoll,
        success: true,
      })
    }

    return HttpResponse.json({
      data: {
        promoted: details.filter((d) => d.success).length,
        failed: details.filter((d) => !d.success).length,
        details,
      },
    })
  }),

  // ==================== SIBLING LINKING ====================

  http.get('/api/students/:id/siblings', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const siblingIds = student.siblingIds || []
    const siblings = siblingIds
      .map((sid) => students.find((s) => s.id === sid))
      .filter(Boolean)
      .map((s) => ({
        id: s!.id,
        name: s!.name,
        class: s!.class,
        section: s!.section,
        rollNumber: s!.rollNumber,
        photoUrl: s!.photoUrl,
      }))

    return HttpResponse.json({ data: siblings })
  }),

  http.post('/api/students/:id/siblings', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as { siblingId: string }
    const student = students.find((s) => s.id === params.id)
    const sibling = students.find((s) => s.id === body.siblingId)

    if (!student || !sibling) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (!student.siblingIds) student.siblingIds = []
    if (!sibling.siblingIds) sibling.siblingIds = []

    if (!student.siblingIds.includes(body.siblingId)) {
      student.siblingIds.push(body.siblingId)
    }
    if (!sibling.siblingIds.includes(params.id as string)) {
      sibling.siblingIds.push(params.id as string)
    }

    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/students/:id/siblings/:siblingId', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    const sibling = students.find((s) => s.id === params.siblingId)

    if (student?.siblingIds) {
      student.siblingIds = student.siblingIds.filter((id) => id !== params.siblingId)
    }
    if (sibling?.siblingIds) {
      sibling.siblingIds = sibling.siblingIds.filter((id) => id !== params.id)
    }

    return HttpResponse.json({ success: true })
  }),

  // ==================== HEALTH RECORDS ====================

  http.get('/api/students/:id/health', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: student.healthRecord || null })
  }),

  http.put('/api/students/:id/health', async ({ params, request }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    const body = await request.json() as any
    student.healthRecord = body
    return HttpResponse.json({ data: student.healthRecord })
  }),

  // ==================== ID CARD ====================

  http.get('/api/students/:id/id-card', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return HttpResponse.json({
      data: {
        studentId: student.id,
        name: student.name,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        bloodGroup: student.bloodGroup,
        photoUrl: student.photoUrl,
        parentName: student.parent.fatherName,
        parentPhone: student.parent.guardianPhone,
        address: `${student.address.street}, ${student.address.city}`,
        schoolName: 'Paperbook International School',
        schoolLogo: '/logo.svg',
        academicYear: '2024-25',
        validUntil: '2025-03-31',
      },
    })
  }),

  // ==================== BULK IMPORT ====================

  http.post('/api/students/bulk-import', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as { rows: any[] }
    const results = {
      total: body.rows.length,
      successful: 0,
      failed: 0,
      errors: [] as { row: number; field: string; message: string }[],
    }

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i]

      // Validate required fields
      if (!row.name) {
        results.errors.push({ row: i + 1, field: 'name', message: 'Name is required' })
        results.failed++
        continue
      }
      if (!row.class) {
        results.errors.push({ row: i + 1, field: 'class', message: 'Class is required' })
        results.failed++
        continue
      }
      if (!row.section) {
        results.errors.push({ row: i + 1, field: 'section', message: 'Section is required' })
        results.failed++
        continue
      }

      const now = new Date()
      const count = students.length + 1
      const newStudent = {
        id: generateId(),
        admissionNumber: `ADM${now.getFullYear()}${String(count).padStart(4, '0')}`,
        name: row.name,
        email: row.email || '',
        phone: row.phone || '',
        dateOfBirth: row.dateOfBirth || '',
        gender: (row.gender?.toLowerCase() || 'male') as 'male' | 'female',
        bloodGroup: row.bloodGroup || 'O+',
        class: row.class,
        section: row.section,
        rollNumber: row.rollNumber || students.filter((s) => s.class === row.class && s.section === row.section).length + 1,
        admissionDate: now.toISOString(),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name.replace(/\s/g, '')}`,
        address: { street: row.street || '', city: row.city || '', state: row.state || '', pincode: row.pincode || '' },
        parent: {
          fatherName: row.fatherName || '',
          motherName: row.motherName || '',
          guardianPhone: row.guardianPhone || '',
          guardianEmail: row.guardianEmail || '',
          occupation: row.occupation || '',
        },
        status: 'active' as const,
      }

      students.push(newStudent)
      results.successful++
    }

    return HttpResponse.json({ data: results })
  }),

  // ==================== MESSAGING ====================

  http.post('/api/students/:id/message-parent', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      channel: 'sms' | 'email' | 'whatsapp' | 'all'
      subject?: string
      message: string
    }

    const sentVia = body.channel === 'all'
      ? ['sms', 'email', 'whatsapp']
      : [body.channel]

    return HttpResponse.json({
      data: {
        success: true,
        sentVia,
      },
    })
  }),

  // ==================== BULK EXPORT ====================

  http.get('/api/students/export', async ({ request }) => {
    await mockDelay('heavy')
    const url = new URL(request.url)
    const classFilter = url.searchParams.get('class')
    const sectionFilter = url.searchParams.get('section')

    let filtered = students.filter((s) => s.status === 'active')
    if (classFilter) filtered = filtered.filter((s) => s.class === classFilter)
    if (sectionFilter) filtered = filtered.filter((s) => s.section === sectionFilter)

    const exportData = filtered.map((s) => ({
      admissionNumber: s.admissionNumber,
      name: s.name,
      email: s.email,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      bloodGroup: s.bloodGroup,
      class: s.class,
      section: s.section,
      rollNumber: s.rollNumber,
      fatherName: s.parent.fatherName,
      motherName: s.parent.motherName,
      guardianPhone: s.parent.guardianPhone,
      guardianEmail: s.parent.guardianEmail,
      address: `${s.address.street}, ${s.address.city}, ${s.address.state} - ${s.address.pincode}`,
      status: s.status,
    }))

    return HttpResponse.json({ data: exportData })
  }),

  // ==================== ENROLLMENT (from Admissions) ====================

  http.get('/api/students/next-roll-number', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const classParam = url.searchParams.get('class')
    const section = url.searchParams.get('section')

    if (!classParam || !section) {
      return HttpResponse.json({ error: 'Class and section are required' }, { status: 400 })
    }

    // Find the highest roll number in this class/section
    const classStudents = students.filter(
      (s) => s.class === classParam && s.section === section && s.status === 'active'
    )
    const maxRoll = classStudents.reduce((max, s) => Math.max(max, s.rollNumber), 0)

    return HttpResponse.json({ data: { nextRollNumber: maxRoll + 1 } })
  }),

  http.post('/api/students/enroll', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      applicationId: string
      name: string
      email: string
      phone: string
      dateOfBirth: string
      gender: 'male' | 'female'
      bloodGroup: string
      class: string
      section: string
      rollNumber: number
      fatherName: string
      motherName: string
      guardianPhone: string
      guardianEmail: string
      street: string
      city: string
      state: string
      pincode: string
    }

    const now = new Date()
    const count = students.length + 1

    const newStudent = {
      id: generateId(),
      admissionNumber: `ADM${now.getFullYear()}${String(count).padStart(4, '0')}`,
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender,
      bloodGroup: body.bloodGroup || 'O+',
      class: body.class,
      section: body.section,
      rollNumber: body.rollNumber,
      admissionDate: now.toISOString(),
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name.replace(/\s/g, '')}`,
      address: {
        street: body.street || '',
        city: body.city || '',
        state: body.state || '',
        pincode: body.pincode || '',
      },
      parent: {
        fatherName: body.fatherName || '',
        motherName: body.motherName || '',
        guardianPhone: body.guardianPhone || '',
        guardianEmail: body.guardianEmail || '',
        occupation: '',
      },
      status: 'active' as const,
    }

    students.push(newStudent)

    return HttpResponse.json({
      data: {
        student: newStudent,
        admissionNumber: newStudent.admissionNumber,
      },
    }, { status: 201 })
  }),

  // ==================== PORTFOLIO & SKILLS ====================

  http.get('/api/students/:id/portfolio', async ({ params }) => {
    await mockDelay('read')
    const student = students.find((s) => s.id === params.id)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: getStudentPortfolio(params.id as string) })
  }),

  http.put('/api/students/:id/portfolio', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const portfolio = getStudentPortfolio(params.id as string)
    Object.assign(portfolio, body, { lastUpdated: new Date().toISOString() })
    return HttpResponse.json({ data: portfolio })
  }),

  http.post('/api/students/:id/skills', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const portfolio = getStudentPortfolio(params.id as string)
    const newSkill = { id: generateId(), studentId: params.id as string, ...body }
    portfolio.skills.push(newSkill)
    return HttpResponse.json({ data: newSkill }, { status: 201 })
  }),

  http.put('/api/students/:id/skills/:skillId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const portfolio = getStudentPortfolio(params.id as string)
    const skill = portfolio.skills.find((s) => s.id === params.skillId)
    if (!skill) {
      return HttpResponse.json({ error: 'Skill not found' }, { status: 404 })
    }
    Object.assign(skill, body)
    return HttpResponse.json({ data: skill })
  }),

  http.delete('/api/students/:id/skills/:skillId', async ({ params }) => {
    await mockDelay('write')
    const portfolio = getStudentPortfolio(params.id as string)
    const index = portfolio.skills.findIndex((s) => s.id === params.skillId)
    if (index !== -1) {
      portfolio.skills.splice(index, 1)
    }
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/students/:id/portfolio/items', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const portfolio = getStudentPortfolio(params.id as string)
    const newItem = { id: generateId(), studentId: params.id as string, ...body }
    portfolio.items.push(newItem)
    return HttpResponse.json({ data: newItem }, { status: 201 })
  }),

  http.put('/api/students/:id/portfolio/items/:itemId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const portfolio = getStudentPortfolio(params.id as string)
    const item = portfolio.items.find((i) => i.id === params.itemId)
    if (!item) {
      return HttpResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }
    Object.assign(item, body)
    return HttpResponse.json({ data: item })
  }),

  http.delete('/api/students/:id/portfolio/items/:itemId', async ({ params }) => {
    await mockDelay('write')
    const portfolio = getStudentPortfolio(params.id as string)
    const index = portfolio.items.findIndex((i) => i.id === params.itemId)
    if (index !== -1) {
      portfolio.items.splice(index, 1)
    }
    return HttpResponse.json({ success: true })
  }),

  // ==================== LEARNING STYLE ASSESSMENTS ====================

  http.get('/api/students/:id/learning-style', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getLearningStyleAssessments(params.id as string) })
  }),

  http.post('/api/students/:id/learning-style', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const assessments = getLearningStyleAssessments(params.id as string)
    const newAssessment = { id: generateId(), studentId: params.id as string, ...body }
    assessments.push(newAssessment)
    return HttpResponse.json({ data: newAssessment }, { status: 201 })
  }),

  http.get('/api/students/:id/learning-preferences', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getLearningPreferences(params.id as string) })
  }),

  http.put('/api/students/:id/learning-preferences', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const prefs = getLearningPreferences(params.id as string)
    Object.assign(prefs, body)
    return HttpResponse.json({ data: prefs })
  }),

  // ==================== RISK INDICATORS ====================

  http.get('/api/students/:id/risk-profile', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getStudentRiskProfile(params.id as string) })
  }),

  http.post('/api/students/:id/risk-indicators', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const profile = getStudentRiskProfile(params.id as string)
    const newIndicator = {
      id: generateId(),
      studentId: params.id as string,
      interventions: [],
      ...body,
    }
    profile.indicators.push(newIndicator)
    return HttpResponse.json({ data: newIndicator }, { status: 201 })
  }),

  http.put('/api/students/:id/risk-indicators/:indicatorId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const profile = getStudentRiskProfile(params.id as string)
    const indicator = profile.indicators.find((i) => i.id === params.indicatorId)
    if (!indicator) {
      return HttpResponse.json({ error: 'Indicator not found' }, { status: 404 })
    }
    Object.assign(indicator, body)
    return HttpResponse.json({ data: indicator })
  }),

  http.post('/api/students/:id/risk-indicators/:indicatorId/interventions', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const profile = getStudentRiskProfile(params.id as string)
    const indicator = profile.indicators.find((i) => i.id === params.indicatorId)
    if (!indicator) {
      return HttpResponse.json({ error: 'Indicator not found' }, { status: 404 })
    }
    const newIntervention = { id: generateId(), riskId: params.indicatorId as string, ...body }
    indicator.interventions.push(newIntervention)
    return HttpResponse.json({ data: newIntervention }, { status: 201 })
  }),

  http.put('/api/students/:id/risk-indicators/:indicatorId/interventions/:interventionId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const profile = getStudentRiskProfile(params.id as string)
    const indicator = profile.indicators.find((i) => i.id === params.indicatorId)
    if (!indicator) {
      return HttpResponse.json({ error: 'Indicator not found' }, { status: 404 })
    }
    const intervention = indicator.interventions.find((i) => i.id === params.interventionId)
    if (!intervention) {
      return HttpResponse.json({ error: 'Intervention not found' }, { status: 404 })
    }
    Object.assign(intervention, body)
    return HttpResponse.json({ data: intervention })
  }),

  http.get('/api/students/at-risk', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const level = url.searchParams.get('level') || undefined
    const category = url.searchParams.get('category') || undefined
    return HttpResponse.json({ data: getAtRiskStudents({ level, category }) })
  }),

  // ==================== GRADUATION & PROMOTION ====================

  http.get('/api/students/:id/graduation-progress', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getGraduationProgress(params.id as string) })
  }),

  http.put('/api/students/:id/graduation-progress', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const progress = getGraduationProgress(params.id as string)
    Object.assign(progress, body)
    return HttpResponse.json({ data: progress })
  }),

  http.get('/api/students/:id/promotion-history', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getPromotionHistory(params.id as string) })
  }),

  http.get('/api/students/graduation-dashboard', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const classFilter = url.searchParams.get('class') || undefined
    const year = url.searchParams.get('year') || undefined
    return HttpResponse.json({ data: getGraduationDashboard({ class: classFilter, year }) })
  }),

  // ==================== STUDENT-TEACHER RELATIONSHIPS ====================

  http.get('/api/students/:id/teachers', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getStudentTeacherRelationships(params.id as string) })
  }),

  http.post('/api/students/:id/teachers', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const relationships = getStudentTeacherRelationships(params.id as string)
    const newRelationship = { id: generateId(), studentId: params.id as string, ...body }
    relationships.push(newRelationship)
    return HttpResponse.json({ data: newRelationship }, { status: 201 })
  }),

  http.put('/api/students/:id/teachers/:relationshipId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const relationships = getStudentTeacherRelationships(params.id as string)
    const rel = relationships.find((r) => r.id === params.relationshipId)
    if (!rel) {
      return HttpResponse.json({ error: 'Relationship not found' }, { status: 404 })
    }
    Object.assign(rel, body)
    return HttpResponse.json({ data: rel })
  }),

  http.get('/api/students/:id/teacher-feedback', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const term = url.searchParams.get('term') || undefined
    const academicYear = url.searchParams.get('academicYear') || undefined
    return HttpResponse.json({ data: getTeacherFeedback(params.id as string, { term, academicYear }) })
  }),

  http.post('/api/students/:id/teacher-feedback', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const feedbackList = getTeacherFeedback(params.id as string)
    const newFeedback = { id: generateId(), studentId: params.id as string, ...body }
    feedbackList.push(newFeedback)
    return HttpResponse.json({ data: newFeedback }, { status: 201 })
  }),

  http.get('/api/students/:id/mentorship', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: getMentorship(params.id as string) })
  }),

  http.put('/api/students/:id/mentorship', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    let mentorship = getMentorship(params.id as string)
    if (!mentorship) {
      mentorship = { studentId: params.id as string, mentorId: '', mentorName: '', startDate: new Date().toISOString(), goals: [], meetingFrequency: 'monthly', sessions: [], status: 'active', ...body }
    } else {
      Object.assign(mentorship, body)
    }
    return HttpResponse.json({ data: mentorship })
  }),

  http.post('/api/students/:id/mentorship/sessions', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const mentorship = getMentorship(params.id as string)
    if (!mentorship) {
      return HttpResponse.json({ error: 'Mentorship not found' }, { status: 404 })
    }
    mentorship.sessions.push(body)
    return HttpResponse.json({ data: mentorship })
  }),
]
