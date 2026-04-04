import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Pricing Plans ====================

export async function listPricingPlans() {
  return prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getPricingPlan(id: string) {
  const plan = await prisma.pricingPlan.findUnique({ where: { id } })
  if (!plan) throw AppError.notFound('Plan not found')
  return plan
}

export async function createPricingPlan(data: any) {
  return prisma.pricingPlan.create({ data })
}

export async function updatePricingPlan(id: string, data: any) {
  const plan = await prisma.pricingPlan.findUnique({ where: { id } })
  if (!plan) throw AppError.notFound('Plan not found')
  return prisma.pricingPlan.update({ where: { id }, data })
}

export async function deletePricingPlan(id: string) {
  await prisma.pricingPlan.delete({ where: { id } })
  return { success: true }
}

// ==================== Available Features List ====================

export function getAvailableFeatures() {
  return [
    // Core
    { id: 'dashboard', name: 'Dashboard & Analytics', category: 'core' },
    { id: 'people', name: 'People Management (Students & Staff)', category: 'core' },
    { id: 'admissions', name: 'Admissions & Enrollment', category: 'core' },
    { id: 'attendance_manual', name: 'Attendance (Manual)', category: 'core' },
    { id: 'attendance_qr', name: 'Attendance (QR Code)', category: 'core' },
    { id: 'attendance_biometric', name: 'Attendance (Biometric)', category: 'core' },
    { id: 'communication', name: 'Communication (Announcements & Circulars)', category: 'core' },
    { id: 'calendar', name: 'Calendar & Events', category: 'core' },
    // Finance
    { id: 'finance', name: 'Finance (Fee Management & Reports)', category: 'finance' },
    { id: 'online_payments', name: 'Online Fee Collection (UPI, Cards)', category: 'finance' },
    { id: 'expense_tracking', name: 'Expense Tracking & Ledger', category: 'finance' },
    { id: 'fee_reminders', name: 'Automated Fee Reminders', category: 'finance' },
    // Academics
    { id: 'exams', name: 'Exams & Report Cards', category: 'academics' },
    { id: 'online_exams', name: 'Online Exams & Question Bank', category: 'academics' },
    { id: 'lms', name: 'LMS (Courses, Quizzes, Video)', category: 'academics' },
    { id: 'timetable', name: 'Timetable Management', category: 'academics' },
    // Operations
    { id: 'transport', name: 'Transport (Routes, Vehicles, GPS)', category: 'operations' },
    { id: 'hostel', name: 'Hostel Management', category: 'operations' },
    { id: 'library', name: 'Library Management', category: 'operations' },
    { id: 'inventory', name: 'Inventory & Assets', category: 'operations' },
    { id: 'visitors', name: 'Visitor Management', category: 'operations' },
    // Communication
    { id: 'parent_portal', name: 'Parent Portal', category: 'communication' },
    { id: 'messaging', name: 'Messaging (Teacher-Parent)', category: 'communication' },
    { id: 'sms', name: 'SMS Notifications', category: 'communication' },
    { id: 'surveys', name: 'Surveys & Feedback', category: 'communication' },
    // Advanced
    { id: 'custom_branding', name: 'Custom Branding & School Website', category: 'advanced' },
    { id: 'reports', name: 'Advanced Reports Builder', category: 'advanced' },
    { id: 'multi_branch', name: 'Multi-Branch Support', category: 'advanced' },
    { id: 'api_access', name: 'API Access & Integrations', category: 'advanced' },
    { id: 'sso', name: 'SSO & White-Label', category: 'advanced' },
    { id: 'dedicated_support', name: 'Dedicated Account Manager', category: 'advanced' },
    { id: 'priority_support', name: 'Priority Support (Phone + Chat)', category: 'advanced' },
    { id: 'email_support', name: 'Email Support (24hr)', category: 'support' },
    { id: 'community_support', name: 'Community Support', category: 'support' },
  ]
}

// ==================== Blog Posts ====================

export async function listBlogPosts(query?: { status?: string; category?: string; page?: number; limit?: number }) {
  const page = query?.page || 1
  const limit = query?.limit || 20
  const where: any = {}
  if (query?.status) where.status = query.status
  if (query?.category) where.category = query.category

  const [total, posts] = await Promise.all([
    prisma.platformBlogPost.count({ where }),
    prisma.platformBlogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

export async function getBlogPost(id: string) {
  const post = await prisma.platformBlogPost.findUnique({ where: { id } })
  if (!post) throw AppError.notFound('Blog post not found')
  return post
}

export async function createBlogPost(data: any) {
  // Auto-generate slug from title
  if (!data.slug && data.title) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  return prisma.platformBlogPost.create({ data })
}

export async function updateBlogPost(id: string, data: any) {
  const post = await prisma.platformBlogPost.findUnique({ where: { id } })
  if (!post) throw AppError.notFound('Blog post not found')
  if (data.status === 'published' && !post.publishedAt) {
    data.publishedAt = new Date()
  }
  return prisma.platformBlogPost.update({ where: { id }, data })
}

export async function deleteBlogPost(id: string) {
  await prisma.platformBlogPost.delete({ where: { id } })
  return { success: true }
}

// ==================== Team Members ====================

export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function createTeamMember(data: any) {
  return prisma.teamMember.create({ data })
}

export async function updateTeamMember(id: string, data: any) {
  return prisma.teamMember.update({ where: { id }, data })
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } })
  return { success: true }
}

// ==================== Website Config (Contact, Social, About, SEO) ====================

export async function getWebsiteConfig() {
  const settings = await prisma.platformSettings.findMany({
    where: { key: { startsWith: 'website.' } },
  })
  const config: Record<string, string> = {}
  for (const s of settings) {
    config[s.key.replace('website.', '')] = s.value
  }
  return config
}

export async function updateWebsiteConfig(data: Record<string, string>, updatedBy?: string) {
  const ops = Object.entries(data).map(([key, value]) =>
    prisma.platformSettings.upsert({
      where: { key: `website.${key}` },
      update: { value, updatedBy },
      create: { key: `website.${key}`, value, updatedBy },
    })
  )
  await Promise.all(ops)
  return getWebsiteConfig()
}

// ==================== SEO Keywords ====================

export async function listSeoKeywords() {
  return prisma.seoKeyword.findMany({ orderBy: { volume: 'desc' } })
}

export async function createSeoKeyword(data: any) {
  return prisma.seoKeyword.create({ data })
}

export async function updateSeoKeyword(id: string, data: any) {
  return prisma.seoKeyword.update({ where: { id }, data })
}

export async function deleteSeoKeyword(id: string) {
  await prisma.seoKeyword.delete({ where: { id } })
  return { success: true }
}

// ==================== SEO Auto-Analysis ====================

export async function analyzeSeo() {
  const [posts, plans, config, keywords] = await Promise.all([
    prisma.platformBlogPost.findMany({ where: { status: 'published' } }),
    prisma.pricingPlan.findMany({ where: { isActive: true } }),
    getWebsiteConfig(),
    prisma.seoKeyword.findMany(),
  ])

  const issues: { type: string; severity: string; message: string; fix?: string }[] = []

  // Check blog posts for SEO
  for (const post of posts) {
    if (!post.metaTitle) issues.push({ type: 'blog', severity: 'high', message: `Blog "${post.title}" missing meta title`, fix: `Add meta title for "${post.title}"` })
    if (!post.metaDescription) issues.push({ type: 'blog', severity: 'high', message: `Blog "${post.title}" missing meta description`, fix: `Add 150-160 char description` })
    if (post.keywords.length === 0) issues.push({ type: 'blog', severity: 'medium', message: `Blog "${post.title}" has no keywords`, fix: `Add 3-5 target keywords` })
    if (post.content.length < 500) issues.push({ type: 'blog', severity: 'medium', message: `Blog "${post.title}" is too short (${post.content.length} chars)`, fix: `Aim for 1,500+ words for SEO` })
  }

  // Check website config
  if (!config['seo.homeTitle']) issues.push({ type: 'page', severity: 'high', message: 'Homepage missing custom meta title', fix: 'Set in Website > SEO tab' })
  if (!config['seo.homeDescription']) issues.push({ type: 'page', severity: 'high', message: 'Homepage missing meta description', fix: 'Set in Website > SEO tab' })
  if (!config['social.facebook']) issues.push({ type: 'social', severity: 'low', message: 'Facebook page not linked', fix: 'Add Facebook URL in Social tab' })
  if (!config['social.linkedin']) issues.push({ type: 'social', severity: 'low', message: 'LinkedIn page not linked', fix: 'Add LinkedIn URL in Social tab' })

  // Check keywords
  if (keywords.length < 10) issues.push({ type: 'seo', severity: 'medium', message: `Only ${keywords.length} keywords tracked (recommend 20+)`, fix: 'Add more target keywords' })

  const score = Math.max(0, 100 - issues.filter(i => i.severity === 'high').length * 15 - issues.filter(i => i.severity === 'medium').length * 5 - issues.filter(i => i.severity === 'low').length * 2)

  return { score, issues, stats: { totalPosts: posts.length, publishedPosts: posts.filter(p => p.status === 'published').length, totalKeywords: keywords.length, pricingPlans: plans.length } }
}

// ==================== Auto Blog Writer (uses keyword context) ====================

export async function generateBlogIdea() {
  // Pull keywords and existing posts to suggest new topics
  const [keywords, recentPosts] = await Promise.all([
    prisma.seoKeyword.findMany({ take: 20, orderBy: { volume: 'desc' } }),
    prisma.platformBlogPost.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { title: true, tags: true, keywords: true } }),
  ])

  const existingTopics = recentPosts.map(p => p.title)
  const topKeywords = keywords.map(k => k.keyword)

  // Generate blog ideas based on education management keywords
  const ideas = [
    { title: `How to Streamline Fee Collection in Indian Schools`, keywords: ['fee management', 'school fee collection', 'online fee payment'], category: 'finance' },
    { title: `10 Ways to Improve Parent-Teacher Communication`, keywords: ['parent communication', 'school communication app', 'parent engagement'], category: 'communication' },
    { title: `Complete Guide to School ERP Implementation`, keywords: ['school ERP', 'school management system', 'education ERP'], category: 'technology' },
    { title: `Why Schools Need Digital Attendance Systems`, keywords: ['digital attendance', 'biometric attendance', 'school attendance system'], category: 'operations' },
    { title: `How to Choose the Right School Management Software`, keywords: ['school software comparison', 'best school management software', 'school ERP features'], category: 'technology' },
    { title: `CBSE vs ICSE: Managing Different Board Requirements`, keywords: ['CBSE school management', 'ICSE school software', 'board exam management'], category: 'academics' },
    { title: `Reducing Fee Defaulters: Strategies for School Administrators`, keywords: ['fee defaulters', 'school fee recovery', 'fee reminder system'], category: 'finance' },
    { title: `The Future of EdTech in India: Trends for 2026`, keywords: ['edtech India', 'education technology trends', 'digital education'], category: 'industry' },
    { title: `How to Set Up Online Admissions for Your School`, keywords: ['online admission', 'school admission software', 'admission management'], category: 'admissions' },
    { title: `Library Management Best Practices for Schools`, keywords: ['school library management', 'library software', 'digital library'], category: 'operations' },
  ].filter(idea => !existingTopics.some(t => t.toLowerCase().includes(idea.title.toLowerCase().split(' ')[2])))

  return { ideas: ideas.slice(0, 5), existingTopics, topKeywords }
}

