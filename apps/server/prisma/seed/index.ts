import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()

const SUPER_ADMIN_EMAIL = 'admin@paperbook.app'
const SUPER_ADMIN_PASSWORD = 'Admin@123'
const SUPER_ADMIN_NAME = 'Super Admin'

// ============================================================================
// Addon catalog — these are the available modules schools can enable
// ============================================================================

const ADDON_DEFINITIONS = [
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
  { slug: 'school-website', name: 'School Website', description: 'Public-facing school website builder', icon: 'Globe', category: 'communication', isCore: false, sortOrder: 13 },
]

async function main() {
  console.log('[Seed] Starting clean database seed...\n')

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Create super admin in better-auth user table
  // ──────────────────────────────────────────────────────────────────────────

  const existingSuperAdmin = await prisma.betterAuthUser.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  })

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.betterAuthUser.create({
      data: {
        id: crypto.randomUUID(),
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        emailVerified: true,
        role: 'admin', // super admin role for better-auth admin plugin
      },
    })

    // Create account record for email/password auth (use better-auth's scrypt hashing)
    const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD)
    await prisma.betterAuthAccount.create({
      data: {
        id: crypto.randomUUID(),
        accountId: superAdmin.id,
        providerId: 'credential',
        userId: superAdmin.id,
        password: hashedPassword,
      },
    })

    console.log(`[Seed] Created super admin: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`)
  } else {
    console.log(`[Seed] Super admin already exists: ${SUPER_ADMIN_EMAIL}`)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Seed addon catalog
  // ──────────────────────────────────────────────────────────────────────────

  for (const def of ADDON_DEFINITIONS) {
    await prisma.addon.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        isCore: def.isCore,
        sortOrder: def.sortOrder,
      },
      create: def,
    })
  }

  console.log(`[Seed] Seeded ${ADDON_DEFINITIONS.length} addons`)

  // ──────────────────────────────────────────────────────────────────────────
  // Done
  // ──────────────────────────────────────────────────────────────────────────

  console.log('\n[Seed] Done! You can now:')
  console.log(`  1. Login to admin portal at http://localhost:5174 with ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`)
  console.log('  2. Create a school from the admin dashboard')
  console.log('  3. Access the school at http://<slug>.paperbook.local:5173')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('[Seed] Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
