import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  visitors,
  visitorPasses,
  preApprovedVisitors,
} from '../data/visitors.data'
import type {
  Visitor,
  VisitorPass,
  PreApprovedVisitor,
  VisitPurpose,
} from '@/features/visitors/types/visitor.types'

export const visitorsHandlers = [
  // ==================== STATS (MUST come before /api/visitors/:id) ====================

  http.get('/api/visitors/stats', async () => {
    await mockDelay('read')
    const today = new Date().toISOString().split('T')[0]
    const todayPasses = visitorPasses.filter((p) => p.checkInTime.startsWith(today))

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyPasses = visitorPasses.filter((p) => new Date(p.checkInTime) >= weekAgo)

    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const monthlyPasses = visitorPasses.filter((p) => new Date(p.checkInTime) >= monthAgo)

    // Calculate average duration for completed passes
    const completedPasses = todayPasses.filter((p) => p.checkOutTime)
    const avgDuration = completedPasses.length > 0
      ? Math.round(
          completedPasses.reduce((sum, p) => {
            return sum + (new Date(p.checkOutTime!).getTime() - new Date(p.checkInTime).getTime())
          }, 0) / completedPasses.length / 60000
        )
      : 0

    // Find peak hour
    const hourCounts: Record<number, number> = {}
    todayPasses.forEach((p) => {
      const hour = new Date(p.checkInTime).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]

    const stats = {
      todayVisitors: todayPasses.length,
      activeVisitors: todayPasses.filter((p) => p.status === 'active').length,
      completedToday: todayPasses.filter((p) => p.status === 'completed').length,
      avgVisitDuration: avgDuration,
      peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
      weeklyTotal: weeklyPasses.length,
      monthlyTotal: monthlyPasses.length,
      preApprovedActive: preApprovedVisitors.filter((p) => p.status === 'active').length,
    }

    return HttpResponse.json({ data: stats })
  }),

  // ==================== REPORTS (MUST come before /api/visitors/:id) ====================

  http.get('/api/visitors/reports', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let filtered = [...visitorPasses]

    if (startDate) {
      filtered = filtered.filter((p) => p.checkInTime >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((p) => p.checkInTime <= endDate + 'T23:59:59')
    }

    // Group by date
    const byDate: Record<string, VisitorPass[]> = {}
    filtered.forEach((p) => {
      const date = p.checkInTime.split('T')[0]
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(p)
    })

    const reports = Object.entries(byDate).map(([date, passes]) => {
      const byPurpose: Record<VisitPurpose, number> = {
        meeting: 0,
        delivery: 0,
        parent_visit: 0,
        vendor: 0,
        interview: 0,
        other: 0,
      }
      passes.forEach((p) => {
        byPurpose[p.purpose]++
      })

      const completed = passes.filter((p) => p.checkOutTime)
      const avgDuration = completed.length > 0
        ? Math.round(
            completed.reduce((sum, p) => {
              return sum + (new Date(p.checkOutTime!).getTime() - new Date(p.checkInTime).getTime())
            }, 0) / completed.length / 60000
          )
        : 0

      // Peak hours
      const hourCounts: Record<number, number> = {}
      passes.forEach((p) => {
        const hour = new Date(p.checkInTime).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })
      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      return {
        date,
        totalVisitors: passes.length,
        byPurpose,
        avgDuration,
        peakHours,
      }
    })

    reports.sort((a, b) => b.date.localeCompare(a.date))

    return HttpResponse.json({ data: reports })
  }),

  // ==================== VISITOR PASSES (MUST come before /api/visitors/:id) ====================

  // Get all passes
  http.get('/api/visitors/passes', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const purpose = url.searchParams.get('purpose')
    const date = url.searchParams.get('date')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...visitorPasses]

    if (status) filtered = filtered.filter((p) => p.status === status)
    if (purpose) filtered = filtered.filter((p) => p.purpose === purpose)
    if (date) {
      filtered = filtered.filter((p) => p.checkInTime.startsWith(date))
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((p) =>
        p.visitorName.toLowerCase().includes(s) ||
        p.hostName.toLowerCase().includes(s) ||
        p.passNumber.toLowerCase().includes(s)
      )
    }

    filtered.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Get active passes (today)
  http.get('/api/visitors/passes/active', async () => {
    await mockDelay('read')
    const today = new Date().toISOString().split('T')[0]
    const active = visitorPasses.filter(
      (p) => p.status === 'active' && p.checkInTime.startsWith(today)
    )
    return HttpResponse.json({ data: active })
  }),

  // Create pass (check-in)
  http.post('/api/visitors/passes', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const today = new Date().toISOString().split('T')[0]

    // Find or create visitor
    let visitor = visitors.find((v) => v.phone === body.visitorPhone)
    if (!visitor) {
      visitor = {
        id: `visitor-${Date.now()}`,
        name: body.visitorName as string,
        phone: body.visitorPhone as string,
        idType: body.visitorIdType as Visitor['idType'],
        idNumber: body.visitorIdNumber as string,
        company: body.visitorCompany as string,
        vehicleNumber: body.vehicleNumber as string,
        createdAt: new Date().toISOString(),
      }
      visitors.push(visitor)
    }

    const passCount = visitorPasses.filter((p) => p.checkInTime.startsWith(today)).length

    const newPass: VisitorPass = {
      id: `pass-${Date.now()}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorPhone: visitor.phone,
      visitorCompany: visitor.company,
      passNumber: `VP-${today.replace(/-/g, '')}-${String(passCount + 1).padStart(4, '0')}`,
      purpose: body.purpose as VisitorPass['purpose'],
      purposeDetails: body.purposeDetails as string,
      hostType: body.hostType as VisitorPass['hostType'],
      hostId: body.hostId as string,
      hostName: body.hostName as string,
      hostDepartment: body.hostDepartment as string,
      checkInTime: new Date().toISOString(),
      expectedDuration: body.expectedDuration as number || 60,
      status: 'active',
      badge: `B-${String(passCount + 1).padStart(3, '0')}`,
      belongings: body.belongings as string[],
      vehicleNumber: body.vehicleNumber as string,
      createdAt: new Date().toISOString(),
    }

    visitorPasses.push(newPass)
    return HttpResponse.json({ data: newPass }, { status: 201 })
  }),

  // Check-out visitor
  http.patch('/api/visitors/passes/:id/checkout', async ({ params }) => {
    await mockDelay('write')
    const index = visitorPasses.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    visitorPasses[index].checkOutTime = new Date().toISOString()
    visitorPasses[index].status = 'completed'

    return HttpResponse.json({ data: visitorPasses[index] })
  }),

  // Cancel pass
  http.patch('/api/visitors/passes/:id/cancel', async ({ params }) => {
    await mockDelay('write')
    const index = visitorPasses.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    visitorPasses[index].status = 'cancelled'
    return HttpResponse.json({ data: visitorPasses[index] })
  }),

  // Delete pass
  http.delete('/api/visitors/passes/:id', async ({ params }) => {
    await mockDelay('write')
    const index = visitorPasses.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    visitorPasses.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== PRE-APPROVED VISITORS (MUST come before /api/visitors/:id) ====================

  // Get all pre-approved
  http.get('/api/visitors/pre-approved', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let filtered = [...preApprovedVisitors]
    if (status) filtered = filtered.filter((p) => p.status === status)

    return HttpResponse.json({ data: filtered })
  }),

  // Create pre-approved
  http.post('/api/visitors/pre-approved', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>

    // Find or create visitor
    let visitor = visitors.find((v) => v.phone === body.visitorPhone)
    if (!visitor) {
      visitor = {
        id: `visitor-${Date.now()}`,
        name: body.visitorName as string,
        phone: body.visitorPhone as string,
        idType: 'other',
        idNumber: '',
        company: body.visitorCompany as string,
        createdAt: new Date().toISOString(),
      }
      visitors.push(visitor)
    }

    const newPreApproved: PreApprovedVisitor = {
      id: `pre-${Date.now()}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorPhone: visitor.phone,
      visitorCompany: body.visitorCompany as string,
      validFrom: body.validFrom as string,
      validUntil: body.validUntil as string,
      purpose: body.purpose as string,
      approvedBy: 'admin-1',
      approvedByName: 'Administrator',
      maxVisits: body.maxVisits as number || 12,
      usedVisits: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    preApprovedVisitors.push(newPreApproved)
    return HttpResponse.json({ data: newPreApproved }, { status: 201 })
  }),

  // Revoke pre-approved
  http.patch('/api/visitors/pre-approved/:id/revoke', async ({ params }) => {
    await mockDelay('write')
    const index = preApprovedVisitors.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Pre-approved visitor not found' }, { status: 404 })
    }

    preApprovedVisitors[index].status = 'revoked'
    return HttpResponse.json({ data: preApprovedVisitors[index] })
  }),

  // ==================== VISITORS (dynamic :id routes MUST come AFTER specific paths) ====================

  // Get all visitors
  http.get('/api/visitors', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')

    let filtered = [...visitors]
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(s) ||
        v.phone.includes(s) ||
        v.company?.toLowerCase().includes(s)
      )
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Get single visitor
  http.get('/api/visitors/:id', async ({ params }) => {
    await mockDelay('read')
    const visitor = visitors.find((v) => v.id === params.id)
    if (!visitor) {
      return HttpResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: visitor })
  }),

  // Create visitor
  http.post('/api/visitors', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>

    const newVisitor: Visitor = {
      id: `visitor-${Date.now()}`,
      name: body.name as string,
      phone: body.phone as string,
      email: body.email as string,
      idType: body.idType as Visitor['idType'],
      idNumber: body.idNumber as string,
      company: body.company as string,
      vehicleNumber: body.vehicleNumber as string,
      address: body.address as string,
      createdAt: new Date().toISOString(),
    }

    visitors.push(newVisitor)
    return HttpResponse.json({ data: newVisitor }, { status: 201 })
  }),

  // Update visitor
  http.put('/api/visitors/:id', async ({ params, request }) => {
    await mockDelay('write')
    const index = visitors.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<Visitor>
    visitors[index] = { ...visitors[index], ...body }
    return HttpResponse.json({ data: visitors[index] })
  }),

  // Delete visitor
  http.delete('/api/visitors/:id', async ({ params }) => {
    await mockDelay('write')
    const index = visitors.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    visitors.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