// ==================== Auto Keyword Extraction ====================

export async function extractKeywordsFromContent(content: string, title: string): Promise<string[]> {
  // Simple keyword extraction based on word frequency and education domain
  const educationKeywords = [
    'school', 'education', 'student', 'teacher', 'parent', 'admission', 'fee', 'attendance',
    'exam', 'result', 'report card', 'timetable', 'library', 'transport', 'hostel',
    'ERP', 'management', 'software', 'platform', 'digital', 'online', 'cloud',
    'CBSE', 'ICSE', 'curriculum', 'learning', 'classroom', 'principal', 'staff',
    'communication', 'notification', 'SMS', 'payment', 'finance', 'ledger', 'expense',
    'LMS', 'course', 'quiz', 'assignment', 'grade', 'marks', 'progress',
  ]

  const text = `${title} ${content}`.toLowerCase()
  const words = text.split(/\s+/)

  // Count word frequency
  const freq: Record<string, number> = {}
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '')
    if (clean.length > 3) {
      freq[clean] = (freq[clean] || 0) + 1
    }
  }

  // Score keywords: frequency + domain relevance
  const scored = Object.entries(freq)
    .map(([word, count]) => ({
      word,
      score: count * (educationKeywords.some(k => k.toLowerCase() === word) ? 3 : 1),
    }))
    .sort((a, b) => b.score - a.score)

  // Also extract 2-word phrases
  const phrases: Record<string, number> = {}
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i].replace(/[^a-z]/g, '')} ${words[i + 1].replace(/[^a-z]/g, '')}`
    if (phrase.length > 7) {
      phrases[phrase] = (phrases[phrase] || 0) + 1
    }
  }

  const topPhrases = Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase)

  const topWords = scored.slice(0, 10).map(s => s.word)

  return [...new Set([...topPhrases, ...topWords])].slice(0, 10)
}

// ==================== Auto Internal Linking ====================

export async function buildInternalLinks() {
  const [posts, keywords] = await Promise.all([
    prisma.platformBlogPost.findMany({ where: { status: 'published' }, select: { id: true, slug: true, title: true, keywords: true, content: true } }),
    prisma.seoKeyword.findMany(),
  ])

  const links: { fromPost: string; toPost: string; keyword: string; fromTitle: string; toTitle: string }[] = []

  for (const post of posts) {
    for (const otherPost of posts) {
      if (post.id === otherPost.id) continue
      // Check if otherPost's keywords appear in this post's content
      for (const kw of otherPost.keywords) {
        if (post.content.toLowerCase().includes(kw.toLowerCase())) {
          links.push({
            fromPost: post.slug,
            toPost: otherPost.slug,
            keyword: kw,
            fromTitle: post.title,
            toTitle: otherPost.title,
          })
        }
      }
    }
  }

  // Update keyword linkages
  for (const kw of keywords) {
    const linkedPosts = posts.filter(p => p.keywords.includes(kw.keyword) || p.content.toLowerCase().includes(kw.keyword.toLowerCase()))
    await prisma.seoKeyword.update({
      where: { id: kw.id },
      data: { linkedPages: linkedPosts.map(p => `/blog/${p.slug}`), autoLinked: true },
    })
  }

  return { totalLinks: links.length, links: links.slice(0, 50) }
}

// ==================== Public API (for marketing website) ====================

export async function getPublicWebsiteData() {
  const [plans, config, team, recentPosts] = await Promise.all([
    prisma.pricingPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    getWebsiteConfig(),
    prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.platformBlogPost.findMany({ where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, take: 6, select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, category: true, tags: true, publishedAt: true } }),
  ])

  return {
    pricing: plans.map(p => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      monthlyPrice: p.monthlyPrice,
      yearlyPrice: p.yearlyPrice,
      isCustom: p.isCustom,
      maxStudents: p.maxStudents,
      features: p.features,
      badge: p.badge,
      ctaText: p.ctaText,
      ctaLink: p.ctaLink,
    })),
    contact: {
      email: config['contact.email'] || 'hello@paperbook.in',
      supportEmail: config['contact.supportEmail'] || 'support@paperbook.in',
      phone: config['contact.phone'] || '',
      address: config['contact.address'] || 'Bengaluru, Karnataka, India',
      hours: config['contact.hours'] || 'Mon-Sat, 9:00 AM - 6:00 PM IST',
    },
    social: {
      facebook: config['social.facebook'] || '',
      linkedin: config['social.linkedin'] || '',
      instagram: config['social.instagram'] || '',
      twitter: config['social.twitter'] || '',
      youtube: config['social.youtube'] || '',
    },
    about: {
      title: config['about.title'] || '',
      description: config['about.description'] || '',
      mission: config['about.mission'] || '',
      vision: config['about.vision'] || '',
    },
    seo: {
      homeTitle: config['seo.homeTitle'] || '',
      homeDescription: config['seo.homeDescription'] || '',
      ogImage: config['seo.ogImage'] || '',
      keywords: config['seo.keywords'] || '',
    },
    team,
    recentPosts,
  }
}

export async function getPublicBlogPost(slug: string) {
  const post = await prisma.platformBlogPost.findUnique({ where: { slug } })
  if (!post || post.status !== 'published') throw AppError.notFound('Blog post not found')
  // Increment views
  await prisma.platformBlogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } })
  return post
}

// ==================== Sitemap Generation ====================

export async function generateSitemap() {
  const posts = await prisma.platformBlogPost.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  })

  const baseUrl = 'https://paperbook.in'
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about.html', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq.html', priority: '0.6', changefreq: 'monthly' },
    { url: '/signup.html', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog.html', priority: '0.8', changefreq: 'daily' },
  ]

  const modulePages = ['dashboard', 'people', 'admissions', 'finance', 'exam', 'library', 'lms', 'management', 'operations', 'parent', 'communication', 'reports', 'settings']
    .map(m => ({ url: `/modules/${m}.html`, priority: '0.6', changefreq: 'monthly' }))

  const blogUrls = posts.map(p => ({
    url: `/blog-post.html?slug=${p.slug}`,
    priority: '0.7',
    changefreq: 'weekly' as string,
    lastmod: p.updatedAt.toISOString().split('T')[0],
  }))

  const allUrls = [...staticPages, ...modulePages, ...blogUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${baseUrl}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${(u as any).lastmod ? `\n    <lastmod>${(u as any).lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`
}

// ==================== AI Blog Content Writer ====================

export async function generateBlogContent(topic: string, targetKeywords: string[]) {
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const cap = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase())

  const sections = [
    { heading: 'Introduction', body: `In today's rapidly evolving education landscape, ${topic.toLowerCase()} has become a critical aspect of school management. Institutions across India are adopting digital solutions to streamline their operations and improve outcomes. This comprehensive guide explores the key aspects and how schools can leverage technology to stay ahead.` },
    ...targetKeywords.slice(0, 4).map(kw => ({
      heading: `Understanding ${cap(kw)}`,
      body: `${cap(kw)} plays a vital role in modern education management. Schools that effectively implement ${kw} solutions see significant improvements in efficiency, accuracy, and parent satisfaction. Whether you're running a small tuition center or a large CBSE/ICSE institution, having robust ${kw} capabilities is essential.`,
    })),
    { heading: `Key Benefits`, body: `Implementing a comprehensive solution brings numerous advantages: reduced administrative burden, improved accuracy in record-keeping, better communication with parents, real-time insights through analytics dashboards, and significant time savings for staff. Studies show that schools using integrated management platforms save an average of 15-20 hours per week on administrative tasks.` },
    { heading: 'How to Choose the Right Solution', body: `When evaluating solutions, consider these factors: ease of use for non-technical staff, mobile accessibility for parents and teachers, integration with existing systems, data security and compliance, customer support quality, and total cost of ownership. Look for platforms that offer free trials so you can test before committing.` },
    { heading: 'Conclusion', body: `${cap(topic.split(' ').slice(0, 3).join(' '))} is no longer optional for schools that want to thrive in the digital age. By adopting the right tools and practices, institutions can dramatically improve their operational efficiency while providing a better experience for students, parents, and staff.` },
  ]

  const content = sections.map(s => `<h2>${s.heading}</h2>\n<p>${s.body}</p>`).join('\n\n')
  const excerpt = `Learn about ${topic.toLowerCase()} and how modern school management systems can help. Covering ${targetKeywords.slice(0, 3).join(', ')} and more.`
  const extracted = await extractKeywordsFromContent(content, topic)
  const allKeywords = [...new Set([...targetKeywords, ...extracted])].slice(0, 10)

  // Auto-detect category
  const text = `${topic} ${targetKeywords.join(' ')}`.toLowerCase()
  let category = 'technology'
  if (text.match(/fee|payment|finance/)) category = 'finance'
  else if (text.match(/exam|grade|lms|curriculum/)) category = 'academics'
  else if (text.match(/transport|hostel|library|attendance/)) category = 'operations'
  else if (text.match(/parent|communication|notification/)) category = 'communication'
  else if (text.match(/admission|enrollment/)) category = 'admissions'
  else if (text.match(/trend|future|india/)) category = 'industry'

  return { title: topic, slug, excerpt, content, keywords: allKeywords, tags: allKeywords.slice(0, 5), metaTitle: topic.substring(0, 60), metaDescription: excerpt.substring(0, 155), category, isAiGenerated: true }
}

