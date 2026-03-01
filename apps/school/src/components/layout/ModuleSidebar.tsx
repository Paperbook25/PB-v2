import { Link, useLocation } from 'react-router-dom'
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUIStore } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  getModuleFromPath,
  isNavEntryActive,
  HOME_NAV,
  type ModuleNavLeafItem,
  type ModuleNavGroup,
  type ModuleNavEntry,
  type ModuleNavConfig,
} from '@/config/module-nav'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Role } from '@/types/common.types'

/* ============================================
   Active-state matching helper
   ============================================ */

function useIsLeafActive(href: string, isHome?: boolean): boolean {
  const location = useLocation()
  const currentUrl = location.pathname + location.search

  if (isHome) {
    return location.pathname === href && !location.search
  }

  // Exact match
  if (currentUrl === href) return true

  // For hrefs without ?, match pathname only when no search
  if (!href.includes('?')) {
    return location.pathname === href && !location.search
  }

  // For hrefs with query params, check all params are present
  const [hrefPath, hrefSearch] = href.split('?')
  if (location.pathname !== hrefPath) return false
  if (!location.search) return false

  const hrefParams = new URLSearchParams(hrefSearch)
  const currentParams = new URLSearchParams(location.search.slice(1))

  for (const [key, val] of hrefParams.entries()) {
    if (currentParams.get(key) !== val) return false
  }
  return true
}

/* ============================================
   Expanded Leaf Item — WorkOS style
   ============================================ */

function ExpandedLeafItem({ item, isHome, indented }: { item: ModuleNavLeafItem; isHome?: boolean; indented?: boolean }) {
  const isActive = useIsLeafActive(item.href, isHome)

  return (
    <Link
      to={item.href}
      className={cn(
        'relative flex items-center gap-2 px-2 py-[7px] rounded-md',
        'text-[13px] font-medium transition-colors duration-150',
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200',
        indented && 'ml-4 pl-3',
      )}
    >
      {/* Left active indicator pill */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
      )}
      {item.icon && (
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-400 dark:text-gray-500'
          )}
          strokeWidth={1.5}
        />
      )}
      <span className="flex-1 truncate">{item.name}</span>
    </Link>
  )
}

/* ============================================
   Expanded Nav Group — Accordion with chevron
   ============================================ */

function ExpandedNavGroup({ group, isHome }: { group: ModuleNavGroup; isHome?: boolean }) {
  const location = useLocation()
  const currentUrl = location.pathname + location.search
  const groupIsActive = isNavEntryActive(group, currentUrl)

  const [expanded, setExpanded] = useState(groupIsActive)
  const prevActiveRef = useRef(groupIsActive)

  // Auto-expand when user navigates into this group
  useEffect(() => {
    if (groupIsActive && !prevActiveRef.current) {
      setExpanded(true)
    }
    prevActiveRef.current = groupIsActive
  }, [groupIsActive])

  return (
    <div>
      {/* Group header — clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center justify-between w-full',
          'px-2 py-1.5 mt-3 first:mt-0 rounded-md',
          'text-[11px] font-semibold uppercase tracking-wider',
          'text-gray-400 dark:text-gray-500',
          'hover:text-gray-600 dark:hover:text-gray-400',
          'cursor-pointer select-none transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
        )}
      >
        <div className="flex items-center gap-2">
          <group.icon
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              groupIsActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            )}
            strokeWidth={1.5}
          />
          <span>{group.name}</span>
        </div>
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500',
            'transition-transform duration-150 ease-in-out',
            expanded && 'rotate-90',
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* Children — animated accordion */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-0.5 ml-[13px] pl-3 border-l border-gray-200 dark:border-gray-700/50 space-y-0.5">
            {group.children.map((child) => (
              <ExpandedLeafItem key={child.href} item={child} isHome={isHome} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Collapsed Leaf Item (icon + tooltip)
   ============================================ */

function CollapsedLeafItem({ item, isHome }: { item: ModuleNavLeafItem; isHome?: boolean }) {
  const isActive = useIsLeafActive(item.href, isHome)

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={item.href}
          aria-label={item.name}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150 mx-auto',
            isActive
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300'
          )}
        >
          {item.icon && <item.icon className="h-5 w-5" strokeWidth={1.5} />}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

/* ============================================
   Collapsed Nav Group — Icon + Popover flyout
   ============================================ */

function CollapsedNavGroup({ group }: { group: ModuleNavGroup }) {
  const location = useLocation()
  const currentUrl = location.pathname + location.search
  const groupIsActive = isNavEntryActive(group, currentUrl)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={group.name}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150 mx-auto',
            groupIsActive
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300'
          )}
        >
          <group.icon className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={8}
        align="start"
        className="w-48 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
          {group.name}
        </div>
        <div className="py-1">
          {group.children.map((child) => (
            <PopoverNavItem key={child.href} item={child} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PopoverNavItem({ item }: { item: ModuleNavLeafItem }) {
  const isActive = useIsLeafActive(item.href)

  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-2 px-3 py-[6px] mx-1 rounded-md',
        'text-[13px] font-medium transition-colors duration-100',
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
      )}
    >
      {item.icon && (
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          )}
          strokeWidth={1.5}
        />
      )}
      <span className="truncate">{item.name}</span>
    </Link>
  )
}

/* ============================================
   Mobile Leaf Item
   ============================================ */

function MobileLeafItem({
  item,
  isHome,
  indented,
  onNavigate,
}: {
  item: ModuleNavLeafItem
  isHome?: boolean
  indented?: boolean
  onNavigate: () => void
}) {
  const isActive = useIsLeafActive(item.href, isHome)

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'relative flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
        indented && 'ml-4 pl-3',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
      )}
      {item.icon && (
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          )}
          strokeWidth={1.5}
        />
      )}
      <span className="flex-1">{item.name}</span>
    </Link>
  )
}

