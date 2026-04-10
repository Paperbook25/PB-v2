import { prisma } from '../config/db.js'
import {
  generateBlogContent,
  generateBlogIdea,
  injectInternalLinks,
  fullSeoAudit,
  extractKeywordsFromContent,
  buildInternalLinks,
} from '../services/admin-website.service.js'

// ============================================================================
// SEO Automation Bot — Runs on schedule to keep SEO healthy
// ============================================================================

const ONE_DAY = 24 * 60 * 60 * 1000
const ONE_WEEK = 7 * ONE_DAY

/**
 * Auto Blog Writer Bot
 * - Picks a topic from the idea generator
 * - Generates full blog content with keywords
 * - Publishes it automatically
 * - Injects internal links
 * - Logs to audit trail
 */
async function autoBlogWriter() {
  console.log('[SEO Bot] Starting auto blog writer...')

  try {
    // Get blog ideas and pick the first unused one
    const { ideas } = await generateBlogIdea()
    if (!ideas || ideas.length === 0) {
      console.log('[SEO Bot] No blog ideas available, skipping')
      return { generated: false, reason: 'no ideas' }
    }

    const idea = ideas[0]
    console.log(`[SEO Bot] Writing blog: "${idea.title}"`)

    // Generate full content
    const blogData = await generateBlogContent(idea.title, idea.keywords || [])

    // Check if slug already exists
    const existing = await prisma.platformBlogPost.findUnique({ where: { slug: blogData.slug } })
    if (existing) {
      console.log(`[SEO Bot] Blog with slug "${blogData.slug}" already exists, skipping`)
      return { generated: false, reason: 'duplicate slug' }
    }

    // Create and publish the blog post
    const post = await prisma.platformBlogPost.create({
      data: {
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        keywords: blogData.keywords,
        tags: blogData.tags,
        metaTitle: blogData.metaTitle,
        metaDescription: blogData.metaDescription,
        category: blogData.category,
        author: 'PaperBook Team',
        status: 'published',
        publishedAt: new Date(),
        isAiGenerated: true,
      },
    })

    console.log(`[SEO Bot] Published: "${post.title}" (${post.slug})`)

    // Auto-inject internal links into this new post
    try {
      const linkResult = await injectInternalLinks(post.id)
      console.log(`[SEO Bot] Injected ${linkResult.linksInjected} internal links`)
    } catch (err) {
      console.error('[SEO Bot] Link injection failed:', err)
    }

    // Also re-link existing posts to link TO this new post
    try {
      await buildInternalLinks()
      console.log('[SEO Bot] Rebuilt internal link network')
    } catch (err) {
      console.error('[SEO Bot] Link rebuild failed:', err)
    }

    // Auto-extract and save new keywords
    try {
      const newKeywords = await extractKeywordsFromContent(blogData.content, blogData.title)
      for (const kw of newKeywords) {
        const existing = await prisma.seoKeyword.findUnique({ where: { keyword: kw } })
        if (!existing) {
          await prisma.seoKeyword.create({
            data: { keyword: kw, linkedPages: [`/blog-post.html?slug=${post.slug}`], autoLinked: true },
          })
        }
      }
      console.log(`[SEO Bot] Added ${newKeywords.length} keywords to tracker`)
    } catch (err) {
      console.error('[SEO Bot] Keyword tracking failed:', err)
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userName: 'SEO Bot',
        userRole: 'admin',
        action: 'create',
        module: 'blog',
        entityType: 'PlatformBlogPost',
        entityId: post.id,
        entityName: post.title,
        description: `Auto-published blog: "${post.title}"`,
      },
    })

    // Notify admins
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'blog_published',
          title: 'New Blog Auto-Published',
          message: `SEO Bot published: "${post.title}"`,
          link: '/website?tab=blog',
        },
      })
    } catch {}

    // Ping Google about sitemap update
    try {
      await pingGoogleSitemap()
    } catch (err) {
      console.error('[SEO Bot] Google ping failed:', err)
    }

    console.log('[SEO Bot] Auto blog writer complete!')
    return { generated: true, title: post.title, slug: post.slug }
  } catch (err) {
    console.error('[SEO Bot] Auto blog writer failed:', err)
    return { generated: false, reason: String(err) }
  }
}

/**
 * Weekly SEO Audit
 * - Runs full audit
 * - Creates notification if score drops below threshold
 * - Logs results
 */
async function weeklySeqAudit() {
  console.log('[SEO Bot] Running weekly SEO audit...')

  try {
    const result = await fullSeoAudit()
    console.log(`[SEO Bot] SEO Score: ${result.score}/100 (Grade: ${result.grade})`)
    console.log(`[SEO Bot] Issues: ${result.issues.length} (${result.issues.filter(i => i.severity === 'critical').length} critical)`)

    // Notify if score is below 60
    if (result.score < 60) {
      await prisma.adminNotification.create({
        data: {
          type: 'alert',
          title: `SEO Score Alert: ${result.grade} (${result.score}/100)`,
          message: `${result.issues.filter(i => i.severity === 'critical').length} critical issues found. ${result.recommendations[0] || ''}`,
          link: '/website?tab=seo',
        },
      })
      console.log('[SEO Bot] Low SEO score alert sent')
    }

    // Store audit result in platform settings for history
    await prisma.platformSettings.upsert({
      where: { key: 'seo.lastAuditScore' },
      update: { value: String(result.score), updatedBy: 'SEO Bot' },
      create: { key: 'seo.lastAuditScore', value: String(result.score), updatedBy: 'SEO Bot' },
    })
    await prisma.platformSettings.upsert({
      where: { key: 'seo.lastAuditDate' },
      update: { value: new Date().toISOString(), updatedBy: 'SEO Bot' },
      create: { key: 'seo.lastAuditDate', value: new Date().toISOString(), updatedBy: 'SEO Bot' },
    })

    return result
  } catch (err) {
    console.error('[SEO Bot] Weekly audit failed:', err)
    return null
  }
}