// ==================== Keyword Density Checker ====================

export function checkKeywordDensity(content: string, keywords: string[]) {
  const text = content.toLowerCase().replace(/<[^>]*>/g, '')
  const wordCount = text.split(/\s+/).length

  return keywords.map(kw => {
    const regex = new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const count = (text.match(regex) || []).length
    const density = wordCount > 0 ? Math.round((count / wordCount) * 1000) / 10 : 0
    return { keyword: kw, count, density, status: density === 0 ? 'missing' : density < 0.5 ? 'low' : density > 3 ? 'over-optimized' : 'good' }
  })
}

// ==================== Auto Internal Link Injection ====================

export async function injectInternalLinks(postId: string) {
  const post = await prisma.platformBlogPost.findUnique({ where: { id: postId } })
  if (!post) throw AppError.notFound('Post not found')

  const otherPosts = await prisma.platformBlogPost.findMany({
    where: { status: 'published', id: { not: postId } },
    select: { slug: true, title: true, keywords: true },
  })

  let updatedContent = post.content
  let linksInjected = 0

  for (const other of otherPosts) {
    for (const kw of other.keywords) {
      const regex = new RegExp(`(?<!<a[^>]*>)\\b(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![^<]*<\\/a>)`, 'i')
      if (regex.test(updatedContent) && linksInjected < 5) {
        updatedContent = updatedContent.replace(regex, `<a href="/blog-post.html?slug=${other.slug}" title="${other.title}">$1</a>`)
        linksInjected++
      }
    }
  }

  if (linksInjected > 0) {
    await prisma.platformBlogPost.update({ where: { id: postId }, data: { content: updatedContent } })
  }
  return { linksInjected, postId }
}

