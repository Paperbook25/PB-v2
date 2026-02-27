import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AddonInfo {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  category: string
  isCore: boolean
  sortOrder: number
  enabled: boolean
}

interface AddonState {
  addons: AddonInfo[]
  enabledSlugs: string[]
  loaded: boolean
  setAddons: (addons: AddonInfo[]) => void
  setEnabledSlugs: (slugs: string[]) => void
  isAddonEnabled: (slug: string) => boolean
}

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      addons: [],
      enabledSlugs: [],
      loaded: false,
      setAddons: (addons) => set({
        addons,
        enabledSlugs: addons.filter(a => a.enabled).map(a => a.slug),
        loaded: true,
      }),
      setEnabledSlugs: (slugs) => set({ enabledSlugs: slugs }),
      isAddonEnabled: (slug) => get().enabledSlugs.includes(slug),
    }),
    {
      name: 'paperbook-addons',
      partialize: (state) => ({
        enabledSlugs: state.enabledSlugs,
      }),
    }
  )
)
