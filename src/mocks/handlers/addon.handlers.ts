import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'

const MOCK_ADDONS = [
  { id: '1', slug: 'library', name: 'Library', description: 'Book management, issuing, returns, and digital library', icon: 'BookOpen', category: 'academic', isCore: false, sortOrder: 1, enabled: true, enabledAt: new Date().toISOString() },
  { id: '2', slug: 'lms', name: 'LMS', description: 'Learning management with courses, assignments, and live classes', icon: 'GraduationCap', category: 'academic', isCore: false, sortOrder: 2, enabled: true, enabledAt: new Date().toISOString() },
  { id: '3', slug: 'exams', name: 'Exams', description: 'Exam scheduling, marks entry, grade scales, and report cards', icon: 'ClipboardCheck', category: 'academic', isCore: false, sortOrder: 3, enabled: true, enabledAt: new Date().toISOString() },
  { id: '4', slug: 'transport', name: 'Transport', description: 'Vehicle management, routes, drivers, and live tracking', icon: 'Bus', category: 'operations', isCore: false, sortOrder: 4, enabled: true, enabledAt: new Date().toISOString() },
  { id: '5', slug: 'hostel', name: 'Hostel', description: 'Room allocation, mess management, and hostel attendance', icon: 'Building2', category: 'operations', isCore: false, sortOrder: 5, enabled: false, enabledAt: null },
  { id: '6', slug: 'operations', name: 'Operations', description: 'Inventory, assets, and facility management', icon: 'Warehouse', category: 'operations', isCore: false, sortOrder: 6, enabled: true, enabledAt: new Date().toISOString() },
  { id: '7', slug: 'documents', name: 'Documents', description: 'Document storage, folders, and file management', icon: 'FolderOpen', category: 'operations', isCore: false, sortOrder: 7, enabled: true, enabledAt: new Date().toISOString() },
  { id: '8', slug: 'clubs', name: 'Clubs', description: 'Extracurricular clubs and activity management', icon: 'Trophy', category: 'extras', isCore: false, sortOrder: 8, enabled: false, enabledAt: null },
  { id: '9', slug: 'alumni', name: 'Alumni', description: 'Alumni network and engagement tracking', icon: 'Users', category: 'extras', isCore: false, sortOrder: 9, enabled: false, enabledAt: null },
  { id: '10', slug: 'scholarships', name: 'Scholarships', description: 'Scholarship programs and applications', icon: 'Award', category: 'extras', isCore: false, sortOrder: 10, enabled: true, enabledAt: new Date().toISOString() },
  { id: '11', slug: 'complaints', name: 'Complaints', description: 'Complaint tracking and resolution', icon: 'MessageSquareWarning', category: 'communication', isCore: false, sortOrder: 11, enabled: true, enabledAt: new Date().toISOString() },
  { id: '12', slug: 'visitors', name: 'Visitors', description: 'Visitor management and gate passes', icon: 'UserCheck', category: 'communication', isCore: false, sortOrder: 12, enabled: true, enabledAt: new Date().toISOString() },
]

export const addonHandlers = [
  // Get all addons
  http.get('/api/addons', async () => {
    await mockDelay('read')
    return HttpResponse.json({ addons: MOCK_ADDONS })
  }),

  // Toggle addon enabled/disabled
  http.patch('/api/addons/:slug', async ({ params, request }) => {
    await mockDelay('write')
    const { slug } = params
    const body = (await request.json()) as { enabled: boolean }
    const addon = MOCK_ADDONS.find((a) => a.slug === slug)

    if (!addon) {
      return HttpResponse.json({ error: 'Addon not found' }, { status: 404 })
    }

    addon.enabled = body.enabled
    addon.enabledAt = body.enabled ? new Date().toISOString() : null

    return HttpResponse.json({ slug, enabled: body.enabled })
  }),
]