// ==================== Full SEO Audit ====================

export async function fullSeoAudit() {
  const [posts, plans, config, keywords] = await Promise.all([
    prisma.platformBlogPost.findMany(),
    prisma.pricingPlan.findMany({ where: { isActive: true } }),
    getWebsiteConfig(),
    prisma.seoKeyword.findMany(),
  ])

  const published = posts.filter(p => p.status === 'published')
  const issues: { type: string; severity: string; message: string; fix: string }[] = []

  if (!config['seo.homeTitle']) issues.push({ type: 'meta', severity: 'critical', message: 'Homepage missing meta title', fix: 'Set in SEO tab' })
  if (!config['seo.homeDescription']) issues.push({ type: 'meta', severity: 'critical', message: 'Homepage missing meta description', fix: 'Set in SEO tab (150-160 chars)' })
  if (!config['seo.ogImage']) issues.push({ type: 'meta', severity: 'high', message: 'Missing OG image', fix: 'Upload 1200x630px image' })

  for (const post of published) {
    const wc = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    if (!post.metaTitle) issues.push({ type: 'blog', severity: 'high', message: `"${post.title}" — no meta title`, fix: 'Add 50-60 char title' })
    if (!post.metaDescription) issues.push({ type: 'blog', severity: 'high', message: `"${post.title}" — no meta description`, fix: 'Add 150-160 char description' })
    if (post.keywords.length === 0) issues.push({ type: 'blog', severity: 'high', message: `"${post.title}" — no keywords`, fix: 'Add 3-5 keywords' })
    if (wc < 300) issues.push({ type: 'blog', severity: 'high', message: `"${post.title}" — too short (${wc} words)`, fix: 'Aim for 1,500+ words' })
    if (!post.content.includes('<a href="/blog-post.html')) issues.push({ type: 'linking', severity: 'medium', message: `"${post.title}" — no internal links`, fix: 'Use auto-link injection' })
  }

  if (published.length === 0) issues.push({ type: 'content', severity: 'critical', message: 'No published blog posts', fix: 'Publish 5-10 posts for SEO' })
  if (keywords.length < 10) issues.push({ type: 'keywords', severity: 'medium', message: `Only ${keywords.length} keywords tracked`, fix: 'Add 20+ keywords' })
  if (!config['social.facebook']) issues.push({ type: 'social', severity: 'low', message: 'Facebook not linked', fix: 'Add in Social tab' })
  if (!config['social.linkedin']) issues.push({ type: 'social', severity: 'low', message: 'LinkedIn not linked', fix: 'Add in Social tab' })

  const score = Math.max(0, 100 - issues.filter(i => i.severity === 'critical').length * 20 - issues.filter(i => i.severity === 'high').length * 10 - issues.filter(i => i.severity === 'medium').length * 3 - issues.filter(i => i.severity === 'low').length * 1)

  return {
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
    issues,
    stats: { totalPosts: posts.length, publishedPosts: published.length, totalKeywords: keywords.length, pricingPlans: plans.length },
    recommendations: [
      published.length < 10 && 'Publish more blog posts (aim for 10+)',
      !config['seo.homeTitle'] && 'Set a custom homepage meta title',
      keywords.length < 20 && 'Track more SEO keywords',
    ].filter(Boolean),
  }
}

export async function getPublicBlogList(query?: { category?: string; tag?: string; page?: number }) {
  const page = query?.page || 1
  const where: any = { status: 'published' }
  if (query?.category) where.category = query.category
  if (query?.tag) where.tags = { has: query.tag }

  const [total, posts] = await Promise.all([
    prisma.platformBlogPost.count({ where }),
    prisma.platformBlogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * 12,
      take: 12,
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, category: true, tags: true, publishedAt: true, views: true },
    }),
  ])

  return { data: posts, meta: { total, page, totalPages: Math.ceil(total / 12) } }
}
