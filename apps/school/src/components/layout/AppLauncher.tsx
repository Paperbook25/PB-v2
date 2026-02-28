import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useAddonStore, type AddonInfo } from '@/stores/useAddonStore'

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
   AppLauncher Component
   ============================================ */

export function AppLauncher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const addons = useAddonStore((state) => state.addons)
  const enabledSlugs = useAddonStore((state) => state.enabledSlugs)

  const enabledAddons = addons.filter((a) => enabledSlugs.includes(a.slug))
  const categories = groupByCategory(enabledAddons)

  const handleTileClick = (slug: string) => {
    const route = ROUTE_MAP[slug]
    if (route) {
      navigate(route)
      setOpen(false)
    }
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
        className="w-[320px] p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        {categories.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            No addons enabled
          </div>
        ) : (
          categories.map((group) => (
            <div key={group.category}>
              {/* Category label */}
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1.5 mt-2 first:mt-0">
                {group.label}
              </div>

              {/* Tile grid: 3 columns */}
              <div className="grid grid-cols-3 gap-1">
                {group.items.map((addon) => {
                  const IconComponent = addon.icon ? ICON_MAP[addon.icon] : null
                  return (
                    <button
                      key={addon.id}
                      onClick={() => handleTileClick(addon.slug)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {IconComponent ? (
                          <IconComponent className="h-5 w-5" strokeWidth={1.75} />
                        ) : (
                          <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight">
                        {addon.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
