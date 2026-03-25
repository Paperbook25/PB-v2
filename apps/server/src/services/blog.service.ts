import { prisma } from '../config/db.js'
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  ListBlogPostsInput,
} from '../validators/blog.validators.js'

// ==================== Slug Generation ====================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ==================== Admin: List Posts ====================

export async function listPosts(schoolId: string, query: ListBlogPostsInput) {
  const { page, limit, status, category, search } = query
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (status) where.status = status
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where: where as any }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ==================== Admin: Get Single Post ====================

export async function getPostById(schoolId: string, id: string) {
  const post = await prisma.blogPost.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!post) throw new Error('Blog post not found')
  return post
}

// ==================== Public: Get by Slug ====================

export async function getPublishedPostBySlug(schoolId: string, slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, organizationId: schoolId, status: 'published' },
  })
  if (!post) throw new Error('Blog post not found')

  // Increment view count (fire and forget)
  prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  return post
}

// ==================== Public: List Published ====================

export async function listPublishedPosts(schoolId: string, query: { page?: number; limit?: number; category?: string }) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    organizationId: schoolId,
    status: 'published',
  }
  if (query.category) where.category = query.category

  const [data, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: where as any,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        authorName: true,
        category: true,
        tags: true,
        publishedAt: true,
        viewCount: true,
      },
    }),
    prisma.blogPost.count({ where: where as any }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ==================== Create Post ====================

export async function createPost(
  schoolId: string,
  input: CreateBlogPostInput,
  authorInfo: { id?: string; name: string }
) {
  let slug = generateSlug(input.title)

  // Ensure slug uniqueness within the organization
  const existing = await prisma.blogPost.findFirst({
    where: { organizationId: schoolId, slug },
  })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  return prisma.blogPost.create({
    data: {
      organizationId: schoolId,
      slug,
      title: input.title,
      body: input.body,
      excerpt: input.excerpt ?? null,
      coverImage: input.coverImage ?? null,
      category: input.category ?? null,
      tags: input.tags ?? [],
      status: input.status ?? 'draft',
      authorId: authorInfo.id ?? null,
      authorName: authorInfo.name,
    },
  })
}

// ==================== Update Post ====================

export async function updatePost(schoolId: string, id: string, input: UpdateBlogPostInput) {
  const existing = await prisma.blogPost.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Blog post not found')

  // If title changed, regenerate slug
  let slug = existing.slug
  if (input.title && input.title !== existing.title) {
    slug = generateSlug(input.title)
    const conflict = await prisma.blogPost.findFirst({
      where: { organizationId: schoolId, slug, id: { not: id } },
    })
    if (conflict) {
      slug = `${slug}-${Date.now().toString(36)}`
    }
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title, slug }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
      ...(input.metaDescription !== undefined && { metaDescription: input.metaDescription }),
      ...(input.ogImage !== undefined && { ogImage: input.ogImage }),
    },
  })
}

// ==================== Publish Post ====================

export async function publishPost(schoolId: string, id: string) {
  const post = await prisma.blogPost.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!post) throw new Error('Blog post not found')

  // Fetch school name for SEO
  let schoolName = 'Our School'
  try {
    const profile = await prisma.schoolProfile.findFirst({ where: { id: schoolId } })
    if (profile?.name) schoolName = profile.name
  } catch { /* use default */ }

  const plainBody = stripHtmlTags(post.body)
  const autoExcerpt = post.excerpt || plainBody.slice(0, 155)

  const metaTitle = post.metaTitle || `${post.title} | ${schoolName}`
  const metaDescription = post.metaDescription || autoExcerpt.slice(0, 155)
  const ogImage = post.ogImage || post.coverImage || null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    ...(ogImage ? { image: ogImage } : {}),
    description: metaDescription,
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date(),
      metaTitle,
      metaDescription,
      ogImage,
      jsonLd,
    },
  })
}

// ==================== Unpublish Post ====================

export async function unpublishPost(schoolId: string, id: string) {
  const existing = await prisma.blogPost.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Blog post not found')

  return prisma.blogPost.update({
    where: { id },
    data: { status: 'draft' },
  })
}

// ==================== Delete Post ====================

export async function deletePost(schoolId: string, id: string) {
  const existing = await prisma.blogPost.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Blog post not found')

  await prisma.blogPost.delete({ where: { id } })
  return { success: true }
}

// ==================== Get Categories ====================

export async function getCategories(schoolId: string) {
  const posts = await prisma.blogPost.findMany({
    where: { organizationId: schoolId, category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  return posts.map(p => p.category).filter(Boolean)
}
