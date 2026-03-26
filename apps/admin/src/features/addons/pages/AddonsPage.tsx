import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Puzzle,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Star,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Package,
  FolderOpen,
  Trophy,
  Shield,
  Globe,
  MessageCircle,
  Heart,
  Eye,
  Blocks,
  Warehouse,
  Award,
  MessageSquareWarning,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, GraduationCap, ClipboardCheck, Bus, Building2, Package,
  FolderOpen, Trophy, Shield, Globe, MessageCircle, Heart, Eye,
  Users, Blocks, Warehouse, Puzzle, Star, Award, MessageSquareWarning,
  UserCheck,
}

interface Addon {
  id: string
  name: string
  slug: string
  description: string | null
  icon?: string | null
  category?: string | null
  isCore: boolean
  enabled?: boolean
  enabledAt?: string | null
  enabledBy?: string | null
  schoolCount?: number
  usageCount?: number
  availableTiers?: string[]
  isActive?: boolean
}

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 border-gray-200',
  starter: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
}

const allTiers = ['free', 'starter', 'professional', 'enterprise']

export function AddonsPage() {
  const queryClient = useQueryClient()

  const addonsQuery = useQuery({
    queryKey: ['admin', 'addons'],
    queryFn: adminApi.listAddons,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAddon(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] }),
  })

  const addons: Addon[] = addonsQuery.data || []

  const handleToggleTier = (addon: Addon, tier: string) => {
    const currentTiers = addon.availableTiers || []
    const newTiers = currentTiers.includes(tier)
      ? currentTiers.filter((t) => t !== tier)
      : [...currentTiers, tier]

    updateMutation.mutate({
      id: addon.id,
      data: { availableTiers: newTiers },
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Addons</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform addons and their availability across plan tiers
        </p>
      </div>

      {/* Content */}
      {addonsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading addons...</span>
          </div>
        </div>
      ) : addonsQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load addons. Please try again.
        </div>
      ) : addons.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
          <Puzzle className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No addons configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="rounded-lg border bg-card p-5 transition-shadow hover:shadow-sm"
            >
              {/* Addon Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {(() => {
                    const IconComponent = addon.icon ? ICON_MAP[addon.icon] : null
                    return IconComponent
                      ? <IconComponent className="h-5 w-5 text-primary" />
                      : <Puzzle className="h-5 w-5 text-primary" />
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{addon.name}</h3>
                    {addon.isActive && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {addon.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    <span className="font-semibold text-foreground">{addon.usageCount ?? 0}</span> schools using
                  </span>
                </div>
                {addon.category && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {addon.category}
                  </span>
                )}
              </div>

              {/* Tier Toggles */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Available Tiers</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTiers.map((tier) => {
                    const isEnabled = (addon.availableTiers || []).includes(tier)
                    return (
                      <button
                        key={tier}
                        onClick={() => handleToggleTier(addon, tier)}
                        disabled={updateMutation.isPending}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                          isEnabled
                            ? tierColors[tier] || 'bg-primary/10 text-primary border-primary/20'
                            : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                        } disabled:opacity-60`}
                      >
                        {isEnabled && <Star className="mr-1 inline h-2.5 w-2.5" />}
                        {tier}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
