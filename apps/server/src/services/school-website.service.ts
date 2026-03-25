import { prisma } from '../config/db.js'
import type {
  CreatePageInput, UpdatePageInput,
  CreateSectionInput, UpdateSectionInput, ReorderSectionsInput,
  UpdateSettingsInput, UploadMediaInput,
} from '../validators/school-website.validators.js'

// ==================== Pages ====================

export async function listPages(schoolId: string) {
  return prisma.websitePage.findMany({
    where: { organizationId: schoolId },
    orderBy: { sortOrder: 'asc' },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function getPageById(schoolId: string, id: string) {
  const page = await prisma.websitePage.findFirst({
    where: { id, organizationId: schoolId },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!page) throw new Error('Page not found')
  return page
}

export async function getPublishedPageBySlug(schoolId: string, slug: string) {
  const page = await prisma.websitePage.findFirst({
    where: { slug, organizationId: schoolId },
    include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } },
  })
  if (!page || !page.isPublished) throw new Error('Page not found')
  return page
}

export async function listPublishedPages(schoolId: string) {
  return prisma.websitePage.findMany({
    where: { organizationId: schoolId, isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, title: true, sortOrder: true },
  })
}

export async function createPage(schoolId: string, input: CreatePageInput) {
  return prisma.websitePage.create({
    data: {
      organizationId: schoolId,
      slug: input.slug,
      title: input.title,
      sortOrder: input.sortOrder ?? 0,
    },
  })
}

export async function updatePage(schoolId: string, id: string, input: UpdatePageInput) {
  const existing = await prisma.websitePage.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw new Error('Page not found')
  return prisma.websitePage.update({
    where: { id },
    data: input,
  })
}

export async function deletePage(schoolId: string, id: string) {
  const existing = await prisma.websitePage.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw new Error('Page not found')
  await prisma.websitePage.delete({ where: { id } })
  return { success: true }
}

export async function publishPage(schoolId: string, id: string) {
  const existing = await prisma.websitePage.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw new Error('Page not found')
  return prisma.websitePage.update({
    where: { id },
    data: { isPublished: true },
  })
}

export async function unpublishPage(schoolId: string, id: string) {
  const existing = await prisma.websitePage.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw new Error('Page not found')
  return prisma.websitePage.update({
    where: { id },
    data: { isPublished: false },
  })
}

// ==================== Sections ====================

export async function addSection(schoolId: string, pageId: string, input: CreateSectionInput) {
  // Verify the page belongs to this school
  const page = await prisma.websitePage.findFirst({ where: { id: pageId, organizationId: schoolId } })
  if (!page) throw new Error('Page not found')

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

export async function updateSection(schoolId: string, id: string, input: UpdateSectionInput) {
  // Verify the section belongs to a page owned by this school
  const section = await prisma.websiteSection.findFirst({
    where: { id, page: { organizationId: schoolId } },
  })
  if (!section) throw new Error('Section not found')

  return prisma.websiteSection.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content as any }),
      ...(input.isVisible !== undefined && { isVisible: input.isVisible }),
    },
  })
}

export async function deleteSection(schoolId: string, id: string) {
  const section = await prisma.websiteSection.findFirst({
    where: { id, page: { organizationId: schoolId } },
  })
  if (!section) throw new Error('Section not found')

  await prisma.websiteSection.delete({ where: { id } })
  return { success: true }
}

export async function reorderSections(schoolId: string, pageId: string, input: ReorderSectionsInput) {
  // Verify the page belongs to this school
  const page = await prisma.websitePage.findFirst({ where: { id: pageId, organizationId: schoolId } })
  if (!page) throw new Error('Page not found')

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

export async function getSettings(schoolId: string) {
  let settings = await prisma.websiteSettings.findFirst({ where: { organizationId: schoolId } })
  if (!settings) {
    settings = await prisma.websiteSettings.create({ data: { organizationId: schoolId } })
  }
  return settings
}

export async function updateSettings(schoolId: string, input: UpdateSettingsInput) {
  const existing = await prisma.websiteSettings.findFirst({ where: { organizationId: schoolId } })
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
      organizationId: schoolId,
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

export async function listMedia(schoolId: string) {
  return prisma.websiteMedia.findMany({
    where: { organizationId: schoolId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function uploadMedia(schoolId: string, input: UploadMediaInput) {
  return prisma.websiteMedia.create({
    data: {
      organizationId: schoolId,
      fileName: input.fileName,
      url: input.url,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      altText: input.altText,
    },
  })
}

export async function deleteMedia(schoolId: string, id: string) {
  const existing = await prisma.websiteMedia.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw new Error('Media not found')
  await prisma.websiteMedia.delete({ where: { id } })
  return { success: true }
}

// ==================== Dynamic Data Fetchers ====================

export async function fetchEventsData(schoolId: string, showCount = 5, showPast = false) {
  try {
    const now = new Date()
    const events = await prisma.calendarEvent.findMany({
      where: showPast ? { organizationId: schoolId } : { organizationId: schoolId, startDate: { gte: now } },
      orderBy: { startDate: 'asc' },
      take: showCount,
      select: { id: true, title: true, description: true, startDate: true, endDate: true, type: true },
    })
    return events
  } catch {
    return []
  }
}

export async function fetchFacultyData(schoolId: string) {
  try {
    const staff = await prisma.staff.findMany({
      where: { organizationId: schoolId, status: 'active' },
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

export async function fetchSchoolProfile(schoolId: string) {
  try {
    const profile = await prisma.schoolProfile.findFirst({ where: { organizationId: schoolId } })
    return profile
  } catch {
    return null
  }
}
