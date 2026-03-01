import { Moon, Sun, Menu, LogOut, User, Settings, Bot } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getInitials } from '@/lib/utils'
import { useNavigate, useLocation } from 'react-router-dom'
import { NotificationCenter } from './NotificationCenter'
import { AppLauncher } from './AppLauncher'
import { getModuleFromPath } from '@/config/module-nav'

function roleBadgeLabel(role?: string): string {
  if (!role) return 'User'
  const map: Record<string, string> = {
    admin: 'Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    accountant: 'Accountant',
    librarian: 'Librarian',
    transport_manager: 'Transport',
    student: 'Student',
    parent: 'Parent',
  }
  return map[role] || role.charAt(0).toUpperCase() + role.slice(1)
}

export function Header() {
  const { theme, setTheme, setSidebarMobileOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const activeModule = getModuleFromPath(location.pathname)

  const handleLogout = async () => {
    await signOut().catch(() => {})
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 lg:px-5">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 shrink-0"
          onClick={() => setSidebarMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Brand name */}
        <span className="hidden lg:inline text-sm font-semibold text-gray-900 dark:text-gray-100">
          PaperBook
        </span>

        {/* Separator */}
        <div className="hidden lg:block w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Active module indicator OR role badge */}
        {activeModule ? (
          <div className="hidden lg:inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5">
            <activeModule.icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {activeModule.name}
            </span>
          </div>
        ) : user?.role ? (
          <span className="hidden lg:inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
            {roleBadgeLabel(user.role)}
          </span>
        ) : null}

        {/* Mobile: module name or brand */}
        {activeModule ? (
          <div className="lg:hidden flex items-center gap-1.5">
            <activeModule.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeModule.name}
            </span>
          </div>
        ) : (
          <span className="lg:hidden text-sm font-semibold text-gray-900 dark:text-gray-100">
            PaperBook
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* App Launcher */}
        <AppLauncher />

        {/* AI Assistant */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => useUIStore.getState().toggleAgentChat()}
          title="AI Assistant (Cmd+J)"
        >
          <Bot className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
