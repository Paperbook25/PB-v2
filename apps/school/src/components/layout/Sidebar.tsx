import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  UsersRound,
  ClipboardCheck,
  CalendarClock,
  IndianRupee,
  Settings,
  BarChart3,
  X,
  MessageCircle,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUIStore } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Role } from '@/types/common.types'
import { useState, useEffect, useCallback } from 'react'

/* ============================================
   Types
   ============================================ */

interface NavChildItem {
  name: string
  href: string
  roles?: Role[]
}

interface NavItem {
  name: string
  shortName?: string
  href: string
  icon: LucideIcon
  roles: Role[]
  children?: NavChildItem[]
  moduleColor?: string
}

/* ============================================
   Navigation Items (preserving all existing)
   ============================================ */

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent'],
    moduleColor: 'var(--color-module-academic)',
  },
  {
    name: 'Admissions',
    shortName: 'Admit',
    href: '/admissions',
    icon: UserPlus,
    roles: ['admin', 'principal'],
    moduleColor: 'var(--color-module-admissions)',
  },
  {
    name: 'People',
    href: '/people',
    icon: UsersRound,
    roles: ['admin', 'principal', 'teacher'],
    moduleColor: 'var(--color-module-students)',
    children: [
      { name: 'Students', href: '/people?tab=students' },
      { name: 'Staff', href: '/people?tab=staff', roles: ['admin', 'principal'] },
      { name: 'Attendance', href: '/people?tab=attendance' },
      { name: 'Behavior', href: '/people?tab=behavior' },
    ],
  },
  {
    name: 'My Attendance',
    shortName: 'Attend',
    href: '/people',
    icon: ClipboardCheck,
    roles: ['student', 'parent'],
    moduleColor: 'var(--color-module-attendance)',
  },
  {
    name: 'Timetable',
    shortName: 'Schedule',
    href: '/calendar',
    icon: CalendarClock,
    roles: ['admin', 'principal', 'teacher'],
    moduleColor: 'var(--color-module-academic)',
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: IndianRupee,
    roles: ['admin', 'principal', 'accountant'],
    moduleColor: 'var(--color-module-finance)',
  },
  {
    name: 'Fees',
    href: '/finance/my-fees',
    icon: IndianRupee,
    roles: ['parent', 'student'],
    moduleColor: 'var(--color-module-finance)',
  },
  {
    name: 'Parent Portal',
    shortName: 'Connect',
    href: '/parent-portal',
    icon: MessageCircle,
    roles: ['parent'],
    moduleColor: 'var(--color-module-parent-portal)',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'principal', 'accountant'],
    moduleColor: 'var(--color-module-reports)',
  },
  {
    name: 'Website',
    shortName: 'Web',
    href: '/school-website',
    icon: Globe,
    roles: ['admin', 'principal'],
    moduleColor: 'var(--color-module-settings)',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'principal', 'teacher'],
    moduleColor: 'var(--color-module-settings)',
    children: [
      { name: 'General', href: '/settings', roles: ['admin', 'principal'] },
      { name: 'Communication', href: '/settings?tab=communication', roles: ['admin', 'principal', 'teacher'] },
      { name: 'Integrations', href: '/settings?tab=integrations', roles: ['admin', 'principal'] },
    ],
  },
]

/* ============================================
   Section grouping: map item names to sections
   ============================================ */

interface SectionDef {
  label: string
  items: string[] // navigation item names belonging to this section
}

const sections: SectionDef[] = [
  { label: 'Main', items: ['Dashboard'] },
  { label: 'Management', items: ['People', 'Admissions'] },
  { label: 'Academics', items: ['My Attendance', 'Timetable'] },
  { label: 'Finance', items: ['Finance', 'Fees'] },
  { label: 'Communication', items: ['Parent Portal', 'Website'] },
  { label: 'System', items: ['Reports', 'Settings'] },
]

function groupNavItems(filteredNav: NavItem[]): { label: string; items: NavItem[] }[] {
  const filteredNames = new Set(filteredNav.map((n) => n.name))
  const grouped: { label: string; items: NavItem[] }[] = []
  const placed = new Set<string>()

  for (const section of sections) {
    const sectionItems: NavItem[] = []
    for (const itemName of section.items) {
      if (filteredNames.has(itemName) && !placed.has(itemName)) {
        const nav = filteredNav.find((n) => n.name === itemName)
        if (nav) {
          sectionItems.push(nav)
          placed.add(itemName)
        }
      }
    }
    if (sectionItems.length > 0) {
      grouped.push({ label: section.label, items: sectionItems })
    }
  }

  // Catch any remaining items not in a section
  const remaining = filteredNav.filter((n) => !placed.has(n.name))
  if (remaining.length > 0) {
    grouped.push({ label: 'Other', items: remaining })
  }

  return grouped
}

/* ============================================
   Expanded Nav Item (icon + text on same line)
   ============================================ */

function ExpandedNavItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const { hasRole } = useAuthStore()
  const [expanded, setExpanded] = useState(false)

  const isActive =
    location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href + '/')) ||
    (item.href !== '/' && (location.pathname + location.search) === item.href)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <Link
        to={hasChildren ? '#' : item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors group',
          isActive
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
        )}
      >
        <item.icon
          className="h-[18px] w-[18px] shrink-0"
          strokeWidth={1.75}
        />
        <span className="flex-1 truncate">{item.name}</span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}
      </Link>

      {/* Accordion children */}
      {hasChildren && expanded && (
        <div className="mt-0.5 ml-[18px] pl-4 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
          {item.children
            ?.filter((child) => !child.roles || hasRole(child.roles))
            .map((child) => {
              const isChildActive =
                location.pathname === child.href ||
                (location.pathname + location.search) === child.href
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    'block px-3 py-1.5 rounded-md text-sm transition-colors',
                    isChildActive
                      ? 'text-indigo-700 font-medium bg-indigo-50/60 dark:text-indigo-300 dark:bg-indigo-500/10'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-white/5'
                  )}
                >
                  {child.name}
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}

/* ============================================
   Collapsed Nav Item (icon only + tooltip)
   ============================================ */

function CollapsedNavItem({ item }: { item: NavItem }) {
  const location = useLocation()

  const isActive =
    location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href + '/')) ||
    (item.href !== '/' && (location.pathname + location.search) === item.href)

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={item.href}
          aria-label={item.name}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-colors mx-auto',
            isActive
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
          )}
        >
          <item.icon className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

/* ============================================
   Mobile Nav Item (accordion)
   ============================================ */

function MobileNavItem({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  const location = useLocation()
  const { hasRole } = useAuthStore()
  const [expanded, setExpanded] = useState(false)

  const isActive =
    location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href + '/'))
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <Link
        to={hasChildren ? '#' : item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault()
            setExpanded(!expanded)
          } else {
            onNavigate()
          }
        }}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        <span className="flex-1">{item.name}</span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}
      </Link>

      {hasChildren && expanded && (
        <div className="ml-[30px] mt-0.5 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-3">
          {item.children
            ?.filter((child) => !child.roles || hasRole(child.roles))
            .map((child) => {
              const isChildActive =
                location.pathname === child.href ||
                (location.pathname + location.search) === child.href
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  onClick={onNavigate}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    isChildActive
                      ? 'text-indigo-700 font-medium bg-indigo-50/60 dark:text-indigo-300 dark:bg-indigo-500/10'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-white/5'
                  )}
                >
                  {child.name}
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}

/* ============================================
   Mobile Drawer
   ============================================ */

function MobileDrawer({ filteredNav }: { filteredNav: NavItem[] }) {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()
  const location = useLocation()

  useEffect(() => {
    setSidebarMobileOpen(false)
  }, [location.pathname, setSidebarMobileOpen])

  const handleClose = useCallback(() => {
    setSidebarMobileOpen(false)
  }, [setSidebarMobileOpen])

  if (!sidebarMobileOpen) return null

  const grouped = groupNavItems(filteredNav)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-gray-50 dark:bg-gray-900 shadow-xl lg:hidden animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
          <Link to="/" className="flex items-center gap-2" onClick={handleClose}>
            <img src="/logo.svg" alt="PaperBook" className="h-7 w-7" />
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">PaperBook</span>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-3rem)]">
          <nav className="px-3 py-3">
            {grouped.map((section) => (
              <div key={section.label} className="mb-3">
                <div className="px-3 mb-1 mt-3 first:mt-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400 dark:text-gray-500">
                    {section.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <MobileNavItem
                      key={item.href + item.name}
                      item={item}
                      onNavigate={handleClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  )
}

/* ============================================
   Main Sidebar Export
   ============================================ */

export function Sidebar() {
  const { hasRole } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const filteredNav = navigation.filter((item) => hasRole(item.roles))
  const grouped = groupNavItems(filteredNav)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:flex',
          'transition-[width] duration-200 ease-in-out'
        )}
        style={{ width: sidebarCollapsed ? 56 : 220 }}
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            'flex h-12 items-center border-b border-gray-200 dark:border-gray-800 shrink-0',
            sidebarCollapsed ? 'justify-center px-2' : 'px-4 gap-2.5'
          )}
        >
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.svg"
              alt="PaperBook"
              className={cn('shrink-0', sidebarCollapsed ? 'h-7 w-7' : 'h-7 w-7')}
            />
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                PaperBook
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className={cn('py-3', sidebarCollapsed ? 'px-1.5' : 'px-2.5')}>
            {sidebarCollapsed ? (
              /* Collapsed: icons only with tooltips, no section headers */
              <div className="flex flex-col gap-1">
                {filteredNav.map((item) => (
                  <CollapsedNavItem key={item.href + item.name} item={item} />
                ))}
              </div>
            ) : (
              /* Expanded: grouped with section headers */
              grouped.map((section) => (
                <div key={section.label} className="mb-2">
                  <div className="px-3 mb-1 mt-3 first:mt-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400 dark:text-gray-500 select-none">
                      {section.label}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <ExpandedNavItem key={item.href + item.name} item={item} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </nav>
        </ScrollArea>

        {/* Collapse toggle button at bottom */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-white/5 transition-colors',
              sidebarCollapsed ? 'w-10 h-9 mx-auto' : 'w-full h-9 gap-2 px-3'
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer filteredNav={filteredNav} />
    </>
  )
}
