import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  theme: Theme
  commandPaletteOpen: boolean
  agentChatOpen: boolean

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  openAgentChat: () => void
  closeAgentChat: () => void
  toggleAgentChat: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: 'light',
      commandPaletteOpen: false,
      agentChatOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', prefersDark)
        }
        set({ theme })
      },
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      openAgentChat: () => set({ agentChatOpen: true }),
      closeAgentChat: () => set({ agentChatOpen: false }),
      toggleAgentChat: () => set((state) => ({ agentChatOpen: !state.agentChatOpen })),
    }),
    {
      name: 'paperbook-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)

// Optimized selectors to prevent unnecessary re-renders
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed)
export const useSidebarMobileOpen = () => useUIStore((state) => state.sidebarMobileOpen)
export const useTheme = () => useUIStore((state) => state.theme)
export const useCommandPaletteOpen = () => useUIStore((state) => state.commandPaletteOpen)
export const useAgentChatOpen = () => useUIStore((state) => state.agentChatOpen)
export const useUIActions = () =>
  useUIStore(
    useShallow((state) => ({
      toggleSidebar: state.toggleSidebar,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setSidebarMobileOpen: state.setSidebarMobileOpen,
      setTheme: state.setTheme,
      openCommandPalette: state.openCommandPalette,
      closeCommandPalette: state.closeCommandPalette,
      toggleCommandPalette: state.toggleCommandPalette,
      openAgentChat: state.openAgentChat,
      closeAgentChat: state.closeAgentChat,
      toggleAgentChat: state.toggleAgentChat,
    }))
  )
