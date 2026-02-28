import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  Bus,
  IndianRupee,
  Settings,
  Search,
  Plus,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUIStore } from '@/stores/useUIStore'
import { cn } from '@/lib/utils'

const quickActions = [
  {
    id: 'new-student',
    label: 'Add New Student',
    icon: Plus,
    shortcut: '⌘S',
    action: '/students/new',
  },
  {
    id: 'mark-attendance',
    label: 'Mark Attendance',
    icon: ClipboardCheck,
    shortcut: '⌘A',
    action: '/attendance',
  },
  {
    id: 'collect-fee',
    label: 'Collect Fee',
    icon: IndianRupee,
    shortcut: '⌘F',
    action: '/finance/collection',
  },
  {
    id: 'new-admission',
    label: 'New Admission',
    icon: UserPlus,
    shortcut: '⌘N',
    action: '/admissions/new',
  },
]

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: '/' },
  { id: 'admissions', label: 'Admissions', icon: UserPlus, action: '/admissions' },
  { id: 'students', label: 'Students', icon: GraduationCap, action: '/students' },
  { id: 'staff', label: 'Staff', icon: Users, action: '/staff' },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, action: '/attendance' },
  { id: 'library', label: 'Library', icon: BookOpen, action: '/library' },
  { id: 'transport', label: 'Transport', icon: Bus, action: '/transport' },
  { id: 'finance', label: 'Finance', icon: IndianRupee, action: '/finance' },
  { id: 'settings', label: 'Settings', icon: Settings, action: '/settings' },
]

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('')
    }
  }, [commandPaletteOpen])

  const handleSelect = (action: string) => {
    closeCommandPalette()
    navigate(action)
  }

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={closeCommandPalette}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions">
              {quickActions.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => handleSelect(item.action)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                    {item.shortcut}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Navigation">
              {navigation.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => handleSelect(item.action)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
