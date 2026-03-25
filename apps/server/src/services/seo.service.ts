import { prisma } from '../config/db.js'

/**
 * Extract text content from section data for SEO purposes
 */
function extractTextFromSections(sections: any[]): string {
  const texts: string[] = []
  for (const s of sections) {
    const c = s.content || {}
    if (c.headline) texts.push(c.headline)
    if (c.subtitle) texts.push(c.subtitle)
    if (c.body) texts.push(c.body)
    if (c.description) texts.push(c.description)
    if (c.mission) texts.push(c.mission)
    if (c.vision) texts.push(c.vision)
    if (s.title) texts.push(s.title)
  }
  return texts.join(' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Auto-generate SEO metadata for a page based on its sections content
 */
export async function regeneratePageSeo(schoolId: string, pageId: string) {
  const page = await prisma.websitePage.findFirst({
    where: { id: pageId, organizationId: schoolId },
    include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!page) return

  const settings = await prisma.websiteSettings.findFirst({ where: { organizationId: schoolId } })
  const profile = await prisma.schoolProfile.findFirst({ where: { id: schoolId } })
  const schoolName = profile?.name || settings?.metaTitle || 'Our School'

  const fullText = extractTextFromSections(page.sections)

  // Auto-generate meta title: Page Title | School Name
  const autoMetaTitle = `${page.title} | ${schoolName}`

  // Auto-generate meta description: first 155 chars of meaningful content
  const autoMetaDescription = fullText.slice(0, 155) + (fullText.length > 155 ? '...' : '')

  // Auto-generate JSON-LD based on institution type
  const institutionType = settings?.institutionType || 'school'
  const schemaType = institutionType === 'college' ? 'CollegeOrUniversity'
    : institutionType === 'coaching' ? 'EducationalOrganization'
    : 'School'

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: schoolName,
    url: settings?.customDomain ? `https://${settings.customDomain}` : undefined,
    description: autoMetaDescription,
  }

  if (profile) {
    if ((profile as any).address || (profile as any).city) {
      jsonLd.address = {
        '@type': 'PostalAddress',
        streetAddress: (profile as any).address || '',
        addressLocality: (profile as any).city || '',
        addressRegion: (profile as any).state || '',
        postalCode: (profile as any).pincode || '',
        addressCountry: 'IN',
      }
    }
    if ((profile as any).phone) jsonLd.telephone = (profile as any).phone
    if ((profile as any).email) jsonLd.email = (profile as any).email
    if ((profile as any).establishedYear) jsonLd.foundingDate = String((profile as any).establishedYear)
  }

  // Only update if user hasn't manually set SEO fields
  const updateData: any = {}
  if (!page.metaTitle) updateData.metaTitle = autoMetaTitle
  if (!page.metaDescription) updateData.metaDescription = autoMetaDescription
  updateData.jsonLd = jsonLd

  if (Object.keys(updateData).length > 0) {
    await prisma.websitePage.update({
      where: { id: pageId },
      data: updateData,
    })
  }

  return { metaTitle: autoMetaTitle, metaDescription: autoMetaDescription, jsonLd }
}

/**
 * Generate sitemap XML for all published pages + blog posts
 */
export async function generateSitemap(schoolId: string, baseUrl: string) {
  const pages = await prisma.websitePage.findMany({
    where: { organizationId: schoolId, isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: { sortOrder: 'asc' },
  })

  let blogPosts: any[] = []
  try {
    blogPosts = await (prisma as any).blogPost.findMany({
      where: { organizationId: schoolId, status: 'published' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
  } catch { /* BlogPost model might not exist yet */ }

  const urls = [
    ...pages.map(p => ({
      loc: `${baseUrl}/s/${p.slug}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: p.slug === 'home' ? 'weekly' : 'monthly',
      priority: p.slug === 'home' ? '1.0' : '0.8',
    })),
    ...blogPosts.map((p: any) => ({
      loc: `${baseUrl}/s/blog/${p.slug}`,
      lastmod: (p.publishedAt || p.updatedAt).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt(baseUrl: string) {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/public/school-website/sitemap.xml
`
}
