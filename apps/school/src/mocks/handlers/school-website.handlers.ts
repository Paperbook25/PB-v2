import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'

// In-memory store
interface MockSection {
  id: string
  pageId: string
  type: string
  title: string | null
  content: Record<string, unknown>
  sortOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

interface MockPage {
  id: string
  slug: string
  title: string
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  sections: MockSection[]
}

let pages: MockPage[] = [
  {
    id: 'page-home',
    slug: 'home',
    title: 'Home',
    isPublished: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'sec-hero',
        pageId: 'page-home',
        type: 'hero',
        title: 'Welcome',
        content: {
          headline: 'Welcome to Delhi Public School',
          subtitle: 'Nurturing minds, building character since 1985',
          backgroundImage: '',
          ctaText: 'Apply Now',
          ctaLink: '/apply',
        },
        sortOrder: 0,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sec-about',
        pageId: 'page-home',
        type: 'about',
        title: 'About Us',
        content: {
          body: 'Delhi Public School has been a beacon of educational excellence for over three decades. Our institution is committed to providing a holistic learning environment that fosters academic excellence, character development, and creative thinking.',
          image: '',
          mission: 'To provide quality education that empowers students to become responsible global citizens with strong moral values.',
          vision: 'To be recognized as a center of academic excellence and character building, producing leaders who contribute positively to society.',
        },
        sortOrder: 1,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sec-stats',
        pageId: 'page-home',
        type: 'stats',
        title: 'By The Numbers',
        content: {
          items: [
            { label: 'Students', value: '2,500+', icon: 'Users' },
            { label: 'Faculty', value: '150+', icon: 'GraduationCap' },
            { label: 'Years', value: '39', icon: 'Calendar' },
            { label: 'Pass Rate', value: '98.5%', icon: 'Award' },
          ],
        },
        sortOrder: 2,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sec-testimonials',
        pageId: 'page-home',
        type: 'testimonials',
        title: 'What Parents Say',
        content: {
          items: [
            { name: 'Priya Sharma', role: 'Parent, Class 8', quote: 'The school has been instrumental in shaping my child\'s personality. The teachers are dedicated and the infrastructure is world-class.', avatar: '' },
            { name: 'Rajesh Kumar', role: 'Parent, Class 10', quote: 'I am extremely satisfied with the academic standards and the overall development opportunities provided by the school.', avatar: '' },
            { name: 'Anita Gupta', role: 'Parent, Class 5', quote: 'The school\'s focus on both academics and extracurricular activities has made a tremendous difference in my daughter\'s confidence.', avatar: '' },
          ],
        },
        sortOrder: 3,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sec-contact',
        pageId: 'page-home',
        type: 'contact',
        title: 'Contact Us',
        content: {
          showMap: true,
          showForm: true,
          mapEmbed: '',
          additionalInfo: '123 School Road, Vasant Kunj\nNew Delhi, Delhi 110070\nPhone: +91 11 2689 1234\nEmail: info@dps.edu.in',
        },
        sortOrder: 4,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'page-about',
    slug: 'about',
    title: 'About',
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  },
]

let websiteSettings = {
  id: 'settings-1',
  template: 'classic',
  primaryColor: '#1e40af',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  customDomain: null as string | null,
  metaTitle: 'Delhi Public School',
  metaDescription: 'Delhi Public School - Nurturing minds, building character since 1985',
  socialLinks: {
    facebook: 'https://facebook.com/dps',
    twitter: 'https://twitter.com/dps',
    instagram: 'https://instagram.com/dps',
    youtube: '',
  },
  headerHtml: null as string | null,
  footerHtml: null as string | null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

let mediaLibrary: Array<{
  id: string; fileName: string; url: string; mimeType: string | null; fileSize: number | null; altText: string | null; createdAt: string
}> = []

export const schoolWebsiteHandlers = [
  // ==================== Admin: Pages ====================
  http.get('/api/school-website/pages', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: pages })
  }),

  http.post('/api/school-website/pages', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as { slug: string; title: string; sortOrder?: number }
    const page = {
      id: faker.string.uuid(),
      slug: body.slug,
      title: body.title,
      isPublished: false,
      sortOrder: body.sortOrder ?? pages.length,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    pages.push(page)
    return HttpResponse.json({ data: page }, { status: 201 })
  }),

  http.get('/api/school-website/pages/:id', async ({ params }) => {
    await mockDelay('read')
    const page = pages.find(p => p.id === params.id)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json({ data: page })
  }),

  http.put('/api/school-website/pages/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = pages.findIndex(p => p.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await request.json() as Record<string, unknown>
    pages[idx] = { ...pages[idx], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json({ data: pages[idx] })
  }),

  http.delete('/api/school-website/pages/:id', async ({ params }) => {
    await mockDelay('write')
    pages = pages.filter(p => p.id !== params.id)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/school-website/pages/:id/publish', async ({ params }) => {
    await mockDelay('write')
    const page = pages.find(p => p.id === params.id)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    page.isPublished = true
    return HttpResponse.json({ data: page })
  }),

  http.post('/api/school-website/pages/:id/unpublish', async ({ params }) => {
    await mockDelay('write')
    const page = pages.find(p => p.id === params.id)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    page.isPublished = false
    return HttpResponse.json({ data: page })
  }),

  // ==================== Admin: Sections ====================
  http.post('/api/school-website/pages/:id/sections', async ({ params, request }) => {
    await mockDelay('write')
    const page = pages.find(p => p.id === params.id)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await request.json() as { type: string; title?: string; content?: Record<string, unknown> }
    const section = {
      id: faker.string.uuid(),
      pageId: String(params.id),
      type: body.type,
      title: body.title || null,
      content: body.content || {},
      sortOrder: page.sections.length,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    page.sections.push(section)
    return HttpResponse.json({ data: section }, { status: 201 })
  }),

  http.put('/api/school-website/sections/:id', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    for (const page of pages) {
      const idx = page.sections.findIndex(s => s.id === params.id)
      if (idx !== -1) {
        page.sections[idx] = { ...page.sections[idx], ...body, updatedAt: new Date().toISOString() }
        return HttpResponse.json({ data: page.sections[idx] })
      }
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.delete('/api/school-website/sections/:id', async ({ params }) => {
    await mockDelay('write')
    for (const page of pages) {
      const idx = page.sections.findIndex(s => s.id === params.id)
      if (idx !== -1) {
        page.sections.splice(idx, 1)
        return HttpResponse.json({ success: true })
      }
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('/api/school-website/pages/:id/sections/reorder', async ({ params, request }) => {
    await mockDelay('write')
    const page = pages.find(p => p.id === params.id)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await request.json() as { sections: Array<{ id: string; sortOrder: number }> }
    for (const item of body.sections) {
      const sec = page.sections.find(s => s.id === item.id)
      if (sec) sec.sortOrder = item.sortOrder
    }
    page.sections.sort((a, b) => a.sortOrder - b.sortOrder)
    return HttpResponse.json({ success: true })
  }),

  // ==================== Admin: Settings ====================
  http.get('/api/school-website/settings', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: websiteSettings })
  }),

  http.put('/api/school-website/settings', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    websiteSettings = { ...websiteSettings, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json({ data: websiteSettings })
  }),

  // ==================== Admin: Media ====================
  http.get('/api/school-website/media', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: mediaLibrary })
  }),

  http.post('/api/school-website/media', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as { fileName: string; url: string; mimeType?: string; fileSize?: number; altText?: string }
    const media = {
      id: faker.string.uuid(),
      fileName: body.fileName,
      url: body.url,
      mimeType: body.mimeType || null,
      fileSize: body.fileSize || null,
      altText: body.altText || null,
      createdAt: new Date().toISOString(),
    }
    mediaLibrary.push(media)
    return HttpResponse.json({ data: media }, { status: 201 })
  }),

  http.delete('/api/school-website/media/:id', async ({ params }) => {
    await mockDelay('write')
    mediaLibrary = mediaLibrary.filter(m => m.id !== params.id)
    return HttpResponse.json({ success: true })
  }),

  // ==================== Admin: AI Generate (SSE mock) ====================
  http.post('/api/school-website/ai/generate', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = [
          { type: 'progress', progress: 10, content: 'Gathering school data...' },
          { type: 'progress', progress: 30, content: 'Building AI prompt...' },
          { type: 'progress', progress: 50, content: 'Generating content...' },
          { type: 'progress', progress: 80, content: 'Saving sections...' },
          { type: 'progress', progress: 100, content: 'Done!' },
        ]
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          await new Promise(r => setTimeout(r, 500))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })
    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }),

  // ==================== Public Routes ====================
  http.get('/api/public/school-website/pages', async () => {
    await mockDelay('read')
    const published = pages.filter(p => p.isPublished).map(p => ({
      id: p.id, slug: p.slug, title: p.title, sortOrder: p.sortOrder,
    }))
    return HttpResponse.json({ data: published })
  }),

  http.get('/api/public/school-website/pages/:slug', async ({ params }) => {
    await mockDelay('read')
    const page = pages.find(p => p.slug === params.slug && p.isPublished)
    if (!page) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const filtered = { ...page, sections: page.sections.filter(s => s.isVisible) }
    return HttpResponse.json({ data: filtered })
  }),

  http.get('/api/public/school-website/settings', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        template: websiteSettings.template,
        primaryColor: websiteSettings.primaryColor,
        accentColor: websiteSettings.accentColor,
        fontFamily: websiteSettings.fontFamily,
        metaTitle: websiteSettings.metaTitle,
        metaDescription: websiteSettings.metaDescription,
        socialLinks: websiteSettings.socialLinks,
      },
    })
  }),
]
