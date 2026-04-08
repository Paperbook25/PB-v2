import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as ws from '../../services/admin-website.service.js'
import { prisma } from '../../config/db.js'

const router = Router()

// Pricing Plans
router.get('/pricing', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.listPricingPlans() }) } catch (err) { next(err) }
})
router.post('/pricing', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await ws.createPricingPlan(req.body)) } catch (err) { next(err) }
})
router.put('/pricing/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.updatePricingPlan(String(req.params.id), req.body)) } catch (err) { next(err) }
})
router.delete('/pricing/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.deletePricingPlan(String(req.params.id))) } catch (err) { next(err) }
})

// Available Features (for building pricing packages)
router.get('/features', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: ws.getAvailableFeatures() }) } catch (err) { next(err) }
})

// Blog Posts
router.get('/blog', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.listBlogPosts(req.query as any)) } catch (err) { next(err) }
})
router.get('/blog/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.getBlogPost(String(req.params.id))) } catch (err) { next(err) }
})
router.post('/blog', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await ws.createBlogPost(req.body)) } catch (err) { next(err) }
})
router.put('/blog/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.updateBlogPost(String(req.params.id), req.body)) } catch (err) { next(err) }
})
router.delete('/blog/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.deleteBlogPost(String(req.params.id))) } catch (err) { next(err) }
})

// Auto-generate blog ideas
router.get('/blog-ideas', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.generateBlogIdea()) } catch (err) { next(err) }
})

// Auto-extract keywords from content
router.post('/extract-keywords', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = await ws.extractKeywordsFromContent(req.body.content || '', req.body.title || '')
    res.json({ keywords })
  } catch (err) { next(err) }
})

// Team Members
router.get('/team', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.listTeamMembers() }) } catch (err) { next(err) }
})
router.post('/team', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await ws.createTeamMember(req.body)) } catch (err) { next(err) }
})
router.put('/team/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.updateTeamMember(String(req.params.id), req.body)) } catch (err) { next(err) }
})
router.delete('/team/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.deleteTeamMember(String(req.params.id))) } catch (err) { next(err) }
})

// Website Config (contact, social, about, SEO)
router.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.getWebsiteConfig() }) } catch (err) { next(err) }
})
router.put('/config', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.updateWebsiteConfig(req.body, req.user?.name || 'Admin') }) } catch (err) { next(err) }
})

// SEO Page Settings (maps seo.* config keys to/from a clean object)
router.get('/seo/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cfg = await ws.getWebsiteConfig()
    res.json({ data: {
      homeTitle:      (cfg as any)['seo.homeTitle']       || '',
      homeDescription:(cfg as any)['seo.homeDescription'] || '',
      ogImageUrl:     (cfg as any)['seo.ogImageUrl']       || '',
      globalKeywords: (cfg as any)['seo.globalKeywords']   || '',
      gaTrackingId:   (cfg as any)['seo.gaTrackingId']     || '',
    } })
  } catch (err) { next(err) }
})
router.put('/seo/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { homeTitle, homeDescription, ogImageUrl, globalKeywords, gaTrackingId } = req.body
    const payload: Record<string, string> = {}
    if (homeTitle       !== undefined) payload['seo.homeTitle']       = homeTitle
    if (homeDescription !== undefined) payload['seo.homeDescription'] = homeDescription
    if (ogImageUrl      !== undefined) payload['seo.ogImageUrl']      = ogImageUrl
    if (globalKeywords  !== undefined) payload['seo.globalKeywords']  = globalKeywords
    if (gaTrackingId    !== undefined) payload['seo.gaTrackingId']    = gaTrackingId
    await ws.updateWebsiteConfig(payload, req.user?.name || 'Admin')
    res.json({ success: true })
  } catch (err) { next(err) }
})

// SEO Keywords
router.get('/seo/keywords', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.listSeoKeywords() }) } catch (err) { next(err) }
})
router.post('/seo/keywords', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await ws.createSeoKeyword(req.body)) } catch (err) { next(err) }
})
router.put('/seo/keywords/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.updateSeoKeyword(String(req.params.id), req.body)) } catch (err) { next(err) }
})
router.delete('/seo/keywords/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.deleteSeoKeyword(String(req.params.id))) } catch (err) { next(err) }
})

// SEO Analysis
router.get('/seo/analyze', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.analyzeSeo()) } catch (err) { next(err) }
})

// Internal Link Builder
router.post('/seo/build-links', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.buildInternalLinks()) } catch (err) { next(err) }
})

// AI Blog Content Generator
router.post('/blog/generate', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.generateBlogContent(req.body.topic, req.body.keywords || [])) } catch (err) { next(err) }
})

