import { prisma } from '../config/db.js'

// All available addons with their definitions
const ADDON_DEFINITIONS = [
  // Addon modules (can be toggled)
  { slug: 'library', name: 'Library', description: 'Book management, issuing, returns, and digital library', icon: 'BookOpen', category: 'academic', isCore: false, sortOrder: 1 },
  { slug: 'lms', name: 'LMS', description: 'Learning management with courses, assignments, and live classes', icon: 'GraduationCap', category: 'academic', isCore: false, sortOrder: 2 },
  { slug: 'exams', name: 'Exams', description: 'Exam scheduling, marks entry, grade scales, and report cards', icon: 'ClipboardCheck', category: 'academic', isCore: false, sortOrder: 3 },
  { slug: 'transport', name: 'Transport', description: 'Vehicle management, routes, drivers, and live tracking', icon: 'Bus', category: 'operations', isCore: false, sortOrder: 4 },
  { slug: 'hostel', name: 'Hostel', description: 'Room allocation, mess management, and hostel attendance', icon: 'Building2', category: 'operations', isCore: false, sortOrder: 5 },
  { slug: 'operations', name: 'Operations', description: 'Inventory, assets, and facility management', icon: 'Warehouse', category: 'operations', isCore: false, sortOrder: 6 },
  { slug: 'documents', name: 'Documents', description: 'Document storage, folders, and file management', icon: 'FolderOpen', category: 'operations', isCore: false, sortOrder: 7 },
  { slug: 'clubs', name: 'Clubs', description: 'Extracurricular clubs and activity management', icon: 'Trophy', category: 'extras', isCore: false, sortOrder: 8 },
  { slug: 'alumni', name: 'Alumni', description: 'Alumni network and engagement tracking', icon: 'Users', category: 'extras', isCore: false, sortOrder: 9 },
  { slug: 'scholarships', name: 'Scholarships', description: 'Scholarship programs and applications', icon: 'Award', category: 'extras', isCore: false, sortOrder: 10 },
  { slug: 'complaints', name: 'Complaints', description: 'Complaint tracking and resolution', icon: 'MessageSquareWarning', category: 'communication', isCore: false, sortOrder: 11 },
  { slug: 'visitors', name: 'Visitors', description: 'Visitor management and gate passes', icon: 'UserCheck', category: 'communication', isCore: false, sortOrder: 12 },
  { slug: 'school-website', name: 'School Website', description: 'Public-facing school website builder with customizable sections and AI content generation', icon: 'Globe', category: 'communication', isCore: false, sortOrder: 13 },
]

export async function seedAddons() {
  for (const def of ADDON_DEFINITIONS) {
    await prisma.addon.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description, icon: def.icon, category: def.category, isCore: def.isCore, sortOrder: def.sortOrder },
      create: def,
    })
  }
}

export async function listAddons(schoolId: string) {
  const addons = await prisma.addon.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      schoolAddons: {
        where: { schoolId },
        select: { enabled: true, enabledAt: true },
      },
    },
  })

  return addons.map(addon => ({
    id: addon.id,
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    icon: addon.icon,
    category: addon.category,
    isCore: addon.isCore,
    sortOrder: addon.sortOrder,
    enabled: addon.schoolAddons.length > 0 ? addon.schoolAddons[0].enabled : false,
    enabledAt: addon.schoolAddons.length > 0 ? addon.schoolAddons[0].enabledAt : null,
  }))
}

export async function toggleAddon(schoolId: string, slug: string, enabled: boolean, userId: string) {
  const addon = await prisma.addon.findUnique({ where: { slug } })
  if (!addon) throw new Error(`Addon not found: ${slug}`)
  if (addon.isCore) throw new Error(`Cannot toggle core module: ${slug}`)

  await prisma.schoolAddon.upsert({
    where: { schoolId_addonId: { schoolId, addonId: addon.id } },
    update: { enabled, enabledBy: userId },
    create: { schoolId, addonId: addon.id, enabled, enabledBy: userId },
  })

  return { slug, enabled }
}

export async function getEnabledAddonSlugs(schoolId: string): Promise<string[]> {
  const schoolAddons = await prisma.schoolAddon.findMany({
    where: { schoolId, enabled: true },
    include: { addon: { select: { slug: true } } },
  })
  return schoolAddons.map(sa => sa.addon.slug)
}
