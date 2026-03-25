import { ChatOllama } from '@langchain/ollama'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { env } from '../config/env.js'
import { prisma } from '../config/db.js'
import * as websiteService from './school-website.service.js'

function getLLM() {
  return new ChatOllama({
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL,
    temperature: 0.7,
  })
}

interface GenerateOptions {
  schoolId: string
  pageSlug: string
  template: 'classic' | 'modern' | 'minimal'
  onChunk: (chunk: { type: string; content?: string; progress?: number }) => void
}

export async function generatePageContent({ schoolId, pageSlug, template, onChunk }: GenerateOptions) {
  // Gather school context
  const profile = await websiteService.fetchSchoolProfile(schoolId)
  const faculty = await websiteService.fetchFacultyData(schoolId)

  let studentCount = 0
  let staffCount = faculty.length
  try {
    studentCount = await prisma.student.count({ where: { organizationId: schoolId, status: 'active' } })
  } catch { /* table may not exist */ }

  const schoolName = profile?.name || 'Our School'
  const schoolAddress = profile ? `${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}` : ''
  const schoolPhone = profile?.phone || ''
  const schoolEmail = profile?.email || ''
  const established = profile?.establishedYear || 2000

  onChunk({ type: 'progress', progress: 10, content: 'Gathering school data...' })

  // Find or create the page
  let page = await prisma.websitePage.findFirst({ where: { slug: pageSlug, organizationId: schoolId } })
  if (!page) {
    page = await prisma.websitePage.create({
      data: { organizationId: schoolId, slug: pageSlug, title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1) },
    })
  }

  onChunk({ type: 'progress', progress: 20, content: 'Building AI prompt...' })

  const prompt = `Generate website section content for a school with these details:
- School Name: ${schoolName}
- Address: ${schoolAddress}
- Phone: ${schoolPhone}
- Email: ${schoolEmail}
- Established: ${established}
- Students: ${studentCount}
- Staff: ${staffCount}
- Template style: ${template}

Generate realistic content for a school homepage. Return ONLY valid JSON (no markdown code fences) in this exact format:
{
  "sections": [
    { "type": "hero", "title": "Welcome", "content": { "headline": "...", "subtitle": "...", "backgroundImage": "", "ctaText": "Apply Now", "ctaLink": "/apply" } },
    { "type": "about", "title": "About Us", "content": { "body": "...", "image": "", "mission": "...", "vision": "..." } },
    { "type": "stats", "title": "By The Numbers", "content": { "items": [{ "label": "...", "value": "...", "icon": "..." }] } },
    { "type": "admissions", "title": "Admissions", "content": { "body": "...", "ctaText": "Apply Online", "ctaLink": "/apply", "showApplicationForm": true } },
    { "type": "testimonials", "title": "Testimonials", "content": { "items": [{ "name": "...", "role": "Parent", "quote": "...", "avatar": "" }] } },
    { "type": "events", "title": "Upcoming Events", "content": { "showCount": 5, "showPast": false } },
    { "type": "contact", "title": "Contact Us", "content": { "showMap": true, "showForm": true, "mapEmbed": "", "additionalInfo": "..." } }
  ]
}

Make content authentic for an Indian school. Use ${template} style tone: ${template === 'classic' ? 'formal and traditional' : template === 'modern' ? 'clean and contemporary' : 'minimal and elegant'}.`

  onChunk({ type: 'progress', progress: 30, content: 'Generating content with AI...' })

  try {
    const llm = getLLM()
    const messages = [
      new SystemMessage('You are a school website content generator. Return ONLY valid JSON. No explanations, no markdown fences.'),
      new HumanMessage(prompt),
    ]

    let fullResponse = ''
    const stream = await llm.stream(messages)
    for await (const chunk of stream) {
      const text = typeof chunk.content === 'string' ? chunk.content : ''
      if (text) {
        fullResponse += text
        onChunk({ type: 'text', content: text })
      }
    }

    onChunk({ type: 'progress', progress: 70, content: 'Parsing AI response...' })

    // Extract JSON from response (handle markdown fences if present)
    let jsonStr = fullResponse.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr)
    const sections = parsed.sections || []

    onChunk({ type: 'progress', progress: 80, content: 'Saving sections...' })

    // Delete existing sections for this page
    await prisma.websiteSection.deleteMany({ where: { pageId: page.id } })

    // Create new sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      await prisma.websiteSection.create({
        data: {
          pageId: page.id,
          type: section.type,
          title: section.title || null,
          content: section.content || {},
          sortOrder: i,
        },
      })
    }

    onChunk({ type: 'progress', progress: 100, content: 'Done!' })

    return { pageId: page.id, sectionsCreated: sections.length }
  } catch (error: any) {
    // Fallback: create default sections without AI
    onChunk({ type: 'progress', progress: 50, content: 'AI unavailable, generating defaults...' })

    await prisma.websiteSection.deleteMany({ where: { pageId: page.id } })

    const defaultSections = [
      { type: 'hero', title: 'Welcome', content: { headline: `Welcome to ${schoolName}`, subtitle: `Nurturing minds since ${established}`, backgroundImage: '', ctaText: 'Apply Now', ctaLink: '/apply' }, sortOrder: 0 },
      { type: 'about', title: 'About Us', content: { body: `${schoolName} is a premier educational institution committed to academic excellence and holistic development. Established in ${established}, we have been shaping young minds for over ${new Date().getFullYear() - established} years.`, image: '', mission: 'To provide quality education that empowers students to become responsible global citizens.', vision: 'To be recognized as a center of academic excellence and character building.' }, sortOrder: 1 },
      { type: 'stats', title: 'By The Numbers', content: { items: [{ label: 'Students', value: String(studentCount || '500+'), icon: 'Users' }, { label: 'Faculty', value: String(staffCount || '50+'), icon: 'GraduationCap' }, { label: 'Years', value: String(new Date().getFullYear() - established), icon: 'Calendar' }, { label: 'Pass Rate', value: '98%', icon: 'Award' }] }, sortOrder: 2 },
      { type: 'contact', title: 'Contact Us', content: { showMap: true, showForm: true, mapEmbed: '', additionalInfo: `${schoolAddress}\nPhone: ${schoolPhone}\nEmail: ${schoolEmail}` }, sortOrder: 3 },
    ]

    for (const section of defaultSections) {
      await prisma.websiteSection.create({
        data: { pageId: page.id, ...section, content: section.content as any },
      })
    }

    onChunk({ type: 'progress', progress: 100, content: 'Default content generated.' })

    return { pageId: page.id, sectionsCreated: defaultSections.length, fallback: true }
  }
}
