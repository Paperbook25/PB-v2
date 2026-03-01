import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Warehouse,
  FolderOpen,
  Trophy,
  Users,
  Award,
  MessageSquareWarning,
  UserCheck,
  LayoutGrid,
  LayoutDashboard,
  UserPlus,
  UsersRound,
  CalendarClock,
  IndianRupee,
  MessageCircle,
  BarChart3,
  Globe,
  Settings,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useAddonStore, type AddonInfo } from '@/stores/useAddonStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/common.types'

/* ============================================
   Icon mapping: addon icon field -> component
   ============================================ */

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Warehouse,
  FolderOpen,
  Trophy,
  Users,
  Award,
  MessageSquareWarning,
  UserCheck,
}

/* ============================================
   Route mapping: addon slug -> route path
   ============================================ */

const ROUTE_MAP: Record<string, string> = {
  library: '/library',
  lms: '/lms',
  exams: '/exams',
  transport: '/transport',
  hostel: '/hostel',
  operations: '/operations',
  documents: '/documents',
  clubs: '/clubs',
  alumni: '/alumni',
  scholarships: '/scholarships',
  complaints: '/complaints',
  visitors: '/visitors',
}

/* ============================================
   Core apps: always-visible, role-filtered
   ============================================ */

interface CoreApp {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  roles: Role[]
}

const CORE_APPS: CoreApp[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent'],
  },
  {
    name: 'People',
    href: '/people',
    icon: UsersRound,
    roles: ['admin', 'principal', 'teacher'],
  },
  {
    name: 'Admissions',
    href: '/admissions',
    icon: UserPlus,
    roles: ['admin', 'principal'],
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: IndianRupee,
    roles: ['admin', 'principal', 'accountant'],
  },
  {
    name: 'Fees',
    href: '/finance/my-fees',
    icon: IndianRupee,
    roles: ['parent', 'student'],
  },
  {
    name: 'Timetable',
    href: '/calendar',
    icon: CalendarClock,
    roles: ['admin', 'principal', 'teacher'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'principal', 'accountant'],
  },
  {
    name: 'Parent Portal',
    href: '/parent-portal',
    icon: MessageCircle,
    roles: ['parent'],
  },
  {
    name: 'Website',
    href: '/school-website',
    icon: Globe,
    roles: ['admin', 'principal'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'principal', 'teacher'],
  },
]

/* ============================================
   Category display order and labels
   ============================================ */

const CATEGORY_ORDER = ['academic', 'operations', 'communication', 'extras']

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  operations: 'Operations',
  communication: 'Communication',
  extras: 'Extras',
}

/* ============================================
   Group addons by category
   ============================================ */

function groupByCategory(addons: AddonInfo[]): { category: string; label: string; items: AddonInfo[] }[] {
  const grouped: Record<string, AddonInfo[]> = {}

  for (const addon of addons) {
    const cat = addon.category.toLowerCase()
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(addon)
  }

  const result: { category: string; label: string; items: AddonInfo[] }[] = []

  for (const cat of CATEGORY_ORDER) {
    if (grouped[cat] && grouped[cat].length > 0) {
      result.push({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
        items: grouped[cat].sort((a, b) => a.sortOrder - b.sortOrder),
      })
    }
  }

  // Include any categories not in the predefined order
  for (const cat of Object.keys(grouped)) {
    if (!CATEGORY_ORDER.includes(cat) && grouped[cat].length > 0) {
      result.push({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
        items: grouped[cat].sort((a, b) => a.sortOrder - b.sortOrder),
      })
    }
  }

  return result
}

/* ============================================
   Check if a route is active
   ============================================ */

function isRouteActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

/* ============================================
   AppLauncher Component
   ============================================ */

export function AppLauncher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { hasRole } = useAuthStore()
  const addons = useAddonStore((state) => state.addons)
  const enabledSlugs = useAddonStore((state) => state.enabledSlugs)

  const enabledAddons = addons.filter((a) => enabledSlugs.includes(a.slug))
  const categories = groupByCategory(enabledAddons)
  const filteredCoreApps = CORE_APPS.filter((app) => hasRole(app.roles))

  const handleTileClick = (route: string) => {
    navigate(route)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="App Launcher"
        >
          <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        {/* Core apps section */}
        {filteredCoreApps.length > 0 && (
          <div className="p-3 pb-2">
            <div className="grid grid-cols-4 gap-1">
              {filteredCoreApps.map((app) => {
                const active = isRouteActive(app.href, location.pathname)
                return (
                  <button
                    key={app.href}
                    onClick={() => handleTileClick(app.href)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors',
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-500/15'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      active
                        ? 'bg-indigo-100 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}>
                      <app.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </div>
                    <span className={cn(
                      'text-[11px] text-center leading-tight truncate w-full',
                      active
                        ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {app.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Divider between core and addons */}
        {filteredCoreApps.length > 0 && categories.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700" />
        )}

        {/* Addon modules section */}
        {categories.length > 0 && (
          <div className="p-3 pt-2">
            {categories.map((group) => (
              <div key={group.category}>
                {/* Category label */}
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1.5 mt-2 first:mt-0">
                  {group.label}
                </div>

                {/* Tile grid: 4 columns */}
                <div className="grid grid-cols-4 gap-1">
                  {group.items.map((addon) => {
                    const IconComponent = addon.icon ? ICON_MAP[addon.icon] : null
                    const route = ROUTE_MAP[addon.slug]
                    const active = route ? isRouteActive(route, location.pathname) : false
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleTileClick(route || '/')}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors',
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-500/15'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          active
                            ? 'bg-indigo-100 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        )}>
                          {IconComponent ? (
                            <IconComponent className="h-[18px] w-[18px]" strokeWidth={1.75} />
                          ) : (
                            <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.75} />
                          )}
                        </div>
                        <span className={cn(
                          'text-[11px] text-center leading-tight truncate w-full',
                          active
                            ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        )}>
                          {addon.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state only if nothing at all */}
        {filteredCoreApps.length === 0 && categories.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-400">
            No apps available
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
