import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as ws from '../../services/admin-website.service.js'

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

export default router