// Keyword Density Checker
router.post('/seo/keyword-density', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: ws.checkKeywordDensity(req.body.content, req.body.keywords) }) } catch (err) { next(err) }
})

// Auto Internal Link Injection
router.post('/blog/:id/inject-links', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.injectInternalLinks(String(req.params.id))) } catch (err) { next(err) }
})

// Full SEO Audit
router.get('/seo/full-audit', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await ws.fullSeoAudit()) } catch (err) { next(err) }
})

// Sitemap preview
router.get('/seo/sitemap-preview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const xml = await ws.generateSitemap()
    res.json({ xml })
  } catch (err) { next(err) }
})

// SEO Bot — Manual Triggers
router.post('/seo/run-bot', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { autoBlogWriter, weeklySeqAudit, autoLinkAllPosts, autoKeywordDiscovery } = await import('../../jobs/seo-automation.js')
    const action = req.body.action || 'all'

    const results: Record<string, any> = {}

    if (action === 'blog' || action === 'all') {
      results.blog = await autoBlogWriter()
    }
    if (action === 'audit' || action === 'all') {
      results.audit = await weeklySeqAudit()
    }
    if (action === 'keywords' || action === 'all') {
      results.keywords = await autoKeywordDiscovery()
    }
    if (action === 'links' || action === 'all') {
      results.links = await autoLinkAllPosts()
    }

    res.json({ success: true, results })
  } catch (err) { next(err) }
})

// SEO Bot Status
router.get('/seo/bot-status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [lastScore, lastAuditDate, totalPosts, totalKeywords] = await Promise.all([
      ws.getWebsiteConfig().then(c => c['seo.lastAuditScore'] || 'N/A'),
      ws.getWebsiteConfig().then(c => c['seo.lastAuditDate'] || 'Never'),
      ws.prismaCount('platformBlogPost'),
      ws.prismaCount('seoKeyword'),
    ])

    res.json({
      lastAuditScore: lastScore,
      lastAuditDate: lastAuditDate,
      schedule: {
        autoBlog: 'Every Monday 10 AM',
        seoAudit: 'Every Wednesday 8 AM',
        keywordDiscovery: 'Every Wednesday 8 AM',
        autoLinking: 'Every Wednesday 8 AM',
      },
      stats: { totalPosts, totalKeywords },
    })
  } catch (err) { next(err) }
})

