import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  periodDefinitions,
  subjects,
  rooms,
  timetables,
  substitutions,
  getTimetableStats,
} from '../data/timetable.data'
import type {
  Timetable,
  TimetableEntry,
  Substitution,
  PeriodDefinition,
} from '@/features/timetable/types/timetable.types'

export const timetableHandlers = [
  // ==================== STATS ====================
  http.get('/api/timetable/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getTimetableStats() })
  }),

  // ==================== PERIOD DEFINITIONS ====================
  http.get('/api/timetable/periods', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: periodDefinitions })
  }),

  http.put('/api/timetable/periods/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = periodDefinitions.findIndex(p => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Period not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<PeriodDefinition>
    periodDefinitions[index] = { ...periodDefinitions[index], ...body }
    return HttpResponse.json({ data: periodDefinitions[index] })
  }),

  // ==================== SUBJECTS ====================
  http.get('/api/timetable/subjects', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: subjects })
  }),

  // ==================== ROOMS ====================
  http.get('/api/timetable/rooms', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: rooms })
  }),

  // ==================== TIMETABLES ====================
  http.get('/api/timetable/timetables', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const classId = url.searchParams.get('classId')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...timetables]

    if (search) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.className.toLowerCase().includes(search)
      )
    }
    if (classId) {
      filtered = filtered.filter(t => t.classId === classId)
    }
    if (status) {
      filtered = filtered.filter(t => t.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  http.get('/api/timetable/timetables/:id', async ({ params }) => {
    await mockDelay('read')
    const timetable = timetables.find(t => t.id === params.id)
    if (!timetable) {
      return HttpResponse.json({ error: 'Timetable not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: timetable })
  }),

  http.post('/api/timetable/timetables', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const now = new Date().toISOString()

    const newTimetable: Timetable = {
      id: `TT-${Date.now()}`,
      name: body.name as string,
      academicYear: body.academicYear as string,
      term: body.term as string,
      classId: body.classId as string,
      className: body.className as string || '',
      sectionId: body.sectionId as string,
      sectionName: body.sectionName as string || '',
      status: 'draft',
      effectiveFrom: body.effectiveFrom as string,
      effectiveTo: body.effectiveTo as string,
      entries: [],
      createdBy: 'Current User',
      createdAt: now,
      updatedAt: now,
    }

    timetables.push(newTimetable)
    return HttpResponse.json({ data: newTimetable }, { status: 201 })
  }),

  http.put('/api/timetable/timetables/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = timetables.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Timetable not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Timetable>
    timetables[index] = { ...timetables[index], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json({ data: timetables[index] })
  }),

  http.patch('/api/timetable/timetables/:id/publish', async ({ params }) => {
    await mockDelay('read')
    const index = timetables.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Timetable not found' }, { status: 404 })
    }
    timetables[index].status = 'published'
    timetables[index].updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: timetables[index] })
  }),

  http.delete('/api/timetable/timetables/:id', async ({ params }) => {
    await mockDelay('read')
    const index = timetables.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Timetable not found' }, { status: 404 })
    }
    timetables.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== TIMETABLE ENTRIES ====================
  http.post('/api/timetable/timetables/:id/entries', async ({ params, request }) => {
    await mockDelay('read')
    const timetable = timetables.find(t => t.id === params.id)
    if (!timetable) {
      return HttpResponse.json({ error: 'Timetable not found' }, { status: 404 })
    }

    const body = await request.json() as Record<string, unknown>
    const subject = subjects.find(s => s.id === body.subjectId)
    const room = rooms.find(r => r.id === body.roomId)

    const newEntry: TimetableEntry = {
      id: `${timetable.id}-E${Date.now()}`,
      timetableId: timetable.id,
      day: body.day as TimetableEntry['day'],
      periodId: body.periodId as string,
      subjectId: body.subjectId as string,
      subjectName: subject?.name || '',
      teacherId: body.teacherId as string,
      teacherName: body.teacherName as string || '',
      roomId: body.roomId as string,
      roomName: room?.name || '',
      classId: timetable.classId,
      className: timetable.className,
      sectionId: timetable.sectionId,
      sectionName: timetable.sectionName,
    }

    timetable.entries.push(newEntry)
    return HttpResponse.json({ data: newEntry }, { status: 201 })
  }),

  http.delete('/api/timetable/entries/:id', async ({ params }) => {
    await mockDelay('read')
    for (const timetable of timetables) {
      const index = timetable.entries.findIndex(e => e.id === params.id)
      if (index !== -1) {
        timetable.entries.splice(index, 1)
        return HttpResponse.json({ success: true })
      }
    }
    return HttpResponse.json({ error: 'Entry not found' }, { status: 404 })
  }),

  // ==================== TEACHER TIMETABLE ====================
  http.get('/api/timetable/teachers/:id/timetable', async ({ params }) => {
    await mockDelay('read')
    const entries: TimetableEntry[] = []
    timetables.forEach(tt => {
      tt.entries.forEach(entry => {
        if (entry.teacherId === params.id) {
          entries.push(entry)
        }
      })
    })
    return HttpResponse.json({ data: { teacherId: params.id, entries } })
  }),

  // ==================== ROOM TIMETABLE ====================
  http.get('/api/timetable/rooms/:id/timetable', async ({ params }) => {
    await mockDelay('read')
    const entries: TimetableEntry[] = []
    timetables.forEach(tt => {
      tt.entries.forEach(entry => {
        if (entry.roomId === params.id) {
          entries.push(entry)
        }
      })
    })
    return HttpResponse.json({ data: { roomId: params.id, entries } })
  }),

  // ==================== SUBSTITUTIONS ====================
  http.get('/api/timetable/substitutions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status')
    const teacherId = url.searchParams.get('teacherId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...substitutions]

    if (date) {
      filtered = filtered.filter(s => s.date === date)
    }
    if (status) {
      filtered = filtered.filter(s => s.status === status)
    }
    if (teacherId) {
      filtered = filtered.filter(s =>
        s.originalTeacherId === teacherId || s.substituteTeacherId === teacherId
      )
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  http.post('/api/timetable/substitutions', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const period = periodDefinitions.find(p => p.id === body.periodId)
    const subject = subjects.find(s => s.id === body.subjectId)

    const newSub: Substitution = {
      id: `SUB-${Date.now()}`,
      date: body.date as string,
      periodId: body.periodId as string,
      periodName: period?.name || '',
      originalTeacherId: body.originalTeacherId as string,
      originalTeacherName: body.originalTeacherName as string || '',
      substituteTeacherId: body.substituteTeacherId as string,
      substituteTeacherName: body.substituteTeacherName as string || '',
      classId: body.classId as string,
      className: body.className as string || '',
      sectionId: body.sectionId as string,
      sectionName: body.sectionName as string || '',
      subjectId: body.subjectId as string,
      subjectName: subject?.name || '',
      reason: body.reason as string,
      status: 'pending',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    }

    substitutions.unshift(newSub)
    return HttpResponse.json({ data: newSub }, { status: 201 })
  }),

  http.patch('/api/timetable/substitutions/:id/approve', async ({ params }) => {
    await mockDelay('read')
    const index = substitutions.findIndex(s => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Substitution not found' }, { status: 404 })
    }
    substitutions[index].status = 'approved'
    substitutions[index].approvedBy = 'Principal'
    substitutions[index].approvedAt = new Date().toISOString()
    return HttpResponse.json({ data: substitutions[index] })
  }),

  http.patch('/api/timetable/substitutions/:id/reject', async ({ params }) => {
    await mockDelay('read')
    const index = substitutions.findIndex(s => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Substitution not found' }, { status: 404 })
    }
    substitutions[index].status = 'rejected'
    return HttpResponse.json({ data: substitutions[index] })
  }),

  http.delete('/api/timetable/substitutions/:id', async ({ params }) => {
    await mockDelay('read')
    const index = substitutions.findIndex(s => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Substitution not found' }, { status: 404 })
    }
    substitutions.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
