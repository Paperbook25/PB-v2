import { prisma } from '../config/db.js'

// Default settings
const DEFAULTS: Record<string, string> = {
  'platform.name': 'PaperBook',
  'platform.logo': '',
  'platform.primaryColor': '#6366f1',
  'platform.supportEmail': 'support@paperbook.app',
  'branding.loginTitle': 'Welcome to PaperBook',
  'branding.loginSubtitle': 'School Management Platform',
  'branding.emailFooter': 'PaperBook - School Management Platform',
  'trial.defaultDuration': '14',
  'trial.defaultPlan': 'professional',
  'security.minPasswordLength': '8',
  'security.sessionTimeoutHours': '168',
  'security.require2FA': 'false',
  'security.maxLoginAttempts': '5',
}

/**
 * Get all platform settings with defaults.
 */
export async function getAllSettings() {
  const dbSettings = await prisma.platformSettings.findMany()
  const settingsMap = new Map(dbSettings.map(s => [s.key, s.value]))

  const result: Record<string, string> = {}
  for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
    result[key] = settingsMap.get(key) || defaultValue
  }

  // Include any extra settings not in defaults
  for (const s of dbSettings) {
    if (!result[s.key]) result[s.key] = s.value
  }

  return result
}

/**
 * Get a single setting.
 */
export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.platformSettings.findUnique({ where: { key } })
  return setting?.value || DEFAULTS[key] || ''
}

/**
 * Update a single setting.
 */
export async function updateSetting(key: string, value: string, updatedBy?: string) {
  return prisma.platformSettings.upsert({
    where: { key },
    update: { value, updatedBy },
    create: { key, value, updatedBy },
  })
}

/**
 * Update multiple settings at once.
 */
export async function updateSettings(settings: Record<string, string>, updatedBy?: string) {
  const operations = Object.entries(settings).map(([key, value]) =>
    prisma.platformSettings.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy },
    })
  )

  await Promise.all(operations)

  // Audit log
  await prisma.auditLog.create({
    data: {
      userName: updatedBy || 'System',
      userRole: 'admin',
      action: 'update',
      module: 'settings',
      entityType: 'PlatformSettings',
      entityId: 'platform',
      description: `Platform settings updated: ${Object.keys(settings).join(', ')}`,
      changes: JSON.stringify(settings),
    },
  })

  return getAllSettings()
}

/**
 * Get branding config for the school app (public endpoint).
 */
export async function getBrandingConfig() {
  const settings = await getAllSettings()
  return {
    name: settings['platform.name'],
    logo: settings['platform.logo'],
    primaryColor: settings['platform.primaryColor'],
    loginTitle: settings['branding.loginTitle'],
    loginSubtitle: settings['branding.loginSubtitle'],
    supportEmail: settings['platform.supportEmail'],
  }
}