// Image generation — dispatches to correct generator by type
// type: 'blog' (saves to DB) | 'linkedin' | 'twitter' | 'facebook' | 'instagram' (preview only)
router.post('/blog/:id/generate-cover', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type: string = req.body?.type || 'blog'
    const svc = await import('../../services/image-generation.service.js')
    const post = await prisma.platformBlogPost.findUnique({ where: { id: String(req.params.id) } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    let buffer: Buffer
    if (type === 'linkedin')       buffer = await svc.generateLinkedInPostImage({ title: post.title, category: post.category, excerpt: post.excerpt })
    else if (type === 'twitter')   buffer = await svc.generateTwitterPostImage({ title: post.title, category: post.category, excerpt: post.excerpt })
    else if (type === 'facebook')  buffer = await svc.generateFacebookPostImage({ title: post.title, category: post.category, excerpt: post.excerpt })
    else if (type === 'instagram') buffer = await svc.generateInstagramPostImage({ title: post.title, category: post.category, excerpt: post.excerpt })
    else                           buffer = await svc.generateBlogCoverImage({ title: post.title, category: post.category, excerpt: post.excerpt })

    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`

    if (type === 'blog') {
      // Save to blog post record
      await prisma.platformBlogPost.update({ where: { id: post.id }, data: { coverImage: dataUrl } })
      return res.json({ success: true, type, coverImage: dataUrl })
    }
    // Social types — preview only, no DB write
    res.json({ success: true, type, image: dataUrl })
  } catch (err) { next(err) }
})

// Social post image preview
router.post('/blog/generate-social-image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform = 'linkedin', title, excerpt } = req.body
    const { generateSocialPostImage } = await import('../../services/image-generation.service.js')
    const buffer = await generateSocialPostImage(platform, title, excerpt || '')
    res.json({ image: `data:image/png;base64,${buffer.toString('base64')}` })
  } catch (err) { next(err) }
})

// Keyword planner
router.post('/seo/keyword-planner', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keywords = await ws.generateKeywordSuggestions(req.body.seedTopic)
    res.json({ keywords })
  } catch (err) { next(err) }
})

// Social connections (list connected platform integrations for social media)
router.get('/social/connections', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await (prisma as any).platformIntegration.findMany({
      where: { type: 'social_media' },
      select: { id: true, provider: true, name: true, status: true, lastTestedAt: true },
    })
    res.json({ connections: rows })
  } catch (err) { next(err) }
})

// Post blog to all connected social platforms
router.post('/social/post-blog/:blogId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postBlogToAllSocials } = await import('../../services/social-posting.service.js')
    const results = await postBlogToAllSocials(String(req.params.blogId))
    res.json({ results })
  } catch (err) { next(err) }
})

// Social post history
router.get('/social/history', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await (prisma as any).socialPostLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ logs })
  } catch (err) { next(err) }
})

// Contact info (dedicated endpoint with proper key mapping)
router.get('/contact', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cfg = await ws.getWebsiteConfig()
    res.json({ data: {
      contactEmail:  (cfg as any)['contact.email']        || '',
      supportEmail:  (cfg as any)['contact.supportEmail'] || '',
      phone:         (cfg as any)['contact.phone']        || '',
      address:       (cfg as any)['contact.address']      || '',
      businessHours: (cfg as any)['contact.hours']        || '',
      mapLat:        (cfg as any)['contact.mapLat']       || '',
      mapLng:        (cfg as any)['contact.mapLng']       || '',
    }})
  } catch (err) { next(err) }
})
router.put('/contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactEmail, supportEmail, phone, address, businessHours, mapLat, mapLng } = req.body
    const payload: Record<string, string> = {}
    if (contactEmail   !== undefined) payload['contact.email']        = contactEmail
    if (supportEmail   !== undefined) payload['contact.supportEmail'] = supportEmail
    if (phone          !== undefined) payload['contact.phone']        = phone
    if (address        !== undefined) payload['contact.address']      = address
    if (businessHours  !== undefined) payload['contact.hours']        = businessHours
    if (mapLat         !== undefined) payload['contact.mapLat']       = String(mapLat)
    if (mapLng         !== undefined) payload['contact.mapLng']       = String(mapLng)
    await ws.updateWebsiteConfig(payload, req.user?.name || 'Admin')
    res.json({ success: true })
  } catch (err) { next(err) }
})

// Social links
router.get('/social', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cfg = await ws.getWebsiteConfig()
    res.json({ data: {
      facebook:  (cfg as any)['social.facebook']  || '',
      linkedin:  (cfg as any)['social.linkedin']  || '',
      instagram: (cfg as any)['social.instagram'] || '',
      twitter:   (cfg as any)['social.twitter']   || '',
      youtube:   (cfg as any)['social.youtube']   || '',
    }})
  } catch (err) { next(err) }
})
router.put('/social', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { facebook, linkedin, instagram, twitter, youtube } = req.body
    const payload: Record<string, string> = {}
    if (facebook  !== undefined) payload['social.facebook']  = facebook
    if (linkedin  !== undefined) payload['social.linkedin']  = linkedin
    if (instagram !== undefined) payload['social.instagram'] = instagram
    if (twitter   !== undefined) payload['social.twitter']   = twitter
    if (youtube   !== undefined) payload['social.youtube']   = youtube
    await ws.updateWebsiteConfig(payload, req.user?.name || 'Admin')
    res.json({ success: true })
  } catch (err) { next(err) }
})

// About page
router.get('/about', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cfg = await ws.getWebsiteConfig()
    res.json({ data: {
      title:       (cfg as any)['about.title']       || '',
      description: (cfg as any)['about.description'] || '',
      mission:     (cfg as any)['about.mission']     || '',
      vision:      (cfg as any)['about.vision']      || '',
    }})
  } catch (err) { next(err) }
})
router.put('/about', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, mission, vision } = req.body
    const payload: Record<string, string> = {}
    if (title       !== undefined) payload['about.title']       = title
    if (description !== undefined) payload['about.description'] = description
    if (mission     !== undefined) payload['about.mission']     = mission
    if (vision      !== undefined) payload['about.vision']      = vision
    await ws.updateWebsiteConfig(payload, req.user?.name || 'Admin')
    res.json({ success: true })
  } catch (err) { next(err) }
})

// Marketing integrations showcase
router.get('/integrations', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.getMarketingIntegrations() }) } catch (err) { next(err) }
})
router.put('/integrations', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.updateMarketingIntegrations(req.body.items || []) }) } catch (err) { next(err) }
})

// Marketing products showcase
router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.getMarketingProducts() }) } catch (err) { next(err) }
})
router.put('/products', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.updateMarketingProducts(req.body.items || []) }) } catch (err) { next(err) }
})

// Marketing addons pricing (use /addons-config to avoid conflict with school /admin/addons route)
router.get('/addons-config', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.getMarketingAddons() }) } catch (err) { next(err) }
})
router.put('/addons-config', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await ws.updateMarketingAddons(req.body.items || []) }) } catch (err) { next(err) }
})

export default router