/**
 * Auto-Link All Published Posts
 * Runs after new content is published to rebuild link network
 */
async function autoLinkAllPosts() {
  console.log('[SEO Bot] Auto-linking all published posts...')

  try {
    const posts = await prisma.platformBlogPost.findMany({
      where: { status: 'published' },
      select: { id: true, title: true },
    })

    let totalLinks = 0
    for (const post of posts) {
      try {
        const result = await injectInternalLinks(post.id)
        totalLinks += result.linksInjected
      } catch {}
    }

    console.log(`[SEO Bot] Injected ${totalLinks} internal links across ${posts.length} posts`)
    return { postsProcessed: posts.length, totalLinks }
  } catch (err) {
    console.error('[SEO Bot] Auto-linking failed:', err)
    return { postsProcessed: 0, totalLinks: 0 }
  }
}

/**
 * Ping Google about sitemap update
 */
async function pingGoogleSitemap() {
  const sitemapUrl = 'https://paperbook.in/sitemap.xml'
  try {
    const response = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    console.log(`[SEO Bot] Google sitemap ping: ${response.status}`)
  } catch (err) {
    console.error('[SEO Bot] Google ping failed:', err)
  }
}

/**
 * Auto Keyword Discovery
 * Analyzes existing content to find underused keywords and adds them to tracker
 */
async function autoKeywordDiscovery() {
  console.log('[SEO Bot] Running keyword discovery...')

  try {
    const posts = await prisma.platformBlogPost.findMany({
      where: { status: 'published' },
      select: { title: true, content: true, keywords: true },
    })

    const existingKeywords = await prisma.seoKeyword.findMany({ select: { keyword: true } })
    const existingSet = new Set(existingKeywords.map(k => k.keyword.toLowerCase()))

    let discovered = 0
    for (const post of posts) {
      const extracted = await extractKeywordsFromContent(post.content, post.title)
      for (const kw of extracted) {
        if (!existingSet.has(kw.toLowerCase()) && kw.length > 3) {
          await prisma.seoKeyword.create({
            data: { keyword: kw, autoLinked: true },
          }).catch(() => {}) // skip duplicates
          existingSet.add(kw.toLowerCase())
          discovered++
        }
      }
    }

    console.log(`[SEO Bot] Discovered ${discovered} new keywords`)
    return { discovered }
  } catch (err) {
    console.error('[SEO Bot] Keyword discovery failed:', err)
    return { discovered: 0 }
  }
}

// ============================================================================
// Scheduler
// ============================================================================

/**
 * Schedule all SEO automation jobs
 */
export function scheduleSeoAutomation() {
  // Weekly blog writer — runs every Monday at 10 AM
  function scheduleWeeklyBlog() {
    const now = new Date()
    const next = new Date(now)
    // Find next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7
    next.setDate(next.getDate() + daysUntilMonday)
    next.setHours(10, 0, 0, 0)
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7)

    const delay = next.getTime() - now.getTime()
    console.log(`[SEO Bot] Next auto-blog in ${Math.round(delay / 3600000)} hours (${next.toLocaleDateString()})`)

    setTimeout(async () => {
      await autoBlogWriter()
      scheduleWeeklyBlog()
    }, delay)
  }

  // Weekly SEO audit — runs every Wednesday at 8 AM
  function scheduleWeeklyAudit() {
    const now = new Date()
    const next = new Date(now)
    const daysUntilWednesday = (10 - now.getDay()) % 7 || 7
    next.setDate(next.getDate() + daysUntilWednesday)
    next.setHours(8, 0, 0, 0)
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7)

    const delay = next.getTime() - now.getTime()

    setTimeout(async () => {
      await weeklySeqAudit()
      await autoKeywordDiscovery()
      await autoLinkAllPosts()
      scheduleWeeklyAudit()
    }, delay)
  }

  scheduleWeeklyBlog()
  scheduleWeeklyAudit()

  // Run initial keyword discovery on startup (after 30s)
  setTimeout(async () => {
    await autoKeywordDiscovery()
  }, 30000)

  console.log('[SEO Bot] Automation scheduled:')
  console.log('  - Auto blog writer: every Monday 10 AM')
  console.log('  - SEO audit + keyword discovery + auto-linking: every Wednesday 8 AM')
}

// Export individual functions for manual triggers
export { autoBlogWriter, weeklySeqAudit, autoLinkAllPosts, autoKeywordDiscovery, pingGoogleSitemap }