/* ============================================
   Mobile Nav Group — Accordion in drawer
   ============================================ */

function MobileNavGroup({ group, onNavigate }: { group: ModuleNavGroup; onNavigate: () => void }) {
  const location = useLocation()
  const currentUrl = location.pathname + location.search
  const groupIsActive = isNavEntryActive(group, currentUrl)
  const [expanded, setExpanded] = useState(groupIsActive)

  useEffect(() => {
    if (groupIsActive) setExpanded(true)
  }, [groupIsActive])

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center justify-between w-full',
          'px-3 py-2 mt-3 first:mt-0 rounded-md',
          'text-[11px] font-semibold uppercase tracking-wider',
          'text-gray-400 dark:text-gray-500',
          'hover:text-gray-600 dark:hover:text-gray-400',
          'cursor-pointer select-none transition-colors duration-150',
        )}
      >
        <div className="flex items-center gap-2">
          <group.icon
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              groupIsActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            )}
            strokeWidth={1.5}
          />
          <span>{group.name}</span>
        </div>
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-gray-400',
            'transition-transform duration-150',
            expanded && 'rotate-90',
          )}
          strokeWidth={1.5}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-0.5 ml-[13px] pl-3 border-l border-gray-200 dark:border-gray-700/50 space-y-0.5">
            {group.children.map((child) => (
              <MobileLeafItem key={child.href} item={child} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Mobile Module Drawer
   ============================================ */

function MobileModuleDrawer({
  moduleConfig,
  filteredItems,
  isHome,
}: {
  moduleConfig: ModuleNavConfig
  filteredItems: ModuleNavEntry[]
  isHome?: boolean
}) {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()
  const location = useLocation()

  useEffect(() => {
    setSidebarMobileOpen(false)
  }, [location.pathname, location.search, setSidebarMobileOpen])

  const handleClose = useCallback(() => {
    setSidebarMobileOpen(false)
  }, [setSidebarMobileOpen])

  if (!sidebarMobileOpen) return null

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
          <div className="flex items-center gap-2 min-w-0">
            {isHome ? (
              <>
                <img src="/logo.svg" alt="PaperBook" className="h-5 w-5 shrink-0" />
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  PaperBook
                </span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <moduleConfig.icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {moduleConfig.name}
                </span>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-3rem)]">
          <nav className="px-3 py-3">
            <div className="space-y-0.5">
              {filteredItems.map((entry) =>
                entry.type === 'group' ? (
                  <MobileNavGroup
                    key={entry.name}
                    group={entry}
                    onNavigate={handleClose}
                  />
                ) : (
                  <MobileLeafItem
                    key={entry.href}
                    item={entry}
                    isHome={isHome}
                    onNavigate={handleClose}
                  />
                )
              )}
            </div>
          </nav>
        </ScrollArea>
      </div>
    </>
  )
}

/* ============================================
   Render a single ModuleNavEntry (expanded)
   ============================================ */

function ExpandedNavEntry({ entry, isHome }: { entry: ModuleNavEntry; isHome?: boolean }) {
  if (entry.type === 'group') {
    return <ExpandedNavGroup group={entry} isHome={isHome} />
  }
  return <ExpandedLeafItem item={entry} isHome={isHome} />
}

/* ============================================
   Render a single ModuleNavEntry (collapsed)
   ============================================ */

function CollapsedNavEntry({ entry, isHome }: { entry: ModuleNavEntry; isHome?: boolean }) {
  if (entry.type === 'group') {
    return <CollapsedNavGroup group={entry} />
  }
  return <CollapsedLeafItem item={entry} isHome={isHome} />
}

/* ============================================
   Filter entries by role
   ============================================ */

function filterEntriesByRole(items: ModuleNavEntry[], hasRole: (roles: Role[]) => boolean): ModuleNavEntry[] {
  return items
    .filter((entry) => !entry.roles || hasRole(entry.roles))
    .map((entry) => {
      if (entry.type === 'group') {
        return {
          ...entry,
          children: entry.children.filter((child) => !child.roles || hasRole(child.roles)),
        }
      }
      return entry
    })
    .filter((entry) => entry.type !== 'group' || (entry as ModuleNavGroup).children.length > 0)
}

/* ============================================
   Main ModuleSidebar Export
   ============================================ */

export function ModuleSidebar() {
  const location = useLocation()
  const { hasRole } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const moduleConfig = getModuleFromPath(location.pathname)

  // Use module config if found, otherwise fall back to home nav
  const isHome = !moduleConfig
  const activeConfig = moduleConfig ?? HOME_NAV

  // Filter items by role
  const filteredItems = filterEntriesByRole(activeConfig.items, hasRole)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col lg:flex',
          'bg-gray-50 dark:bg-gray-900',
          'border-r border-gray-200 dark:border-gray-800',
          'transition-[width] duration-200 ease-in-out'
        )}
        style={{ width: sidebarCollapsed ? 56 : 240 }}
      >
        {/* Module identity header */}
        <div
          className={cn(
            'flex h-12 items-center border-b border-gray-200 dark:border-gray-800 shrink-0',
            sidebarCollapsed ? 'justify-center px-2' : 'px-4 gap-2.5'
          )}
        >
          <Link to={activeConfig.basePath} className="flex items-center gap-2.5 min-w-0">
            {isHome ? (
              <>
                <img
                  src="/logo.svg"
                  alt="PaperBook"
                  className="h-7 w-7 shrink-0"
                />
                {!sidebarCollapsed && (
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    PaperBook
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <activeConfig.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                </div>
                {!sidebarCollapsed && (
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {activeConfig.name}
                  </span>
                )}
              </>
            )}
          </Link>
        </div>

        {/* Module Navigation */}
        <ScrollArea className="flex-1">
          <nav className={cn('py-3', sidebarCollapsed ? 'px-1.5' : 'px-3')}>
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-1">
                {filteredItems.map((entry) => (
                  <CollapsedNavEntry
                    key={entry.type === 'group' ? entry.name : entry.href}
                    entry={entry}
                    isHome={isHome}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredItems.map((entry) => (
                  <ExpandedNavEntry
                    key={entry.type === 'group' ? entry.name : entry.href}
                    entry={entry}
                    isHome={isHome}
                  />
                ))}
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Collapse toggle button at bottom */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center justify-center rounded-md',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              'dark:hover:text-gray-300 dark:hover:bg-white/5',
              'transition-colors duration-150',
              sidebarCollapsed ? 'w-9 h-8 mx-auto' : 'w-full h-8 gap-2 px-2'
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
      <MobileModuleDrawer moduleConfig={activeConfig} filteredItems={filteredItems} isHome={isHome} />
    </>
  )
}
