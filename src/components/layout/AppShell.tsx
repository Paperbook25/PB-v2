import { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from './CommandPalette'
import { AgentChatDrawer } from './AgentChat/AgentChatDrawer'
import { useUIStore, useSidebarCollapsed } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAddonStore } from '@/stores/useAddonStore'
import { apiGet } from '@/lib/api-client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const SIDEBAR_WIDTH_EXPANDED = 220
const SIDEBAR_WIDTH_COLLAPSED = 56
const LG_BREAKPOINT = 1024

interface AppShellProps {
  children: ReactNode
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= LG_BREAKPOINT : true
  )

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export function AppShell({ children }: AppShellProps) {
  const { theme } = useUIStore()
  const sidebarCollapsed = useSidebarCollapsed()
  const isDesktop = useIsDesktop()
  const setAddons = useAddonStore(state => state.setAddons)
  const user = useAuthStore(state => state.user)

  // Fetch addons when user is logged in
  useEffect(() => {
    if (user) {
      apiGet<{ addons: any[] }>('/api/addons')
        .then(data => setAddons(data.addons))
        .catch(() => {}) // silent fail, use cached data
    }
  }, [user, setAddons])

  // Apply theme on mount and change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [theme])

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useUIStore.getState().openCommandPalette()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        useUIStore.getState().toggleAgentChat()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const marginLeft = isDesktop
    ? sidebarCollapsed
      ? SIDEBAR_WIDTH_COLLAPSED
      : SIDEBAR_WIDTH_EXPANDED
    : 0

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area - offset by sidebar width on desktop, full width on mobile */}
        <div
          style={{ marginLeft }}
          className="transition-[margin] duration-200 ease-in-out flex flex-col min-h-screen"
        >
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        {/* Command Palette */}
        <CommandPalette />

        {/* AI Agent Chat Drawer */}
        <AgentChatDrawer />
      </div>
    </TooltipProvider>
  )
}
