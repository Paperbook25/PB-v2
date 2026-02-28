import { prisma } from '../config/db.js'
import type {
  CreatePageInput, UpdatePageInput,
  CreateSectionInput, UpdateSectionInput, ReorderSectionsInput,
  UpdateSettingsInput, UploadMediaInput,
} from '../validators/school-website.validators.js'

// ==================== Pages ====================

export async function listPages() {
  return prisma.websitePage.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function getPageById(id: string) {
  const page = await prisma.websitePage.findUnique({
    where: { id },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!page) throw new Error('Page not found')
  return page
}

export async function getPublishedPageBySlug(slug: string) {
  const page = await prisma.websitePage.findUnique({
    where: { slug },
    include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!page || !page.isPublished) throw new Error('Page not found')
  return page
}

export async function listPublishedPages() {
  return prisma.websitePage.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, title: true, sortOrder: true },
  })
}

export async function createPage(input: CreatePageInput) {
  return prisma.websitePage.create({
    data: {
      slug: input.slug,
      title: input.title,
      sortOrder: input.sortOrder ?? 0,
    },
  })
}

export async function updatePage(id: string, input: UpdatePageInput) {
  return prisma.websitePage.update({
    where: { id },
    data: input,
  })
}

export async function deletePage(id: string) {
  await prisma.websitePage.delete({ where: { id } })
  return { success: true }
}

export async function publishPage(id: string) {
  return prisma.websitePage.update({
    where: { id },
    data: { isPublished: true },
  })
}

export async function unpublishPage(id: string) {
  return prisma.websitePage.update({
    where: { id },
    data: { isPublished: false },
  })
}

// ==================== Sections ====================

export async function addSection(pageId: string, input: CreateSectionInput) {
  // Auto-set sortOrder if not provided
  const maxSort = await prisma.websiteSection.aggregate({
    where: { pageId },
    _max: { sortOrder: true },
  })
  const sortOrder = input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1

  return prisma.websiteSection.create({
    data: {
      pageId,
      type: input.type,
      title: input.title,
      content: input.content as any,
      sortOrder,
    },
  })
}

export async function updateSection(id: string, input: UpdateSectionInput) {
  return prisma.websiteSection.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content as any }),
      ...(input.isVisible !== undefined && { isVisible: input.isVisible }),
    },
  })
}

export async function deleteSection(id: string) {
  await prisma.websiteSection.delete({ where: { id } })
  return { success: true }
}

export async function reorderSections(pageId: string, input: ReorderSectionsInput) {
  await prisma.$transaction(
    input.sections.map(({ id, sortOrder }) =>
      prisma.websiteSection.update({
        where: { id },
        data: { sortOrder },
      })
    )
  )
  return { success: true }
}

// ==================== Settings ====================

export async function getSettings() {
  let settings = await prisma.websiteSettings.findFirst()
  if (!settings) {
    settings = await prisma.websiteSettings.create({ data: {} })
  }
  return settings
}

export async function updateSettings(input: UpdateSettingsInput) {
  const existing = await prisma.websiteSettings.findFirst()
  if (existing) {
    return prisma.websiteSettings.update({
      where: { id: existing.id },
      data: {
        ...(input.template !== undefined && { template: input.template }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.accentColor !== undefined && { accentColor: input.accentColor }),
        ...(input.fontFamily !== undefined && { fontFamily: input.fontFamily }),
        ...(input.customDomain !== undefined && { customDomain: input.customDomain }),
        ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
        ...(input.metaDescription !== undefined && { metaDescription: input.metaDescription }),
        ...(input.socialLinks !== undefined && { socialLinks: input.socialLinks as any }),
        ...(input.headerHtml !== undefined && { headerHtml: input.headerHtml }),
        ...(input.footerHtml !== undefined && { footerHtml: input.footerHtml }),
      },
    })
  }
  return prisma.websiteSettings.create({
    data: {
      template: input.template ?? 'classic',
      primaryColor: input.primaryColor ?? '#1e40af',
      accentColor: input.accentColor ?? '#f59e0b',
      fontFamily: input.fontFamily ?? 'Inter',
      customDomain: input.customDomain ?? null,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      socialLinks: (input.socialLinks as any) ?? {},
      headerHtml: input.headerHtml ?? null,
      footerHtml: input.footerHtml ?? null,
    },
  })
}

// ==================== Media ====================

export async function listMedia() {
  return prisma.websiteMedia.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function uploadMedia(input: UploadMediaInput) {
  return prisma.websiteMedia.create({
    data: {
      fileName: input.fileName,
      url: input.url,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      altText: input.altText,
    },
  })
}

export async function deleteMedia(id: string) {
  await prisma.websiteMedia.delete({ where: { id } })
  return { success: true }
}

// ==================== Dynamic Data Fetchers ====================

export async function fetchEventsData(showCount = 5, showPast = false) {
  try {
    const now = new Date()
    const events = await prisma.calendarEvent.findMany({
      where: showPast ? {} : { startDate: { gte: now } },
      orderBy: { startDate: 'asc' },
      take: showCount,
      select: { id: true, title: true, description: true, startDate: true, endDate: true, type: true },
    })
    return events
  } catch {
    return []
  }
}

export async function fetchFacultyData() {
  try {
    const staff = await prisma.staff.findMany({
      where: { status: 'active' },
      select: { id: true, firstName: true, lastName: true, designation: true, specialization: true, photoUrl: true },
      orderBy: { firstName: 'asc' },
    })
    return staff.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      designation: s.designation,
      specialization: s.specialization,
      photoUrl: s.photoUrl,
    }))
  } catch {
    return []
  }
}

export async function fetchSchoolProfile() {
  try {
    const profile = await prisma.schoolProfile.findFirst()
    return profile
  } catch {
    return null
  }
}
